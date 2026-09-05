/**
 * Stage 7 — PRIORITIZE.
 *
 * URGENT/HIGH/NORMAL/LOW is not a third independent score — it's a
 * redactional compression of socialRelevanceScore + breaking-ness, exactly
 * as scoped: "keine dritte unabhängige Bewertung".
 */

const { hoursSince } = require('./score');

const URGENT_SOCIAL_THRESHOLD = 85;
const HIGH_SOCIAL_THRESHOLD = 65;
const WEBSITE_FLOOR = 50; // below this, a candidate is LOW regardless of social score
const BREAKING_WINDOW_HOURS = 4;
// If a cluster's sources span more than this, it reads as an ongoing/
// developing story being re-reported over time rather than one fresh
// breaking moment — even if the earliest (primary) timestamp happens to
// still fall inside the breaking window by itself.
const MAX_BREAKING_SOURCE_SPREAD_HOURS = 20;

/**
 * V1.1: URGENT now also checks the spread between the cluster's sources,
 * not just the primary source's own age. discoveredAt (when the Scout
 * itself found it, set once in normalize.js) and each source's own
 * publishedAt stay exactly as separate as before — this only adds a
 * second read of the SAME already-separate timestamps, it doesn't blend
 * them.
 */
function isGenuinelyBreaking(cand) {
  const primary = cand.sources.find(s => s.isPrimary) || cand.sources[0];
  const ageHours = hoursSince(primary.publishedAt || cand.discoveredAt);
  if (ageHours > BREAKING_WINDOW_HOURS) return false;

  const timestamps = cand.sources
    .map(s => Date.parse(s.publishedAt || ''))
    .filter(t => !Number.isNaN(t));
  if (timestamps.length < 2) return true; // nothing to compare against — age check above already gates this
  const spreadHours = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60);
  // A wide spread means some outlet picked this up long after the first —
  // a developing story, not a single fresh breaking moment. Downgraded to
  // HIGH rather than URGENT even though the primary source is still recent.
  return spreadHours <= MAX_BREAKING_SOURCE_SPREAD_HOURS;
}

function prioritizeCandidate(cand) {
  const isBreaking = isGenuinelyBreaking(cand);

  let priority;
  let action;

  if (cand.websiteRelevanceScore < WEBSITE_FLOOR) {
    priority = 'LOW';
    action = 'IGNORE';
  } else if (cand.socialRelevanceScore >= URGENT_SOCIAL_THRESHOLD && isBreaking) {
    priority = 'URGENT';
    action = 'POST NOW';
  } else if (cand.socialRelevanceScore >= HIGH_SOCIAL_THRESHOLD) {
    priority = 'HIGH';
    action = 'POST TODAY';
  } else if (cand.websiteRelevanceScore >= WEBSITE_FLOOR) {
    priority = 'NORMAL';
    action = 'WEBSITE ONLY';
  } else {
    priority = 'LOW';
    action = 'IGNORE';
  }

  return { ...cand, priority, action };
}

module.exports = { prioritizeCandidate, URGENT_SOCIAL_THRESHOLD, HIGH_SOCIAL_THRESHOLD, WEBSITE_FLOOR, BREAKING_WINDOW_HOURS };
