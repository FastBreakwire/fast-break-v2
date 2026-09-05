/**
 * Stage 6 — SCORE.
 *
 * websiteRelevanceScore and socialRelevanceScore are two separate 0-100
 * formulas with different inputs on purpose (spec correction request:
 * "diese Scores dürfen nicht einfach identisch sein"). Neither formula
 * ever reads existingAsset/imagePotential/videoPotential — those fields
 * are computed in a later stage and are architecturally invisible here,
 * so an existing image can never inflate either score.
 */

function hoursSince(dateStr) {
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return 999;
  return Math.max(0, (Date.now() - t) / (1000 * 60 * 60));
}

function decay(hours, halfLifeHours) {
  return Math.pow(0.5, hours / halfLifeHours);
}

const LOW_NOVELTY_CATEGORIES = new Set(['roster', 'standings', 'match']);
const ROUTINE_PATTERN = /exhibit[- ]?10|practice squad|two-way contract|standard preview|training camp roster/i;

// V1.1.1: narrative signal used to be "count keyword hits, 8pts each,
// capped at 24" — every keyword worth the same regardless of what it
// meant. Fast Break's own stated priority list treats these as distinct,
// unequally-important story types (a comeback/return is named at the same
// tier as a trade; a milestone/record is its own line item), so this now
// checks by CATEGORY and awards each category's weight once, not once per
// synonym that happens to fire ("is back" and "back in the" describing the
// same comeback no longer double-count). This is a re-weighting to match
// Fast Break's own explicit list, not a rule about any specific story.
// V1.2: "comeback" now also carries an `exclude` — "back in the [league]"
// after an explicit multi-year gap ("Life back in the Premier League after
// 25 years away" — Coventry City's promotion, found in a real live run) is
// a CLUB's return to a competition, not an individual player's comeback,
// which is what the rest of this pattern is meant to catch (e.g. "Ben
// Simmons is back in the NBA"). A genuine player comeback is essentially
// never framed in years in the same breath; a club's multi-season absence
// from a competition routinely is. When `exclude` matches, this category
// is not counted even though `pattern` also matched.
const NARRATIVE_CATEGORIES = [
  {
    flag: 'comeback', weight: 20,
    pattern: /\bcomeback\b|\breturn(s|ing)?\b|\bis back\b|\bback in the\b/i,
    exclude: /\bback in the\b[^.]{0,40}\bafter\s+\d+\s+years?\b/i
  },
  { flag: 'controversy', weight: 18, pattern: /\bcontrovers|\bsuspend|\bfine[sd]?\b|\bban(ned)?\b|\bfeud\b/i },
  { flag: 'record', weight: 16, pattern: /\brecord\b|\bhistoric\b|\bmilestone\b/i },
  { flag: 'surprise', weight: 12, pattern: /\bsurpris|\bshock|\bunexpected|\bstuns?\b/i },
  { flag: 'other_narrative', weight: 8, pattern: /\bemotional\b|\ball-star\b|\bmvp\b|\bretire[sd]?\b|\brelease[sd]?\b|\bbuyout\b/i }
];

// V1.1: the story's category now carries most of the social weight
// directly (previously most weight sat on star-power/entity presence,
// which is exactly "nur den Namen bewerten" — the thing this was asked
// to stop doing). These weights encode Fast Break's own stated priority
// list (large trades/transfers/signings, comebacks, controversies,
// records) as base points BEFORE narrative/star/breaking are added, so a
// big trade with weak narrative language still starts from a high floor,
// and a routine roster move starts from a low one regardless of any
// keyword luck.
const CATEGORY_SOCIAL_WEIGHT = {
  trade: 28,
  transfer: 26,
  investigation: 24,
  legal: 20,
  signing: 22,
  contract: 18,
  injury: 16,
  results: 8,
  league: 8,
  match: 4,
  roster: 4,
  standings: 2
};

// Question-/reaction-/engagement-style headlines that discuss an existing
// story rather than report it fresh ("Would You Have...", "Armchair GMs",
// "Fans React", "Power Rankings", "Predicting..."). These are not banned —
// they can still be real social candidates — but they are a comment ON
// news, not the news, and must not outrank the actual story they're
// about. Applied as a multiplier, not a hard cap, further down.
const ENGAGEMENT_BAIT_PATTERN = /\b(would you have|should .*have|your take|fans react|armchair|vote for|vote:|poll:|vs\.\s*your|vs\. your|ranking the|power rankings|bold predictions?|predicting|who (will|should)|what if|debate:)\b/i;
const ENGAGEMENT_BAIT_DISCOUNT = 0.65;

function starPowerScore(cand) {
  // Pragmatic proxy, not a real fame database (documented limitation) —
  // deliberately a SMALL slice of the total score now, not the dominant
  // one: a recognized team from the curated list, plus how many distinct
  // player-name-shaped tokens were found, both nudge this up a little.
  let score = 0;
  if (cand.entities.teams.length) score += 6;
  score += Math.min(8, cand.entities.players.length * 4);
  return Math.min(14, score);
}

function narrativeScore(text) {
  const matched = NARRATIVE_CATEGORIES.filter(c => c.pattern.test(text) && !(c.exclude && c.exclude.test(text)));
  const total = matched.reduce((sum, c) => sum + c.weight, 0);
  return { points: Math.min(30, total), flags: matched.map(c => c.flag) };
}

function scoreCandidate(cand) {
  const text = `${cand.headline} ${cand.summary}`;
  const primaryPublished = cand.sources.find(s => s.isPrimary) || cand.sources[0];
  const ageHours = hoursSince(primaryPublished.publishedAt || cand.discoveredAt);

  // ---- Website score ----
  const recencyPts = 25 * decay(ageHours, 36); // half-life 36h — website content stays relevant for days
  const confirmationBase = { confirmed: 25, report: 15, scheduled: 10 }[cand.status] ?? 12;
  const confirmationPts = cand.status === 'confirmed'
    ? confirmationBase
    : confirmationBase * (0.5 + (cand.statusConfidence || 0.3) / 2);
  const outlets = new Set(cand.sources.map(s => s.outlet)).size;
  const corroborationPts = outlets >= 3 ? 20 : outlets === 2 ? 12 : 5;
  const leagueBaselinePts = 10; // flat — every one of the 8 competitions gets this floor, per spec
  const noveltyPts = LOW_NOVELTY_CATEGORIES.has(cand.category) ? 2 : 8;

  const websiteRelevanceScore = Math.round(
    Math.min(100, recencyPts + confirmationPts + corroborationPts + leagueBaselinePts + noveltyPts)
  );

  // ---- Social score — different inputs, deliberately, and the story is
  // scored as a whole (category + narrative + breaking) rather than
  // mostly off whether a player name was detected. ----
  const categoryPts = CATEGORY_SOCIAL_WEIGHT[cand.category] ?? 8;
  const starPts = starPowerScore(cand);
  const narrative = narrativeScore(text);
  const breakingPts = 20 * decay(ageHours, 6); // half-life 6h — social cares far more about freshness

  let socialRelevanceScore = Math.round(Math.min(100, categoryPts + starPts + narrative.points + breakingPts));

  const isEngagementBait = ENGAGEMENT_BAIT_PATTERN.test(cand.headline);
  if (isEngagementBait) {
    socialRelevanceScore = Math.round(socialRelevanceScore * ENGAGEMENT_BAIT_DISCOUNT);
  }

  // Hard exclusion patterns (spec section 5's explicit "Social-NO" list) —
  // capped regardless of how the components above summed.
  const isRoutine = LOW_NOVELTY_CATEGORIES.has(cand.category) || ROUTINE_PATTERN.test(text);
  if (isRoutine) socialRelevanceScore = Math.min(socialRelevanceScore, 40);

  return {
    ...cand,
    websiteRelevanceScore,
    socialRelevanceScore,
    qualityFlags: [
      ...cand.qualityFlags,
      ...narrative.flags.map(f => `narrative:${f}`),
      ...(isRoutine ? ['routine_low_social'] : []),
      ...(isEngagementBait ? ['engagement_bait_discounted'] : [])
    ]
  };
}

module.exports = { scoreCandidate, hoursSince, decay };
