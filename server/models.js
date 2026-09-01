/**
 * Normalized, provider-independent models.
 *
 * These shapes are the contract between the API layer and every consumer
 * (website score rail, mobile app). No provider field names leak past this
 * file — adapters map into these, never the other way round.
 */

// ucl/uel added — Champions League and Europa League are UEFA competitions,
// not domestic leagues (no fixed member set; the field changes every season
// by qualification). They are backend-only until the frontend's nav content
// map (data-driven from data/sports.js) chooses to light them up — adding
// them here cannot make them appear anywhere by itself.
const LEAGUE_IDS = ['nba', 'wnba', 'nfl', 'epl', 'laliga', 'bundesliga', 'ucl', 'uel'];

const SPORT_BY_LEAGUE = {
  nba: 'basketball',
  wnba: 'basketball',
  nfl: 'americanfootball',
  epl: 'football',
  laliga: 'football',
  bundesliga: 'football',
  ucl: 'football',
  uel: 'football'
};

/**
 * Valid period tokens per sport. `scheduled` and `final` are carried on
 * `status`; `period` describes where a live game currently stands.
 */
const PERIODS = {
  basketball: ['Q1', 'Q2', 'HT', 'Q3', 'Q4', 'OT'],
  americanfootball: ['Q1', 'Q2', 'HT', 'Q3', 'Q4', 'OT'],
  football: ['1H', 'HT', '2H', 'ET', 'PENS', 'FT']
};

// 'postponed' and 'cancelled' are accepted so a real provider value never
// gets silently coerced to 'scheduled' — but neither has been observed from
// Highlightly during testing (only "Not started" / live phases / "Finished"
// were seen). The frontend already renders any non-'live' status as a
// not-yet-started card (it shows startTime), so admitting these two values
// here cannot break existing rendering — worst case a postponed game reads
// like a scheduled one until the UI is taught to say "Postponed" explicitly.
const STATUSES = ['scheduled', 'live', 'final', 'postponed', 'cancelled'];

/**
 * @typedef {Object} Game
 * @property {string}      id
 * @property {string}      sport       basketball | football | americanfootball
 * @property {string}      league      one of LEAGUE_IDS
 * @property {string}      status      scheduled | live | final | postponed | cancelled
 * @property {string}      homeTeam    short display label (existing field — the score
 *                                     rail renders this directly as text, so it stays
 *                                     a short string exactly as before; demo data and
 *                                     real data both satisfy this identically)
 * @property {string}      awayTeam
 * @property {number|null} homeScore
 * @property {number|null} awayScore
 * @property {string|null} period      sport-specific token, see PERIODS
 * @property {string|null} clock       "7:41" (basketball) | "67'" / "45+2'" (football)
 * @property {string|null} startTime
 * @property {string|null} venue
 * @property {string|null} broadcast
 *
 * Additive fields below — NOT read by the current frontend. They exist so the
 * data layer is ready for future team/player work without a second normalizer
 * or a second fetch. Every one of them defaults to null and is safe to ignore.
 * @property {string|null} homeTeamId
 * @property {string|null} awayTeamId
 * @property {string|null} homeTeamName   full team name, e.g. "New York Knicks"
 * @property {string|null} awayTeamName
 * @property {string|null} homeTeamLogo   remote URL, never downloaded/stored
 * @property {string|null} awayTeamLogo
 * @property {Object|null} periods        per-period score breakdown, sport-shaped:
 *                                        basketball/NFL: {q1:{home,away}, q2:{...}, ...}
 *                                        football: always null — Highlightly's match
 *                                        payload carries no half-by-half score split,
 *                                        only the running total (confirmed, not a gap
 *                                        in this mapping)
 * @property {Array|null}  events         football goal/card/sub events, only present
 *                                        on a single-match detail fetch, never on a
 *                                        list — null otherwise, never fabricated
 * @property {string|null} round          the provider's own competition-round string,
 *                                        e.g. "Regular Season - 3" (football leagues),
 *                                        "League Stage - 4" (UCL/UEL) — confirmed real
 *                                        and present on the LIST endpoint too, not just
 *                                        single-match detail. Basketball and NFL do not
 *                                        expose an equivalent per-round field (confirmed:
 *                                        basketball's week/stage are always null; NFL's
 *                                        own `round` is a season-phase constant like
 *                                        "regular-season", not a per-week number) — both
 *                                        simply carry round: null, never a guessed value.
 */
function normalizeGame(g) {
  const sport = g.sport || SPORT_BY_LEAGUE[g.league] || null;
  const status = STATUSES.includes(g.status) ? g.status : 'scheduled';
  return {
    id: String(g.id),
    sport,
    league: g.league,
    status,
    homeTeam: g.homeTeam ?? null,
    awayTeam: g.awayTeam ?? null,
    homeScore: num(g.homeScore),
    awayScore: num(g.awayScore),
    period: (status === 'scheduled' || status === 'postponed' || status === 'cancelled')
      ? null : (g.period ?? null),
    clock: g.clock ?? null,
    startTime: g.startTime ?? null,
    venue: g.venue ?? null,
    broadcast: g.broadcast ?? null,
    homeTeamId: g.homeTeamId ?? null,
    awayTeamId: g.awayTeamId ?? null,
    homeTeamName: g.homeTeamName ?? null,
    awayTeamName: g.awayTeamName ?? null,
    homeTeamLogo: g.homeTeamLogo ?? null,
    awayTeamLogo: g.awayTeamLogo ?? null,
    periods: g.periods ?? null,
    events: g.events ?? null,
    round: g.round ?? null
  };
}

/**
 * @typedef {Object} Standing
 * Draws are meaningful in football and null for basketball/NFL;
 * points are null where a league ranks on win pct instead (basketball, NFL).
 *
 * `group`/`conference`/`division` are additive and carry Highlightly's own
 * grouping — e.g. basketball's "Western Conference", NFL's "American Football
 * Conference"/"AFC". Nothing is invented: a sport that doesn't provide one
 * of these levels leaves it null rather than guessing. Kept as a flat row
 * (not nested groups) so this stays a plain array like the rest of the API,
 * exactly as `passthrough()` in api.js already expects.
 *
 * `scoreFor`/`scoreAgainst` generalise basketball's points-scored/against and
 * football's goals-for/against under one sport-neutral name.
 */
function normalizeStanding(s) {
  return {
    teamId: String(s.teamId),
    teamName: s.teamName ?? null,
    teamLogo: s.teamLogo ?? null,
    position: num(s.position),
    played: num(s.played),
    wins: num(s.wins),
    losses: num(s.losses),
    draws: num(s.draws),
    points: num(s.points),
    scoreFor: num(s.scoreFor),
    scoreAgainst: num(s.scoreAgainst),
    group: s.group ?? null,
    conference: s.conference ?? null,
    division: s.division ?? null
  };
}

/**
 * @typedef {Object} Team {id, league, name, shortName, logo}
 * `displayName` is additive: NFL's API distinguishes a short club name
 * ("Bears") from the full one ("Chicago Bears") in separate fields; other
 * sports only give the full name, so `displayName` simply mirrors `name`
 * there rather than being left inconsistently null.
 */
function normalizeTeam(t) {
  return {
    id: String(t.id),
    league: t.league,
    name: t.name ?? null,
    displayName: t.displayName ?? t.name ?? null,
    shortName: t.shortName ?? null,
    logo: t.logo ?? null
  };
}

/** @typedef {Object} Player {id, league, teamId, name, position, number} */
function normalizePlayer(p) {
  return {
    id: String(p.id),
    league: p.league,
    teamId: p.teamId ?? null,
    name: p.name ?? null,
    position: p.position ?? null,
    number: p.number ?? null
  };
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

module.exports = {
  LEAGUE_IDS,
  SPORT_BY_LEAGUE,
  PERIODS,
  STATUSES,
  normalizeGame,
  normalizeStanding,
  normalizeTeam,
  normalizePlayer
};
