/**
 * Stage 5 — VERIFY.
 *
 * Honest about its own limits (per the spec): this can determine which
 * source in a cluster is likely the original, confirm that source's link
 * actually resolves, and count independent corroboration — it cannot
 * establish ground truth beyond what reporting says. "confirmed" here
 * means "a tier-1 (official) source is present in the cluster", never
 * "the model believes it".
 */

function pickPrimarySource(sources) {
  // Earliest timestamp, tie-broken by lowest tier number (1 = most official).
  const withTime = sources.map(s => ({ ...s, _t: Date.parse(s.publishedAt || '') }));
  withTime.sort((a, b) => {
    const ta = Number.isNaN(a._t) ? Infinity : a._t;
    const tb = Number.isNaN(b._t) ? Infinity : b._t;
    if (ta !== tb) return ta - tb;
    return a.tier - b.tier;
  });
  return withTime[0];
}

/**
 * Opens the primary source URL and does a light content sanity check —
 * does the page actually respond, and does it plausibly contain the
 * story's own subject matter. This is NOT a fact-checker; it only catches
 * dead links and obviously mismatched pages.
 */
async function openAndSanityCheck(url, headline) {
  if (!url) return { reachable: false, contentPlausible: false, note: 'no URL to check' };
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { reachable: false, contentPlausible: false, note: `HTTP ${res.status}` };
    const html = await res.text();
    // Weak but honest signal: does at least one distinctive headline word
    // (>4 chars) show up on the page at all.
    const keyWords = headline.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 4);
    const plausible = keyWords.some(w => html.toLowerCase().includes(w));
    return { reachable: true, contentPlausible: plausible, note: plausible ? 'headline terms found on page' : 'page loaded but no headline terms matched — check manually' };
  } catch (err) {
    return { reachable: false, contentPlausible: false, note: err.message || String(err) };
  }
}

const STRICT_CATEGORIES = new Set(['trade', 'contract', 'injury', 'legal', 'investigation']);

async function verifyCandidate(cand) {
  const primary = pickPrimarySource(cand.sources);
  const tier1Present = cand.sources.some(s => s.tier === 1);
  const independentOutlets = new Set(cand.sources.map(s => s.outlet)).size;

  const check = await openAndSanityCheck(primary.url, cand.headline);

  let statusConfidence = 0.3; // baseline for a single unverified source
  if (independentOutlets >= 2) statusConfidence += 0.25;
  if (independentOutlets >= 3) statusConfidence += 0.15;
  if (tier1Present) statusConfidence += 0.25;
  if (check.reachable && check.contentPlausible) statusConfidence += 0.1;
  statusConfidence = Math.min(0.95, statusConfidence); // never claim full certainty — always a human's final call

  let status = cand.status;
  if (tier1Present) {
    status = 'confirmed';
  } else if (STRICT_CATEGORIES.has(cand.category) && independentOutlets < 2) {
    // Extra caution on the categories the spec calls out by name — a
    // single-source trade/contract/injury/legal/investigation item never
    // gets to call itself more than a report, no matter how it read.
    status = 'report';
    statusConfidence = Math.min(statusConfidence, 0.5);
  }

  return {
    ...cand,
    status,
    statusConfidence: Math.round(statusConfidence * 100) / 100,
    primarySourceUrl: primary.url,
    sources: cand.sources.map(s => ({ ...s, isPrimary: s.url === primary.url && s.outlet === primary.outlet })),
    verification: {
      attempted: true,
      method: `primary-source fetch + cross-check across ${independentOutlets} outlet(s)`,
      result: check.reachable ? (check.contentPlausible ? 'corroborated' : 'reachable_unverified_content') : 'unreachable',
      notes: check.note + (STRICT_CATEGORIES.has(cand.category) ? ' — strict category, held to a higher corroboration bar' : '')
    }
  };
}

module.exports = { verifyCandidate, pickPrimarySource };
