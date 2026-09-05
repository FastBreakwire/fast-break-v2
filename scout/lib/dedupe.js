/**
 * Stage 3 — DEDUPE.
 *
 * Mechanical clustering only (entity overlap + time window + headline
 * token similarity), exactly as scoped in the spec — "LLM only for
 * borderline cases". No ANTHROPIC_API_KEY is configured in this
 * environment (checked at spec time), so the borderline-adjudication step
 * degrades to the conservative default: when the mechanical signal is
 * ambiguous, candidates are kept SEPARATE rather than force-merged, and
 * flagged so a human can see exactly which ones the Scout wasn't sure
 * about. A false "kept separate" costs a duplicate line in the report; a
 * false merge would quietly hide a real second story. The conservative
 * default is deliberate.
 */

const TIME_WINDOW_MS = 48 * 60 * 60 * 1000; // 48h, per the spec's dedupe example

function headlineTokens(headline) {
  return new Set(
    headline
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3) // drop short stopword-ish noise (to, for, the, ...)
  );
}

function tokenOverlapRatio(a, b) {
  const setA = headlineTokens(a);
  const setB = headlineTokens(b);
  if (!setA.size || !setB.size) return 0;
  let shared = 0;
  for (const t of setA) if (setB.has(t)) shared++;
  return shared / Math.min(setA.size, setB.size);
}

function entityOverlap(a, b) {
  const teamsA = new Set(a.entities.teams);
  const teamsB = new Set(b.entities.teams);
  const playersA = new Set(a.entities.players);
  const playersB = new Set(b.entities.players);
  const sharedTeams = [...teamsA].some(t => teamsB.has(t));
  const sharedPlayers = [...playersA].some(p => playersB.has(p));
  return sharedTeams || sharedPlayers;
}

function withinTimeWindow(a, b) {
  const ta = Date.parse(a.sources[0].publishedAt || a.discoveredAt);
  const tb = Date.parse(b.sources[0].publishedAt || b.discoveredAt);
  if (Number.isNaN(ta) || Number.isNaN(tb)) return true; // can't disprove overlap — don't block a merge on missing dates alone
  return Math.abs(ta - tb) <= TIME_WINDOW_MS;
}

/**
 * @param {Array} candidates normalized candidates, one per raw item
 * @returns {Array} deduped candidates — merged clusters keep the earliest
 *   candidate as the "keeper" and fold every other cluster member's
 *   sources[] into it; each source keeps its own publishedAt untouched.
 */
function dedupeCandidates(candidates) {
  const clusters = []; // [{ keeper, members: [...] }]

  for (const cand of candidates) {
    let placed = false;
    for (const cluster of clusters) {
      const keeper = cluster.keeper;
      if (keeper.league !== cand.league) continue;
      if (!withinTimeWindow(keeper, cand)) continue;

      const similarity = tokenOverlapRatio(keeper.headline, cand.headline);
      const sameEntity = entityOverlap(keeper, cand);

      // High-confidence merge: strong headline overlap AND a shared entity.
      if (similarity >= 0.45 && sameEntity) {
        cluster.members.push(cand);
        placed = true;
        break;
      }
      // Borderline: only one of the two signals fired. Kept separate (see
      // file header) but flagged for human visibility.
      if ((similarity >= 0.3 && similarity < 0.45) || (sameEntity && similarity > 0 && similarity < 0.3)) {
        cand.qualityFlags = [...(cand.qualityFlags || []), `borderline_dupe_of:${keeper.candidateId}`];
      }
    }
    if (!placed) clusters.push({ keeper: cand, members: [] });
  }

  return clusters.map(({ keeper, members }) => {
    if (!members.length) return keeper;
    const allSources = [keeper, ...members].flatMap(c => c.sources);
    return {
      ...keeper,
      sources: allSources,
      clusterSize: allSources.length
    };
  });
}

module.exports = { dedupeCandidates, tokenOverlapRatio, entityOverlap, TIME_WINDOW_MS };
