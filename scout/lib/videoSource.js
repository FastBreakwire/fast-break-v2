/**
 * Video-source discovery.
 *
 * Per spec correction #5 and the V1.1 instructions: this module only ever
 * answers "was a concrete source found", never whether using it would be
 * legal. It must not (and does not) use words like "cleared"/"licensed"/
 * "safe to publish"/"legal to use" anywhere. It never downloads a video
 * file and never attempts to bypass any platform/copyright protection —
 * every check below is either a plain read of an already-fetched RSS
 * item's own text, or a read of a public, keyless, unauthenticated feed
 * (YouTube's own per-channel Atom feed) that YouTube itself publishes for
 * exactly this kind of use.
 *
 * Priority order, as specified:
 *   1. official league account   — implemented (see OFFICIAL_LEAGUE_YOUTUBE)
 *   2. official team account     — NOT implemented in V1.1, see note below
 *   3. official player account   — NOT implemented in V1.1
 *   4. official publisher        — implemented (article-signal check)
 *   5. any other source          — implemented (article-signal check)
 */

const { parseAtomEntries } = require('./youtubeAtom');

/**
 * Official league YouTube channels, checked via their public Atom feed
 * (https://www.youtube.com/feeds/videos.xml?channel_id=...) — no API key.
 *
 * V1.1 ships with exactly ONE verified entry. During research every other
 * candidate channel ID either 404'd or turned out to be a stale/inactive
 * channel once actually fetched (not just trusted by name) — see
 * scout/README.md for the specifics. Per the "lieber unresolved als
 * falsch" rule applied to video sources too: an unverified channel is left
 * out entirely rather than guessed. Add a league here only after fetching
 * its feed and confirming it's both real and currently active.
 */
const OFFICIAL_LEAGUE_YOUTUBE = {
  nba: { channelId: 'UCWJ2lWNubArHWmf3FIHbfcQ', name: 'NBA (official)' }
  // wnba, nfl, epl, laliga, bundesliga, ucl, uel: not verified yet.
};

// Team- and player-level official channel discovery is explicitly NOT
// implemented in V1.1 — there is no verified channel directory for the 35
// curated teams or for individual players, and building one would be
// exactly the kind of second hand-maintained database this project keeps
// avoiding elsewhere. If this becomes valuable, the right shape is a
// small, individually-verified table exactly like OFFICIAL_LEAGUE_YOUTUBE
// above, not a guess.

const OUTLET_TYPE_MAP = {
  'Bundesliga.com': 'official_league',
  'ESPN': 'official_publisher',
  'Sky Sports': 'broadcaster',
  'CBS Sports': 'broadcaster',
  'Yahoo Sports': 'official_publisher'
};

const VIDEO_SIGNAL_PATTERN = /\/video\/|\bwatch:|\bhighlights?\b/i;

/**
 * Cheap, synchronous check — does ANY source already in this candidate's
 * cluster (not just the primary one) itself signal that it carries video.
 * Runs for every candidate; no network call.
 */
function articleSignalCheck(cand) {
  const text = `${cand.headline} ${cand.summary}`;
  const textSignal = VIDEO_SIGNAL_PATTERN.test(text);
  const hit = cand.sources.find(s => s.url && /\/video\//i.test(s.url));
  if (hit) return { found: true, type: OUTLET_TYPE_MAP[hit.outlet] || 'unknown', url: hit.url };
  if (textSignal) {
    const primary = cand.sources.find(s => s.isPrimary) || cand.sources[0];
    if (primary && primary.url) return { found: true, type: OUTLET_TYPE_MAP[primary.outlet] || 'unknown', url: primary.url };
  }
  return { found: false, type: 'unknown', url: null };
}

/**
 * How much a story's own CATEGORY lends itself to video, independent of
 * whether a clip was actually found (existingAsset/videoSourceFound must
 * never feed back into this). Reused by contentType decisions in enrich.js.
 */
function computeVideoPotential(category) {
  const HIGH = new Set(['trade', 'transfer', 'signing']);
  const MED = new Set(['contract', 'injury', 'investigation', 'results']);
  if (HIGH.has(category)) return 'high';
  if (MED.has(category)) return 'medium';
  return 'low';
}

function computeImagePotential(category) {
  const HIGH = new Set(['trade', 'transfer', 'signing', 'contract', 'investigation', 'legal']);
  return HIGH.has(category) ? 'high' : 'medium';
}

/**
 * Real, network-based check against a verified official league channel's
 * public upload feed — only called for candidates worth the request (see
 * run.js's gating). Matches by simple token overlap between the
 * candidate's entities and each video's title; no fuzzy/semantic matching,
 * so it will miss plenty and is meant to — a miss just means
 * videoSourceFound stays false, which is the safe default either way.
 */
async function searchOfficialLeagueChannel(cand) {
  const channel = OFFICIAL_LEAGUE_YOUTUBE[cand.league];
  if (!channel) return null;

  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`, {
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const entries = parseAtomEntries(xml);

    // Confirmed by testing (this exact run): a bare single-word guess from
    // entities.players (e.g. "Rockets" — a team name the wire-surname
    // heuristic mistook for a player because "Houston Rockets" isn't in
    // the curated TEAMS_CFG list) matched an unrelated old highlight video
    // that happened to mention the same word. entities.teams is always
    // reliable (only ever populated from a real TEAMS_CFG hit); a
    // single-word players[] guess is not — so only multi-word player names
    // ("Ben Simmons") or confirmed teams are trusted as search needles.
    // A lone single-word guess is never used by itself.
    const trustedNeedles = [
      ...cand.entities.players.filter(n => n.includes(' ')),
      ...cand.entities.teams
    ].map(n => n.toLowerCase()).filter(n => n.length > 2);
    if (!trustedNeedles.length) return null;
    const needles = trustedNeedles;

    const hit = entries.find(e => needles.some(n => e.title.toLowerCase().includes(n)));
    if (!hit) return null;
    return { found: true, type: 'official_league', url: hit.link };
  } catch (_err) {
    return null; // network hiccup or bad feed -> stays "not found", never guessed
  }
}

/**
 * Cheap pass — runs for every candidate, no network call. Sets
 * videoPotential/imagePotential (story-level, asset-independent) and a
 * best-effort videoSourceFound from already-fetched article text.
 */
function checkVideoSource(cand) {
  const signal = articleSignalCheck(cand);
  return {
    ...cand,
    videoPotential: computeVideoPotential(cand.category),
    imagePotential: computeImagePotential(cand.category),
    videoSourceFound: signal.found,
    videoSourceType: signal.type,
    videoSourceUrl: signal.url
  };
}

/**
 * Expensive pass — one network call, only for candidates it's worth
 * calling for (gated in run.js: website floor cleared + high video
 * potential). If checkVideoSource() already found something, this is
 * skipped entirely; a found source is never overwritten by a search.
 */
async function deepVideoSearch(cand) {
  if (cand.videoSourceFound) return cand; // already have a concrete source — priority 1 only adds, never replaces
  const officialHit = await searchOfficialLeagueChannel(cand);
  if (!officialHit) return cand;
  return {
    ...cand,
    videoSourceFound: true,
    videoSourceType: officialHit.type,
    videoSourceUrl: officialHit.url
  };
}

module.exports = { checkVideoSource, deepVideoSearch, computeVideoPotential, computeImagePotential };
