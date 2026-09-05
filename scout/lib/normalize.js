/**
 * Stage 2 — NORMALIZE.
 *
 * Turns one raw RSS item into one Candidate (the schema from the approved
 * V1 spec). No scoring happens here — this stage only figures out WHAT a
 * story is (league, sport, category, rough status, entities), never how
 * good it is.
 *
 * discoveredAt vs sources[].publishedAt (spec correction #1):
 *   discoveredAt is set to the moment THIS run processed the item — it is
 *   never copied from the feed's own pubDate. The feed's own timestamp
 *   lives only inside sources[].publishedAt, per source, and is never
 *   overwritten or averaged away.
 */

const crypto = require('crypto');
const { SUPPLEMENTAL_TEAMS } = require('./teamRegistry');

const CATEGORY_RULES = [
  // Checked in order — first match wins. Keyword lists are intentionally
  // small and literal; this is a heuristic, not an NLP model, and is
  // documented as such in the report's "known limitations" section.
  { category: 'trade', pattern: /\btrad(e|ed|es|ing)\b|\bacquir(e|ed|es)\b/i },
  { category: 'transfer', pattern: /\btransfer(red|s)?\b|\bloan\b|\bmove to\b|\bjoins\b.*\bfrom\b/i },
  { category: 'signing', pattern: /\bsign(s|ed|ing)?\b|\bagrees? to\b|\bcontract extension\b|\bre-signs?\b/i },
  // "set for return"/"ready to return" catches comeback-from-injury follow-
  // up headlines that don't repeat the word "injury" itself (the injury
  // context is usually established in earlier coverage) — found in testing
  // via a real Bundesliga headline ("Musiala set for return per report")
  // that fell all the way through to the generic 'league' bucket without
  // this. Generalizes to any player in this situation, not that one.
  { category: 'injury', pattern: /\binjur(y|ed|ies)\b|\bout for\b|\bsurgery\b|\bacl\b|\bsidelined\b|\bset for return\b|\bready to return\b|\bexpected back\b|\bcleared to (play|return)\b/i },
  { category: 'contract', pattern: /\bextension\b|\bbuyout\b|\brestructur/i },
  { category: 'investigation', pattern: /\binvestigat/i },
  { category: 'legal', pattern: /\blawsuit\b|\bcharg(e|ed|es)\b|\barrest/i },
  { category: 'roster', pattern: /\bwaive[sd]?\b|\bcut\b|\broster\b|\bpractice squad\b|\bexhibit[- ]?10\b|\bcallup\b|\bcall-up\b/i },
  { category: 'standings', pattern: /\bstandings\b|\btable\b|\bclinch/i },
  // V1.2: checked BEFORE 'results' — found via a real false positive
  // ("Man City v Coventry: Key stats and talking points" landed as
  // 'results' because its own SUMMARY happened to mention a past "4-1 win
  // over Crystal Palace" as background color). "v"/"vs."/"versus" plus
  // explicit preview-genre phrases are deliberate, specific markers that a
  // human editor would recognize as "this is a preview" on sight; a bare
  // "win" is not — it shows up constantly in preview copy as background
  // context and should never outrank the article's own genre signal.
  // "predicted...lineup" allows a gap (not `\bpredicted lineup\b` as an
  // exact phrase) because real headlines routinely put a formation between
  // the two words ("Predicted 4-2-3-1 Celtic Lineup") — the exact-phrase
  // version missed this and the same bug recurred: a "defeat" mentioned in
  // the summary as background color outranked the headline's own preview
  // signal, same root cause as the Man City v Coventry case above.
  { category: 'match', pattern: /\bpreview\b|\bkickoff\b|\btip-off\b|\bvs\.?\b|\bversus\b|\bv\b|\bkey stats\b|\btalking points\b|\bpredicted\b.{0,25}\blineup\b|\bteam news\b/i },
  { category: 'results', pattern: /\bwin[s]?\b|\bbeat[s]?\b|\bdefeat/i }
];

const STATUS_SCHEDULED_PATTERN = /\bwill (play|return|face)\b|\bset to\b|\bscheduled for\b|\bexpected to (play|return)\b/i;

/**
 * V1.2: headline-first, full-text-fallback. Previously every rule was
 * checked once against headline+summary combined, so an incidental keyword
 * anywhere in the SUMMARY could outrank the headline's own actual subject
 * (see the CATEGORY_RULES comment above for the real example found in
 * testing). The headline is what the article is actually about; the
 * summary is supporting free text that can legitimately reference lots of
 * tangential facts (a past score, an unrelated milestone). So: try every
 * rule against the headline alone first; only fall back to the full
 * headline+summary text if the headline itself matches nothing at all.
 * Every existing category that used to depend on summary-only signal still
 * works exactly as before via that fallback pass — this only changes the
 * outcome when the headline and summary would have pointed to two
 * different categories.
 */
function guessCategory(headlineText, fullText) {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(headlineText)) return rule.category;
  }
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(fullText)) return rule.category;
  }
  return 'league'; // existing enum's general/other bucket
}

function guessStatus(text, sourceTier) {
  if (STATUS_SCHEDULED_PATTERN.test(text)) return 'scheduled';
  // A tier-1 (official) source gets to start at 'confirmed' — everything
  // else defaults to the conservative 'report'. verify.js may still change
  // this later once cross-source corroboration is known; this is only the
  // starting guess.
  return sourceTier === 1 ? 'confirmed' : 'report';
}

/**
 * Small, bounded alias table — V1.1 improvement. This is NOT a second team
 * database: every key here maps onto a team that is already in TEAMS_CFG;
 * it only adds the common short forms real headlines actually use instead
 * of a club's full name (confirmed missing in the first real test run:
 * "Man United"/"Man City" appeared in live headlines and matched nothing,
 * because TEAMS_CFG's own `name` is the full "Manchester United"/
 * "Manchester City"). Extend this list only for aliases of teams that
 * already exist in TEAMS_CFG — never add a team here that isn't there.
 */
const TEAM_ALIASES = {
  'manchester united': ['man united', 'man utd'],
  'manchester city': ['man city'],
  'fc barcelona': ['barca', 'barça'],
  'bayern münchen': ['bayern munich', 'fc bayern'],
  'atlético madrid': ['atletico madrid', 'atleti'],
  'borussia dortmund': ['dortmund', 'bvb'],
  'bor. mönchengladbach': ['borussia mönchengladbach', 'borussia monchengladbach', "m'gladbach", 'gladbach'],
  'bayer leverkusen': ['leverkusen'],
  'rb leipzig': ['leipzig'],
  'golden state warriors': ['warriors'],
  'la clippers': ['clippers'],
  'new york knicks': ['knicks'],
  'oklahoma city thunder': ['thunder'],
  'philadelphia 76ers': ['76ers', 'sixers'],
  'new york liberty': ['ny liberty'],
  'las vegas aces': ['vegas aces'],
  'kansas city chiefs': ['chiefs'],
  'san francisco 49ers': ['niners', '49ers'],
  'dallas cowboys': ['cowboys'],
  'buffalo bills': ['bills'],
  'philadelphia eagles': ['eagles']
};

/**
 * League/competition abbreviations and alternate spellings that don't
 * literally appear inside any LEAGUES_CFG/COMPETITIONS_CFG `.name` string
 * (those are already matched directly — this table only covers the gap).
 * Bounded to the 8 competitions Fast Break actually covers, nothing else.
 */
const LEAGUE_TERM_ALIASES = {
  epl: ['epl', 'prem ', 'the prem'],
  laliga: ['laliga', 'la liga'],
  ucl: ['ucl', 'champions league'],
  uel: ['uel', 'europa league']
};

/**
 * Matches team names from data/sports.js's curated TEAMS_CFG against the
 * item text, plus the small alias table above. This is deliberately NOT a
 * full league roster — TEAMS_CFG is the same curated subset the mega menu
 * already uses. A team that isn't in that curated list (and has no alias
 * pointing at one that is) will not be recognized here. That's a real,
 * documented V1 limitation (see the final report), not an oversight: the
 * alternative would be a second, hand-maintained full-roster database
 * living only in scout/, which is exactly the duplicated-data-source
 * anti-pattern the existing codebase already flags as a problem elsewhere.
 */
function matchTeams(text, teamsCfg) {
  const lower = text.toLowerCase();
  const curated = teamsCfg.filter(t => {
    if (lower.includes(t.name.toLowerCase())) return true;
    if (t.shortName && new RegExp(`\\b${t.shortName}\\b`).test(text)) return true;
    const aliases = TEAM_ALIASES[t.name.toLowerCase()] || [];
    return aliases.some(a => lower.includes(a));
  });
  // V1.2: see teamRegistry.js for why this is a separate, deliberately tiny
  // Scout-only list rather than an addition to TEAMS_CFG.
  const curatedNames = new Set(curated.map(t => t.name));
  const supplemental = SUPPLEMENTAL_TEAMS.filter(t => {
    if (curatedNames.has(t.name)) return false;
    if (lower.includes(t.name.toLowerCase())) return true;
    return (t.nicknames || []).some(n => new RegExp(`\\b${n}\\b`, 'i').test(text));
  });
  return [...curated, ...supplemental];
}

function matchCompetitions(text, competitionsCfg) {
  const lower = text.toLowerCase();
  return competitionsCfg.filter(c => {
    if (lower.includes(c.name.toLowerCase())) return true;
    const aliases = LEAGUE_TERM_ALIASES[c.id] || [];
    return aliases.some(a => lower.includes(a));
  });
}

/**
 * V1.1 addition: match against LEAGUES_CFG's own league names directly
 * ("Premier League", "La Liga", "Bundesliga", "NBA", "WNBA", "NFL") plus
 * the alias table. Previously a story that only ever said e.g. "the
 * Premier League" without naming one of the curated teams matched
 * nothing at all — a real, easily-fixed chunk of the unmatched count from
 * the first live run.
 */
function matchLeagues(text, leaguesCfg) {
  const lower = text.toLowerCase();
  return leaguesCfg.filter(l => {
    if (lower.includes(l.name.toLowerCase())) return true;
    const aliases = LEAGUE_TERM_ALIASES[l.id] || [];
    return aliases.some(a => lower.includes(a));
  });
}

/**
 * Best-effort "this looks like a person's name" guess: two consecutive
 * capitalized words, or a lone capitalized surname in wire-headline
 * position. No real NER model behind this — it will both miss real names
 * and occasionally grab something that isn't one. Low confidence by
 * design; documented as a known limitation.
 */

// Wire-copy preamble words that precede a colon exactly like a surname
// would ("Sources: Simmons, Kings agree...") but never are one. Found by
// testing against real ESPN headlines, not guessed in advance.
const WIRE_PREAMBLE_STOPWORDS = new Set([
  'Sources', 'Source', 'Report', 'Reports', 'Reported', 'Breaking',
  'Update', 'Updated', 'Exclusive', 'Analysis', 'Watch', 'Live',
  // V1.1 additions — the same class of bug ("Ranked: 11 summer transfers
  // most likely to fail" caught "Ranked" as a surname), found the same
  // way: a real headline in a real test run, not anticipated in advance.
  'Ranked', 'Ranking', 'Rated', 'Rating', 'Grading', 'Graded',
  'Predicting', 'Predictions', 'Debate', 'Poll', 'Bold'
]);

// Generic sports vocabulary that is capitalized in headlines but is never
// itself a person's name — "League", "City", "United", "Kings", "Giants"
// etc. all matched real headlines in the first live run's false positives.
// This list is deliberately generic sports words only (not team names —
// team names are excluded separately, derived from TEAMS_CFG below, so
// this file never hand-maintains a second team list).
const GENERIC_SPORTS_STOPWORDS = new Set([
  'Team', 'Club', 'FC', 'League', 'Cup', 'Draft', 'Season', 'Playoffs',
  'Finals', 'Championship', 'Conference', 'Division', 'Roster', 'Squad',
  'Coach', 'GM', 'Owner', 'Front', 'Office'
]);

/**
 * Every significant word (>2 letters) that appears in any curated team,
 * league or competition name — "Kings" (from "Sacramento Kings"), "City"
 * (from "Manchester City"), "United" (from "Manchester United"), "Giants"
 * would be caught the same way if a Giants entry existed. Derived from the
 * existing config, not a second hand-written list, so it can't drift from
 * it.
 */
function deriveConfigStopwords(sportsConfig) {
  const words = new Set();
  const addWordsFrom = name => {
    name.split(/\s+/).forEach(w => {
      const clean = w.replace(/[^A-Za-zà-öø-ÿ]/g, '');
      if (clean.length > 2) words.add(clean);
    });
  };
  sportsConfig.TEAMS_CFG.forEach(t => addWordsFrom(t.name));
  sportsConfig.LEAGUES_CFG.forEach(l => addWordsFrom(l.name));
  sportsConfig.COMPETITIONS_CFG.forEach(c => addWordsFrom(c.name));
  // V1.2: fold in the Scout-only supplemental team list too (see
  // teamRegistry.js) — "Rockets"/"Kings" need to be exactly as excluded
  // from player-name guessing as "Kings" from a curated team already is,
  // regardless of which list a team's name came from.
  SUPPLEMENTAL_TEAMS.forEach(t => addWordsFrom(t.name));
  return words;
}

// sportsConfig is loaded once per run and handed to every normalizeItem()
// call unchanged — deriving this set is the same work every time, so it's
// cached against the exact sportsConfig object rather than recomputed once
// per raw item.
let _cachedStopwordsFor = null;
let _cachedStopwords = null;
function getConfigStopwords(sportsConfig) {
  if (_cachedStopwordsFor !== sportsConfig) {
    _cachedStopwords = deriveConfigStopwords(sportsConfig);
    _cachedStopwordsFor = sportsConfig;
  }
  return _cachedStopwords;
}

/**
 * @param {string} headline
 * @param {Set<string>} knownNonPersonNames team/competition names already
 *   matched elsewhere — excluded here so e.g. "Bayern Munich" doesn't show
 *   up as both a team AND a guessed "player".
 * @param {Set<string>} configStopwords from deriveConfigStopwords() —
 *   single words like "Kings"/"City"/"United" that are part of a real
 *   team/league/competition name and therefore implausible as a player.
 */
// A real person's name never starts with a question/auxiliary verb — but
// engagement-style headlines are full of two-capitalized-word sequences
// that do ("Would You", "Have Signed", "Did He"). Found by testing a real
// headline ("...Would You Have Signed Ben Simmons...") where these outran
// the real name for one of the 3 kept slots. Generalizes to any headline
// in this style, not just that one.
// V1.2: added the closed set of WH-question words (How/What/Why/When/
// Where/Which/Who) — the same class of bug as the auxiliary verbs below,
// found the same way: a real headline ("Man City's busy summer: How
// Maresca & Co. navigated Rodri exit...") where "How Maresca" outran the
// real content. English has a small, fixed set of these words, so this is
// a closed list, not an open-ended one that needs ongoing maintenance.
const QUESTION_WORD_START = new Set([
  'Would', 'Have', 'Has', 'Had', 'Did', 'Does', 'Do', 'Is', 'Are', 'Was',
  'Were', 'Should', 'Could', 'Can', 'Will', 'Ranking', 'Grading',
  'How', 'What', 'Why', 'When', 'Where', 'Which', 'Who'
]);

/**
 * "City's" (from "Man City's") won't match the stopword "City" as a raw
 * string — the possessive suffix makes it a different token. A possessive
 * form of a non-person word is exactly as invalid as the bare word, so
 * this is checked in ADDITION to the raw word, not instead of it. Handles
 * both "'s" (City's -> City) and a bare trailing apostrophe for a plural
 * possessive ("Warriors' -> Warriors) — never strips a real trailing "s".
 */
function stripPossessive(word) {
  return word.replace(/['’]s$/i, '').replace(/['’]$/, '');
}

function guessPlayerNames(headline, knownNonPersonNames = new Set(), configStopwords = new Set()) {
  const results = new Set();
  // Full-name pattern: two consecutive capitalized words ("Ben Simmons").
  (headline.match(/\b[A-Z][a-zà-öø-ÿ'’-]+\s+[A-Z][a-zà-öø-ÿ'’-]+\b/g) || []).forEach(m => results.add(m));
  // AP-wire single-surname pattern: "Simmons, Kings agree...", "Simmons
  // agrees to...", "Rodgers: Steelers' 4-QB room...". Genuinely common in
  // sports-desk headlines and was missed entirely before this — a
  // headline that only ever says a surname, never a first name, is the
  // norm for wire copy, not the exception.
  (headline.match(/\b([A-Z][a-zà-öø-ÿ'’-]{2,})(?=,|:|\s+(?:agrees?|signs?|traded|joins|returns?))/g) || [])
    .forEach(m => results.add(m));

  const allStopwords = new Set([...WIRE_PREAMBLE_STOPWORDS, ...GENERIC_SPORTS_STOPWORDS, ...configStopwords]);
  WIRE_PREAMBLE_STOPWORDS.forEach(w => results.delete(w));
  GENERIC_SPORTS_STOPWORDS.forEach(w => results.delete(w));
  knownNonPersonNames.forEach(n => results.delete(n));
  [...results].forEach(name => {
    const words = name.split(' ');
    // Single-word guess: only plausible if it's not itself a fragment of a
    // known team/league/competition name ("Kings", "City", "United" all
    // fail this and are dropped; "Simmons" passes) — checked against both
    // the raw word and its possessive-stripped form.
    if (words.length === 1) {
      const clean = stripPossessive(name);
      if (configStopwords.has(name) || configStopwords.has(clean)) { results.delete(name); return; }
    }
    // Two-word guess: reject if it starts with a question/auxiliary verb
    // ("Would You", "Have Signed", "How Maresca") or if EITHER word (raw or
    // possessive-stripped, e.g. "City's" -> "City") is itself a known
    // stopword/team-fragment ("Knicks Armchair" — "Knicks" is part of "New
    // York Knicks" — or "Man City's" — "City's" strips to "City").
    if (words.length === 2) {
      if (QUESTION_WORD_START.has(words[0])) { results.delete(name); return; }
      const w0 = stripPossessive(words[0]);
      const w1 = stripPossessive(words[1]);
      if (allStopwords.has(words[0]) || allStopwords.has(words[1]) || allStopwords.has(w0) || allStopwords.has(w1)) {
        results.delete(name); return;
      }
    }
  });
  return [...results].slice(0, 3);
}

/**
 * Builds the set of strings that should never be treated as a player name
 * because they're already a matched team/league/competition — including
 * the ALIAS form as it actually appears in the headline, not just the
 * canonical name. Fixes a real bug found in testing: a headline saying
 * "Man United" matched team "Manchester United" (via TEAM_ALIASES) but
 * the literal text "Man United" itself was still being offered up as a
 * guessed player name, since only the canonical name was excluded before.
 */
function buildNonPersonExclusionSet(matchedTeams, matchedCompetitions, matchedLeagues, headline) {
  const names = new Set([
    ...matchedTeams.map(t => t.name),
    ...matchedCompetitions.map(c => c.name),
    ...matchedLeagues.map(l => l.name)
  ]);
  matchedTeams.forEach(t => {
    const aliases = TEAM_ALIASES[t.name.toLowerCase()] || [];
    aliases.forEach(alias => {
      const m = headline.match(new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      if (m) names.add(m[0]); // the alias in whatever casing it actually has in this headline
    });
  });
  return names;
}

/**
 * @param {object} rawItem { title, link, pubDate, description }
 * @param {object} feed the source config from scout/sources.js
 * @param {object} sportsConfig from loadDataFiles.loadSportsConfig()
 * @returns {object|null} a Candidate, or null if no league could be matched
 */
function normalizeItem(rawItem, feed, sportsConfig) {
  const text = `${rawItem.title} ${rawItem.description || ''}`;
  const matchedTeams = matchTeams(text, sportsConfig.TEAMS_CFG);
  const matchedCompetitions = matchCompetitions(text, sportsConfig.COMPETITIONS_CFG);
  // V1.1: also match the league's own name directly ("the Premier League",
  // "NFL") — previously only a curated-team hit or a competition hit could
  // resolve a league at all for the unscoped feeds.
  const matchedLeagues = matchLeagues(text, sportsConfig.LEAGUES_CFG);

  let league = null;
  const secondaryLeagues = new Set();

  if (feed.scopedToSingleLeague && feed.leagueHint) {
    league = feed.leagueHint;
  } else if (matchedTeams.length) {
    league = matchedTeams[0].league;
    matchedTeams.slice(1).forEach(t => { if (t.league !== league) secondaryLeagues.add(t.league); });
  } else if (matchedCompetitions.length) {
    league = matchedCompetitions[0].id; // 'ucl' | 'uel' are valid league values themselves
  } else if (matchedLeagues.length) {
    league = matchedLeagues[0].id;
  }

  matchedCompetitions.forEach(c => { if (c.id !== league) secondaryLeagues.add(c.id); });
  matchedTeams.forEach(t => { if (t.league !== league) secondaryLeagues.add(t.league); });
  matchedLeagues.forEach(l => { if (l.id !== league) secondaryLeagues.add(l.id); });

  if (!league) return null; // unmatched — caller tracks this count separately, never guessed

  const leagueCfg = sportsConfig.LEAGUES_CFG.find(l => l.id === league);
  const sport = leagueCfg ? leagueCfg.sport : (matchedCompetitions[0] && matchedCompetitions[0].sport) || 'football';

  const candidateId = 'cand_' + crypto.createHash('sha1').update(rawItem.link || rawItem.title).digest('hex').slice(0, 12);
  const category = guessCategory(rawItem.title, text); // V1.2: headline-first, see guessCategory()

  return {
    candidateId,
    discoveredAt: new Date().toISOString(), // NOW, not the source's pubDate — spec correction #1

    league,
    secondaryLeagues: [...secondaryLeagues],
    sport,

    headline: rawItem.title,
    summary: rawItem.description || '',
    entities: {
      players: guessPlayerNames(
        rawItem.title,
        buildNonPersonExclusionSet(matchedTeams, matchedCompetitions, matchedLeagues, rawItem.title),
        getConfigStopwords(sportsConfig)
      ),
      teams: matchedTeams.map(t => t.name)
    },

    status: guessStatus(text, feed.tier),
    statusConfidence: null, // set by verify.js

    sources: [
      {
        outlet: feed.outlet,
        url: rawItem.link,
        tier: feed.tier,
        publishedAt: rawItem.pubDate || null, // the SOURCE's own timestamp — never confused with discoveredAt
        isPrimary: false // set by verify.js once the cluster is known
      }
    ],
    primarySourceUrl: null,
    verification: { attempted: false, method: null, result: null, notes: null },

    websiteRelevanceScore: null,
    socialRelevanceScore: null,
    priority: null,
    action: null,

    videoPotential: null,
    videoSourceFound: false,
    videoSourceType: 'unknown',
    videoSourceUrl: null,
    imagePotential: null,
    existingAsset: { hasExisting: false, path: null },

    contentType: null,
    whyFastBreak: null,
    hookSuggestion: null,

    qualityFlags: category === 'league' ? [] : [`category:${category}`],
    category,

    clusterSize: 1,
    publishedAlready: false,
    funnelStage: 'raw',
    rejectionReason: null
  };
}

module.exports = { normalizeItem, guessCategory, guessStatus, guessPlayerNames, matchLeagues, deriveConfigStopwords };
