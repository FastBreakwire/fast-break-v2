/**
 * Highlightly provider adapter — SERVER SIDE ONLY.
 *
 * This is the single place in the codebase that knows Highlightly's raw
 * response shape. Everything above it (server/api.js) consumes the
 * normalized models in ./models.js. Swapping to a different provider means
 * writing a sibling adapter with the same public methods; the score UI does
 * not change.
 *
 * The API key is read from the environment and never leaves this process —
 * it is attached as a request header here and nowhere else.
 *
 *   HIGHLIGHTLY_API_KEY=...        (required to enable live data)
 *   HIGHLIGHTLY_ROOT_DOMAIN=...    (optional override, defaults to highlightly.net)
 *
 * ---------------------------------------------------------------------------
 * VERIFIED CONNECTION DETAILS — Sport API PRO (corrected 30 Aug 2026)
 * ---------------------------------------------------------------------------
 * The account is subscribed to Highlightly's unified "Sport API" product
 * (PRO tier, 7,500 req/day) — NOT the separate single-sport products
 * ("Football API", "Basketball API", etc, each its own Basic tier, 100
 * req/day). This file previously hit those separate single-sport hosts by
 * mistake (soccer.highlightly.net, basketball.highlightly.net, ...), which
 * silently billed against the wrong, much smaller quota instead of the PRO
 * one actually being paid for. Corrected against the live OpenAPI spec
 * published at highlightly.net/sport-api/documentation/ (spec v6.14.2):
 *
 *   ONE host for every sport:  https://sports.highlightly.net
 *   sport is a PATH PREFIX, not a subdomain:
 *     /football/..., /basketball/..., /american-football/...
 *
 * Only ONE header is required for a direct Highlightly account key:
 *   x-rapidapi-key:  <the account key>
 * `x-rapidapi-host` is documented as needed ONLY when calling through the
 * RapidAPI gateway (sport-highlights-api.p.rapidapi.com) instead of the
 * direct Highlightly host above — it is deliberately NOT sent here.
 *
 * The unified API renamed association football's path segment to
 * "football" (the old single-sport product used "soccer" as its
 * subdomain). Fast Break's OWN internal sportSlug vocabulary is unchanged
 * and still uses "soccer" everywhere else in this file — see API_PATH
 * below, the one place that translates it for the outbound URL.
 *
 * The three sports do not share one endpoint set or one query-param
 * vocabulary:
 *   - basketball & football: /matches, /standings, /highlights take a numeric
 *     `leagueId` + `season`. /teams has NO league filter at all — it is a
 *     flat, global list filterable only by `name` — so a league's team list
 *     is derived from /standings instead (which already returns full team
 *     rosters, grouped), rather than spending a second, unfilterable call.
 *   - american-football: uses `league` (a NAME string, "NFL") for matches
 *     and teams, and `leagueType`/`year` (not `season`) for standings. Its
 *     /teams DOES accept a league filter directly.
 *   - basketball has NO /players endpoint at all (confirmed against the live
 *     OpenAPI spec, not just an empty result) — NBA/WNBA player calls must
 *     never be attempted, see getPlayers() below.
 */

const {
  normalizeGame,
  normalizeStanding,
  normalizeTeam,
  normalizePlayer,
  LEAGUE_IDS
} = require('./models');

const API_KEY = process.env.HIGHLIGHTLY_API_KEY || null;
const ROOT_DOMAIN = process.env.HIGHLIGHTLY_ROOT_DOMAIN || 'highlightly.net';

// Fast Break's internal sportSlug (used everywhere else in this file, and by
// every LEAGUE_CONFIG row below) -> the Sport API PRO URL path segment.
// Basketball and american-football already match; only association
// football's path name actually differs ("football", not "soccer"). This is
// the ONLY place that translation happens — every sportSlug comparison
// elsewhere in this file (mapStatus, formatClock, mapStandingsGrouped's
// dispatch, ...) keeps using the existing internal value untouched.
const API_PATH = {
  basketball: 'basketball',
  soccer: 'football',
  'american-football': 'american-football'
};

// ---------------------------------------------------------------------------
// COMPETITION CONFIG — the one place that knows each league's Highlightly id
// and which sport host/param style it uses. Every id below was read directly
// from a live response during the audit; none is guessed.
//
//   sportSlug   Fast Break's internal tag: basketball | soccer | american-football
//               (translated to the real URL path segment via API_PATH, only
//               inside request() — see above)
//   sport       Fast Break's OWN sport id (basketball | football |
//               americanfootball) — deliberately kept separate from
//               sportSlug. Nothing outside this file should ever see
//               "soccer" or "american-football"; the rest of the codebase
//               (models.js, api.js, the frontend) only knows Fast Break's
//               existing sport vocabulary.
//   paramStyle  'id'   -> basketball/soccer: leagueId + season
//               'name' -> NFL: league=<name>, leagueType=<name> + year
// ---------------------------------------------------------------------------
const LEAGUE_CONFIG = {
  nba:        { sportSlug: 'basketball',        sport: 'basketball',       paramStyle: 'id',   leagueId: 10996 },
  wnba:       { sportSlug: 'basketball',        sport: 'basketball',       paramStyle: 'id',   leagueId: 11847 },
  epl:        { sportSlug: 'soccer',            sport: 'football',         paramStyle: 'id',   leagueId: 33973 },
  laliga:     { sportSlug: 'soccer',            sport: 'football',         paramStyle: 'id',   leagueId: 119924 },
  bundesliga: { sportSlug: 'soccer',            sport: 'football',         paramStyle: 'id',   leagueId: 67162 },
  ucl:        { sportSlug: 'soccer',            sport: 'football',         paramStyle: 'id',   leagueId: 2486 },
  uel:        { sportSlug: 'soccer',            sport: 'football',         paramStyle: 'id',   leagueId: 3337 },
  nfl:        { sportSlug: 'american-football', sport: 'americanfootball', paramStyle: 'name', leagueName: 'NFL' }
};

// Newest season each competition actually returned during the audit. Used
// only as a default so /matches?date=today doesn't have to guess a season —
// callers can always override by passing season explicitly. Basketball uses
// a start-year convention (the 2025-26 NBA season is "2025"); the football
// competitions and NFL use the current calendar year. This will need a
// one-line bump once the next season is under way; there is no reliable way
// to auto-detect it without spending a request on every call.
const CURRENT_SEASON = {
  nba: 2025, wnba: 2026, epl: 2026, laliga: 2026, bundesliga: 2026,
  ucl: 2026, uel: 2026, nfl: 2026
};

function isEnabled() {
  return Boolean(API_KEY);
}

async function request(sportSlug, path, params = {}) {
  if (!API_KEY) {
    const err = new Error('HIGHLIGHTLY_API_KEY is not set');
    err.code = 'NO_PROVIDER_KEY';
    throw err;
  }
  // Sport API PRO: one host for every sport, sport as a path prefix. See the
  // file header comment for why this replaced the old per-sport-subdomain
  // construction (that hit a different, separately-billed product).
  const host = `sports.${ROOT_DOMAIN}`;
  const apiPath = API_PATH[sportSlug] || sportSlug;
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  );
  const query = qs.toString();
  const res = await fetch(`https://${host}/${apiPath}${path}${query ? `?${query}` : ''}`, {
    headers: {
      'x-rapidapi-key': API_KEY,
      // No x-rapidapi-host: the live Sport API spec documents this header as
      // needed only when calling through the RapidAPI gateway host, not for
      // a direct Highlightly account key against `host` above. Sending the
      // old per-sport subdomain value here was never a documented pattern
      // for either mode.
      Accept: 'application/json'
    }
  });
  if (!res.ok) {
    // Read the body for the log line only — never forward it to the browser.
    // A provider error body can legally contain the request's own echoed
    // headers in some frameworks; treat it as opaque.
    let detail = '';
    try { detail = (await res.text()).slice(0, 200); } catch (_) { /* ignore */ }
    const err = new Error(`Highlightly ${res.status} on ${apiPath}${path}: ${detail}`);
    err.code = res.status === 429 ? 'RATE_LIMITED' : 'PROVIDER_ERROR';
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Every list endpoint wraps rows as either `{ data: [...] }` or a bare array;
// normalise that once instead of repeating `?? []` guesses at every call site.
function rows(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

/* --------------------------------------------------------------- helpers */

// "90 - 94" -> [90, 94]. Anything that doesn't match returns [null, null]
// rather than a guess — a not-yet-started game has no score to parse.
function parseScorePair(scoreStr) {
  if (typeof scoreStr !== 'string') return [null, null];
  const m = scoreStr.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (!m) return [null, null];
  return [Number(m[1]), Number(m[2])];
}

// Display-only initials for basketball/soccer, which give no abbreviation
// field. This is a deterministic transform of the REAL name ("New York
// Knicks" -> "NYK"), not invented data — the full name is preserved
// separately on the model (homeTeamName/awayTeamName) for anything that
// needs it. NFL's real `abbreviation` is always preferred when present.
function shortLabel(fullName, abbreviation) {
  if (abbreviation) return abbreviation;
  if (!fullName) return '';
  const stop = new Set(['fc', 'cf', 'sc', 'ac', 'the', 'de', 'of', 'club', 'women']);
  // Numeric tokens ("04" in "Schalke 04") carry no letters to initial from —
  // drop them, same as stopwords, rather than leaking a digit into the code.
  const words = fullName.split(/\s+/).filter(w => w && !stop.has(w.toLowerCase()) && /[a-zA-Z]/.test(w));
  const source = words.length ? words : [fullName];
  if (source.length === 1) {
    // Only one significant word left ("Portland", "Ipswich") — a single
    // initial reads as broken, so take three letters instead.
    const letters = source[0].replace(/[^a-zA-Z]/g, '');
    return (letters.slice(0, 3) || fullName.slice(0, 3)).toUpperCase();
  }
  const letters = source.map(w => (w.match(/[a-zA-Z]/) || [''])[0]).join('').toUpperCase();
  return (letters.slice(0, 4) || fullName.slice(0, 3).toUpperCase());
}

// Football's clock is a bare integer minute ("90"); render it in the
// broadcast convention the model already documents ("67'"). Basketball's
// live clock format was never observed during the audit (only null, on
// finished/not-started games) — passed through as-is rather than guessed.
// NFL's was likewise only seen as 0 on a scheduled game.
function formatClock(clock, sportSlug) {
  if (clock === null || clock === undefined) return null;
  if (sportSlug === 'soccer' && typeof clock === 'number') return `${clock}'`;
  return String(clock);
}

/**
 * Maps provider status text + structural evidence onto Fast Break's
 * {status, period} pair. The full set of description strings is now
 * confirmed from the live Sport API OpenAPI spec (30 Aug 2026) — see the
 * `description` enum on FootballMatchStateResponseDto /
 * BasketballMatchStateResponseDto / AmericanFootballMatchStateResponseDto.
 * Every branch below maps a real, documented value; anything genuinely
 * unrecognised (a future addition to the enum) still degrades to a
 * reasonable default instead of throwing — never a fabricated score/period.
 */
function mapStatus(raw, sportSlug) {
  const desc = String(raw?.state?.description || '').toLowerCase().trim();
  if (!desc || desc.includes('not started') || desc === 'scheduled' || desc.includes('to be announced')) {
    return { status: 'scheduled', period: null };
  }
  if (desc.includes('postponed')) return { status: 'postponed', period: null };
  if (desc.includes('cancel')) return { status: 'cancelled', period: null };
  if (desc.includes('finished') || desc.includes('full time') || desc === 'ft') {
    return { status: 'final', period: sportSlug === 'soccer' ? 'FT' : null };
  }
  // "Abandoned"/"Awarded" both mean the match will not continue and the
  // score stands as final — checked before the NFL numeric-period branch
  // below so an abandoned/awarded NFL game (which still carries a real
  // last-known state.period) is reported final rather than still "live in
  // that quarter".
  if (desc.includes('abandoned') || desc.includes('awarded')) {
    return { status: 'final', period: sportSlug === 'soccer' ? 'FT' : null };
  }

  if (sportSlug === 'american-football') {
    // NFL's `state.period` is a confirmed numeric field (0 = not started)
    // and is the most precise source of truth available — preferred over
    // description text, including for "Suspended"/"In progress"/"Unknown",
    // which carry a real period alongside them.
    const period = Number(raw?.state?.period);
    if (Number.isFinite(period) && period > 0) {
      return { status: 'live', period: period <= 4 ? `Q${period}` : 'OT' };
    }
    if (desc.includes('half')) return { status: 'live', period: 'HT' };
    // No usable period yet ("Suspended"/"Interrupted"/"Unknown" before any
    // period was ever recorded) — live, but honest about not knowing which
    // quarter rather than defaulting to Q1.
    if (desc.includes('suspended') || desc.includes('interrupted') || desc.includes('unknown')) {
      return { status: 'live', period: null };
    }
    return { status: 'live', period: 'Q1' };
  }

  // "Suspended"/"Interrupted"/"Break time"/"Unknown" — football and
  // basketball have no numeric period field to fall back on the way NFL
  // does above, so these are reported live with no period tag rather than
  // guessing which half/quarter play is paused in.
  if (desc.includes('suspended') || desc.includes('interrupted') ||
      desc.includes('break time') || desc.includes('unknown')) {
    return { status: 'live', period: null };
  }

  if (sportSlug === 'soccer') {
    if (desc.includes('half time') || desc.includes('halftime')) return { status: 'live', period: 'HT' };
    if (desc.includes('first half')) return { status: 'live', period: '1H' };
    if (desc.includes('second half')) return { status: 'live', period: '2H' };
    if (desc.includes('extra time')) return { status: 'live', period: 'ET' };
    if (desc.includes('penalt')) return { status: 'live', period: 'PENS' };
    return { status: 'live', period: '1H' };
  }

  // basketball — the live OpenAPI spec confirms state.description carries
  // literal quarter names, so they're matched directly instead of inferring
  // from which score.qN fields happen to be populated.
  if (desc.includes('first quarter'))  return { status: 'live', period: 'Q1' };
  if (desc.includes('second quarter')) return { status: 'live', period: 'Q2' };
  if (desc.includes('third quarter'))  return { status: 'live', period: 'Q3' };
  if (desc.includes('fourth quarter')) return { status: 'live', period: 'Q4' };
  if (desc.includes('half')) return { status: 'live', period: 'HT' };
  // Documented as "Over time" (two words), not "overtime" — match both.
  if (desc.includes('over time') || desc.includes('overtime') || / ot\b/.test(desc)) {
    return { status: 'live', period: 'OT' };
  }
  // Fallback for anything still unrecognised: infer the in-progress quarter
  // from which score.qN fields the provider has already populated — a
  // structural fact from the same response, not a wording guess.
  const score = raw?.state?.score || {};
  const filled = ['q1', 'q2', 'q3', 'q4'].filter(k => score[k] != null).length;
  return { status: 'live', period: `Q${filled || 1}` };
}

// Per-period score breakdown. Basketball and NFL both provide one;
// football's payload (confirmed during the audit) carries only the running
// total and never a half-by-half split, so this correctly returns null
// there rather than inventing a first-half/second-half score.
function extractPeriods(raw, sportSlug) {
  const score = raw?.state?.score;
  if (!score) return null;

  if (sportSlug === 'basketball') {
    const out = {};
    ['q1', 'q2', 'q3', 'q4'].forEach(k => {
      if (score[k] != null) {
        const [home, away] = parseScorePair(score[k]);
        out[k] = { home, away };
      }
    });
    if (score.overTime != null) {
      const [home, away] = parseScorePair(score.overTime);
      out.ot = { home, away };
    }
    return Object.keys(out).length ? out : null;
  }

  if (sportSlug === 'american-football') {
    const map = {
      firstPeriod: 'q1', secondPeriod: 'q2', thirdPeriod: 'q3', fourthPeriod: 'q4',
      firstOvertimePeriod: 'ot1', secondOvertimePeriod: 'ot2'
    };
    const out = {};
    Object.entries(map).forEach(([src, dst]) => {
      if (score[src] != null) {
        const [home, away] = parseScorePair(score[src]);
        out[dst] = { home, away };
      }
    });
    return Object.keys(out).length ? out : null;
  }

  return null; // soccer: confirmed no half-by-half split exists
}

// Only present on a single-match detail fetch (/matches/{id}), never on the
// list endpoint — pass through what's there, invent nothing when absent.
//
// teamId (added for the match-detail visual refinement task): the raw event
// already carries a real team id (e.team.id) that was being discarded here,
// leaving only the display name — not enough to reliably associate an event
// with a team by ID rather than by matching name strings. Kept alongside
// `team` (the display name, unchanged) rather than replacing it, so nothing
// that already reads `event.team` breaks.
function mapEvent(e) {
  return {
    time: e.time ?? null,
    type: e.type ?? null,
    team: e.team?.name ?? null,
    teamId: e.team?.id != null ? String(e.team.id) : null,
    player: e.player ?? null,
    playerId: e.playerId != null ? String(e.playerId) : null,
    assist: e.assist ?? null
  };
}

/* ---------------------------------------------------------------- mapping */

function mapGame(raw, leagueId, cfg) {
  const { status, period } = mapStatus(raw, cfg.sportSlug);
  const [homeScore, awayScore] = parseScorePair(raw?.state?.score?.current);
  const home = raw.homeTeam || {};
  const away = raw.awayTeam || {};
  // NFL: `displayName` is the full name ("Chicago Bears"), `name` is the
  // short club name ("Bears") — the opposite of basketball/soccer, where
  // `name` is already the full name. Prefer displayName when present.
  const homeFull = home.displayName || home.name || null;
  const awayFull = away.displayName || away.name || null;

  return normalizeGame({
    id: String(raw.id),
    sport: cfg.sport,
    league: leagueId,
    status,
    period,
    homeTeam: shortLabel(homeFull, home.abbreviation),
    awayTeam: shortLabel(awayFull, away.abbreviation),
    homeScore,
    awayScore,
    clock: formatClock(raw?.state?.clock, cfg.sportSlug),
    startTime: raw.date || null,
    venue: raw.venue?.name || null,
    broadcast: null, // Highlightly does not provide a broadcaster field — never fabricated
    homeTeamId: home.id != null ? String(home.id) : null,
    awayTeamId: away.id != null ? String(away.id) : null,
    homeTeamName: homeFull,
    awayTeamName: awayFull,
    homeTeamLogo: home.logo || null,
    awayTeamLogo: away.logo || null,
    periods: extractPeriods(raw, cfg.sportSlug),
    events: Array.isArray(raw.events) ? raw.events.map(mapEvent) : null
  });
}

function statValue(statistics, label) {
  const row = (statistics || []).find(s => s.displayName === label);
  return row ? row.value : null;
}

// Confirmed by direct inspection: basketball's /standings returns EIGHT
// groups per league — two conference-wide tables (15 teams each) AND six
// division tables (5 teams each) — so every team appears twice, once per
// level. Both are real and worth keeping; they're told apart by the group's
// own name (it literally says "Conference" or "Division"), not guessed.
function classifyGroup(groupName) {
  const n = String(groupName || '').toLowerCase();
  if (n.includes('conference')) return { conference: groupName, division: null };
  if (n.includes('division')) return { conference: null, division: groupName };
  return { conference: null, division: null };
}

// Basketball: { team, wins, loses, position, gamesPlayed, scoredPoints, receivedPoints }
function mapBasketballStanding(row, group) {
  const t = row.team || {};
  const { conference, division } = classifyGroup(group);
  return normalizeStanding({
    teamId: t.id, teamName: t.name, teamLogo: t.logo,
    position: row.position, played: row.gamesPlayed,
    wins: row.wins, losses: row.loses, draws: null, points: null,
    scoreFor: row.scoredPoints, scoreAgainst: row.receivedPoints,
    group, conference, division
  });
}

// Soccer: { team, home:{...}, away:{...}, total:{wins,draws,games,loses,scoredGoals,receivedGoals}, points, position }
function mapSoccerStanding(row, group) {
  const t = row.team || {};
  const total = row.total || {};
  return normalizeStanding({
    teamId: t.id, teamName: t.name, teamLogo: t.logo,
    position: row.position, played: total.games,
    wins: total.wins, losses: total.loses, draws: total.draws, points: row.points,
    scoreFor: total.scoredGoals, scoreAgainst: total.receivedGoals,
    group, conference: null, division: null
  });
}

// NFL: named statistic rows rather than fixed fields, grouped by conference
// only (no division-level grouping was seen in the audited response — if a
// future response does carry one, `division` is ready but stays null today
// rather than being guessed). Position is not an explicit field on this
// endpoint; the group's own array order is used as the rank, which reflects
// the provider's own ordering rather than an invented number.
//
// OPEN ITEM: a single request for one year returned THREE separate groups
// each labelled "American Football Conference"/"AFC" (and three for NFC),
// each with a different team at the top and different win totals — not
// duplicates, but three genuinely different tables under one label, with no
// documented parameter to choose between them. Nothing is discarded here —
// all of them flatten through — but a future standings UI for NFL will need
// to pick one (most likely by adding a week/season-type filter once that
// param is identified) rather than showing three overlapping tables.
function mapNflStanding(row, group, index) {
  const t = row.team || {};
  const stats = row.statistics;
  return normalizeStanding({
    teamId: t.id, teamName: t.displayName || t.name, teamLogo: t.logo,
    position: index + 1,
    played: null, // not given as a discrete field; Wins+Losses+Ties covers it
    wins: statValue(stats, 'Wins'), losses: statValue(stats, 'Losses'),
    draws: statValue(stats, 'Ties'), points: null,
    scoreFor: statValue(stats, 'Points For'), scoreAgainst: statValue(stats, 'Points Against'),
    group, conference: row.abbreviation || null, division: null
  });
}

// Standings responses group by conference/division; flattened to one array
// with the group name carried on every row, so this stays the same "plain
// array of standings" shape passthrough() already returns — nothing nested.
function mapStandingsGrouped(raw, kind) {
  const groups = Array.isArray(raw) ? raw : (raw?.groups || []);
  const out = [];
  groups.forEach(g => {
    const groupName = g.name || g.leagueName || null;
    if (kind === 'basketball') {
      (g.standings || []).forEach(r => out.push(mapBasketballStanding(r, groupName)));
    } else if (kind === 'soccer') {
      (g.standings || []).forEach(r => out.push(mapSoccerStanding(r, groupName)));
    } else if (kind === 'nfl') {
      (g.data || []).forEach((r, i) => out.push(mapNflStanding(r, groupName, i)));
    }
  });
  return out;
}

function mapTeam(raw, leagueId) {
  return normalizeTeam({
    id: raw.id,
    league: leagueId,
    name: raw.name ?? null,
    displayName: raw.displayName ?? null,
    shortName: raw.abbreviation ?? shortLabel(raw.displayName || raw.name, null) ?? null,
    logo: raw.logo ?? null
  });
}

function mapPlayer(raw, leagueId) {
  return normalizePlayer({
    id: raw.id,
    league: leagueId,
    teamId: raw.team?.id ? String(raw.team.id) : null,
    name: raw.fullName ?? raw.name ?? null,
    position: raw.profile?.position?.main ?? null,
    number: raw.number ?? raw.jersey ?? null
  });
}

/* ------------------------------------------------------------ public API */

async function getGames({ league, date, season } = {}) {
  const cfg = LEAGUE_CONFIG[league];
  if (!cfg) return [];
  const effectiveDate = date || new Date().toISOString().slice(0, 10);
  const effectiveSeason = season ?? CURRENT_SEASON[league];

  const params = cfg.paramStyle === 'id'
    ? { leagueId: cfg.leagueId, season: effectiveSeason, date: effectiveDate }
    : { league: cfg.leagueName, season: effectiveSeason, date: effectiveDate };

  const data = await request(cfg.sportSlug, '/matches', params);
  return rows(data).map(r => mapGame(r, league, cfg));
}

// ---------------------------------------------------------------------------
// COMPETITION TIMEZONES — the one place that maps a league to its fixed
// editorial timezone (IANA name, so DST is handled automatically). Fast
// Break shows a competition's own kickoff-market time, not the visitor's
// browser zone. Mirrored in data/sports.js for the frontend (this file
// can't be imported by a classic <script>) — keep the two in sync.
// ---------------------------------------------------------------------------
const COMPETITION_TIMEZONES = {
  nba: 'America/New_York', wnba: 'America/New_York', nfl: 'America/New_York',
  epl: 'Europe/London', laliga: 'Europe/Madrid', bundesliga: 'Europe/Berlin',
  ucl: 'Europe/Berlin', uel: 'Europe/Berlin'
};

// {y,mo,d,h,mi,s} for `ms` as observed in `timeZone`.
function zonedParts(ms, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const parts = {};
  fmt.formatToParts(ms).forEach(p => { if (p.type !== 'literal') parts[p.type] = p.value; });
  let h = Number(parts.hour);
  if (h === 24) h = 0; // some engines report midnight as "24"
  return { y: Number(parts.year), mo: Number(parts.month), d: Number(parts.day), h, mi: Number(parts.minute), s: Number(parts.second) };
}

// UTC epoch ms for 00:00:00 local time, in `timeZone`, on the calendar day
// containing `ms`. Correct across DST because the zone's offset is
// re-measured at the guessed instant rather than assumed fixed — standard
// double-format technique (Node has no built-in "construct Date in an
// arbitrary IANA zone" primitive).
function startOfDayInZone(ms, timeZone) {
  const p = zonedParts(ms, timeZone);
  const utcGuess = Date.UTC(p.y, p.mo - 1, p.d, 0, 0, 0);
  const observed = zonedParts(utcGuess, timeZone);
  const observedAsUTC = Date.UTC(observed.y, observed.mo - 1, observed.d, observed.h, observed.mi, observed.s);
  return utcGuess - (observedAsUTC - utcGuess);
}

// ---------------------------------------------------------------------------
// SCHEDULE WINDOW — a forward-looking window of games for one competition
// (plus today's finals, in that competition's own timezone, so a game that
// just ended doesn't vanish from the rail the instant it finishes). Built
// on the same /matches endpoint and the same mapGame() normalizer
// getGames() already uses — never a second game-status system, just a
// different fetch/filter shape on top of it. Used for BOTH the compact
// 14-day game rail and the full schedule view (a larger `days`/`maxPages`),
// so there is exactly one fetch/cache/normalize path for schedule data.
//
// The Sport API has no date-RANGE parameter (only a single `date`), so a
// window is built by paging the date-less /matches response instead. Two
// real responses were inspected while building this (EPL: totalCount 180
// across 2 pages; NBA: totalCount 1380, all in the past — the 2026-27
// schedule isn't published by the provider yet) and both came back sorted
// newest-first. Paging stops once a page's OLDEST date has already reached
// today — everything after that point can only be older still, so it can't
// contain anything inside a forward-looking window — bounded by `maxPages`
// as a hard backstop in case some competition doesn't follow that ordering.
//
// Cached in memory PER COMPETITION (never a combined football cache — the
// cache key already includes `league`) so repeat loads across visitors
// don't re-spend the request budget within the cache window.
//
// TTL depends on request scale, not one flat number: this same function
// serves both the compact live rail (days <= 31, polled by the frontend
// every 20s while something is live — see GAME_RAIL_DAYS in index.html)
// and the full schedule page (days > 31, fetched once and paged through
// client-side, effectively never re-requested for the same league within
// a session). A single 5-minute TTL across both was the actual root cause
// of a real reported bug: it silently outlived every live-rail poll, so a
// live score/clock never advanced without a manual page reload — fixed by
// giving the rail's scale a TTL below its own poll interval, while the
// full-schedule scale keeps the original 5 minutes (it doesn't need to be
// any fresher, and a shorter TTL there would only spend requests for no
// visible benefit).
// ---------------------------------------------------------------------------
const RAIL_SCALE_CACHE_MS = 15 * 1000;      // must stay below the 20s live-poll interval
const FULL_SCHEDULE_CACHE_MS = 5 * 60 * 1000;
const upcomingCache = new Map(); // `${league}:${days}:${maxPages}` -> { at, games }

async function getUpcomingGames({ league, days = 14, maxPages = 3 } = {}) {
  const cfg = LEAGUE_CONFIG[league];
  if (!cfg) return [];

  const cacheTtl = days > 31 ? FULL_SCHEDULE_CACHE_MS : RAIL_SCALE_CACHE_MS;
  const cacheKey = `${league}:${days}:${maxPages}`;
  const cached = upcomingCache.get(cacheKey);
  if (cached && Date.now() - cached.at < cacheTtl) return cached.games;

  const effectiveSeason = CURRENT_SEASON[league];
  const baseParams = cfg.paramStyle === 'id'
    ? { leagueId: cfg.leagueId, season: effectiveSeason }
    : { league: cfg.leagueName, season: effectiveSeason };

  const now = Date.now();
  const horizon = now + days * 24 * 60 * 60 * 1000;
  const timeZone = COMPETITION_TIMEZONES[league] || 'UTC';
  const todayStart = startOfDayInZone(now, timeZone);

  let raw = [];
  for (let page = 0; page < maxPages; page++) {
    const data = await request(cfg.sportSlug, '/matches', { ...baseParams, limit: 100, offset: page * 100 });
    const batch = rows(data);
    if (!batch.length) break;
    raw = raw.concat(batch);

    const total = data && data.pagination ? data.pagination.totalCount : raw.length;
    if (raw.length >= total) break; // every match already fetched

    const oldestOnPage = batch.reduce((min, m) => {
      const t = m.date ? Date.parse(m.date) : NaN;
      return Number.isFinite(t) && (min === null || t < min) ? t : min;
    }, null);
    if (oldestOnPage !== null && oldestOnPage <= now) break; // rest can only be older
  }

  // Confirmed on a live response (Europa League, 30 Aug 2026): consecutive
  // pages of /matches can return the same match id more than once — 44 of
  // 144 rows duplicated in one observed fetch. Not a pagination bug on this
  // side (offsets increment by a fixed 100 with no overlap); the provider's
  // own paginated ordering isn't perfectly stable. Deduped by id before
  // mapping rather than trusting each page to be disjoint.
  const seenIds = new Set();
  const deduped = raw.filter(m => {
    if (seenIds.has(m.id)) return false;
    seenIds.add(m.id);
    return true;
  });

  const games = deduped
    .map(r => mapGame(r, league, cfg))
    .filter(g => {
      if (g.status === 'cancelled') return false;
      // A live game is "now" by definition, regardless of its nominal
      // (already-past) kickoff timestamp — never excluded by the window.
      if (g.status === 'live') return true;
      if (!g.startTime) return false;
      const t = Date.parse(g.startTime);
      if (!Number.isFinite(t)) return false;
      if (g.status === 'final') {
        // A final game stays on the rail for the rest of ITS competition's
        // calendar day (not a rolling "last N hours" window, and not the
        // reader's own timezone) — the same "today" the score rail always
        // showed, just computed against the fixed editorial zone now.
        return t >= todayStart;
      }
      return t >= now && t <= horizon;
    })
    // Live first, then today's finals, then everything still scheduled —
    // each tier chronological within itself. A plain ascending-by-kickoff
    // sort would NOT do this on its own: a final that kicked off earlier
    // today can have an EARLIER startTime than a game still live right now
    // (e.g. a 2pm final vs. a 4pm match still in progress), which would
    // sort the final first under pure chronological order. The explicit
    // status tier is what guarantees "live first" holds regardless.
    .sort((a, b) => {
      const rank = { live: 0, final: 1, scheduled: 2, postponed: 3 };
      const ra = rank[a.status] ?? 4;
      const rb = rank[b.status] ?? 4;
      if (ra !== rb) return ra - rb;
      return Date.parse(a.startTime || 0) - Date.parse(b.startTime || 0);
    });

  upcomingCache.set(cacheKey, { at: Date.now(), games });
  return games;
}

// ---------------------------------------------------------------------------
// MATCH DETAIL — one real Highlightly match, fetched by id, for the game
// detail page. Built directly on mapGame() (the exact same mapper /matches
// and /matches?date= already use), so the detail view's team/score/period/
// clock/events fields are identically sourced — no second normalizer, no
// second game model. Only additive detail-only fields are appended on top:
// venue city/country, referee, and a per-team statistics breakdown.
//
// Endpoint confirmed against the live Sport API PRO spec (highlightly.net/
// sport-api/documentation/, 31 Aug 2026) AND by direct live requests during
// this task: GET /{sport}/matches/{id} for all three sports, response is a
// ONE-ELEMENT ARRAY (not a bare object) — unwrapped via rows()[0] below,
// same helper the list endpoints already use.
// ---------------------------------------------------------------------------

// Football & basketball: raw.statistics is an array of
// { team:{id,name,...}, statistics:[{displayName,value}] }, one entry per
// side — confirmed on a real finished EPL match (39 stat rows/side) and a
// real finished WNBA match (21 stat rows/side). American football exposes
// the same shape under `matchStatistics` instead (per the OpenAPI spec) —
// this could not be verified against a real filled response during this
// task (every current NFL match is still scheduled, so raw.matchStatistics
// was observed only as null); the mapper below is defensive about that: any
// row that doesn't match the expected shape is dropped rather than guessed,
// so an unexpected NFL shape degrades to "no stats section" instead of
// throwing or fabricating values.
function mapMatchStatistics(raw, sportSlug) {
  const src = sportSlug === 'american-football' ? raw.matchStatistics : raw.statistics;
  if (!Array.isArray(src)) return null;
  const out = src
    .filter(t => t && t.team && Array.isArray(t.statistics))
    .map(t => ({
      teamId: t.team.id != null ? String(t.team.id) : null,
      teamName: t.team.name ?? null,
      stats: t.statistics
        .filter(s => s && s.displayName != null && s.value !== undefined && s.value !== null)
        .map(s => ({ label: s.displayName, value: s.value }))
    }))
    .filter(t => t.stats.length);
  return out.length ? out : null;
}

function mapMatchDetail(raw, leagueId, cfg) {
  const base = mapGame(raw, leagueId, cfg);
  return {
    ...base,
    venueCity: raw.venue?.city || null,
    venueCountry: raw.venue?.country || null,
    referee: raw.referee?.name || null,
    statistics: mapMatchStatistics(raw, cfg.sportSlug)
  };
}

// Cached at the SAME scale/TTL as the rail (RAIL_SCALE_CACHE_MS, defined
// above for getUpcomingGames): a single-match detail view is exactly the
// kind of request that gets polled while live, so its cache must stay below
// that poll interval for the same reason the rail's does — see the comment
// on getUpcomingGames. Detail traffic is far lower-volume than the rail
// (one match, one visitor) so there is no case here for a second, longer
// tier the way the full-schedule scale needed one.
const matchDetailCache = new Map(); // id -> { at, detail }

async function getMatchDetail({ league, id } = {}) {
  const cfg = LEAGUE_CONFIG[league];
  if (!cfg || !id) return null;

  const cached = matchDetailCache.get(id);
  if (cached && Date.now() - cached.at < RAIL_SCALE_CACHE_MS) return cached.detail;

  const data = await request(cfg.sportSlug, `/matches/${id}`);
  const raw = rows(data)[0];
  if (!raw) {
    matchDetailCache.delete(id);
    return null;
  }
  const detail = mapMatchDetail(raw, league, cfg);
  matchDetailCache.set(id, { at: Date.now(), detail });
  return detail;
}

async function getStandings({ league, season } = {}) {
  const cfg = LEAGUE_CONFIG[league];
  if (!cfg) return [];
  const effectiveSeason = season ?? CURRENT_SEASON[league];
  if (effectiveSeason == null) {
    const err = new Error(`season is required for standings (league=${league})`);
    err.code = 'SEASON_REQUIRED';
    throw err;
  }

  if (cfg.paramStyle === 'id') {
    const data = await request(cfg.sportSlug, '/standings', { leagueId: cfg.leagueId, season: effectiveSeason });
    return mapStandingsGrouped(data, cfg.sportSlug === 'soccer' ? 'soccer' : 'basketball');
  }
  // NFL: standings uses leagueType + year, not leagueId/season.
  const data = await request(cfg.sportSlug, '/standings', { leagueType: cfg.leagueName, year: effectiveSeason });
  return mapStandingsGrouped(data, 'nfl');
}

async function getTeams({ league, season } = {}) {
  const cfg = LEAGUE_CONFIG[league];
  if (!cfg) return [];

  if (cfg.paramStyle === 'name') {
    // NFL's /teams genuinely supports a league filter.
    const data = await request(cfg.sportSlug, '/teams', { league: cfg.leagueName });
    // The live response also carries two conference placeholder rows named
    // "AFC" and "NFC" (confirmed 30 Aug 2026: real ids, real logos, but
    // name === displayName === abbreviation === the conference name, unlike
    // every actual club) — not a team, so it's dropped here rather than
    // shown as one in the roster.
    return rows(data)
      .filter(r => !['AFC', 'NFC'].includes(r.name))
      .map(r => mapTeam(r, league));
  }

  // basketball/soccer: /teams has no league filter at all (verified against
  // the live OpenAPI spec — only name/limit/offset). Standings already
  // returns the full, current roster for the league+season, grouped, so
  // teams are derived from that instead of an unfilterable global call.
  const standings = await getStandings({ league, season });
  const seen = new Set();
  const teams = [];
  standings.forEach(s => {
    if (s.teamId && !seen.has(s.teamId)) {
      seen.add(s.teamId);
      teams.push(normalizeTeam({
        id: s.teamId, league, name: s.teamName, displayName: s.teamName,
        shortName: shortLabel(s.teamName, null), logo: s.teamLogo
      }));
    }
  });
  return teams;
}

async function getPlayers({ league, teamId, name } = {}) {
  const cfg = LEAGUE_CONFIG[league];
  if (!cfg) return [];

  if (cfg.sportSlug === 'basketball') {
    // Highlightly's basketball vertical has no /players endpoint at all —
    // confirmed against its own OpenAPI spec, not just an empty result set.
    // Returning [] here means NBA/WNBA player calls degrade cleanly instead
    // of throwing a 404 the caller would have to special-case.
    return [];
  }

  const data = await request(cfg.sportSlug, '/players', { name, limit: 20 });
  return rows(data).map(r => mapPlayer(r, league));
}

module.exports = {
  name: 'highlightly',
  isEnabled,
  getGames,
  getUpcomingGames,
  getMatchDetail,
  getStandings,
  getTeams,
  getPlayers,
  SUPPORTED_LEAGUES: LEAGUE_IDS,
  // exported for tests/inspection only — not part of the provider contract
  LEAGUE_CONFIG
};
