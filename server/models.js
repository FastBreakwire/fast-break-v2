/**
 * Normalized, provider-independent models.
 *
 * These shapes are the contract between the API layer and every consumer
 * (website score rail, mobile app). No provider field names leak past this
 * file — adapters map into these, never the other way round.
 */

const LEAGUE_IDS = ['nba', 'wnba', 'nfl', 'epl', 'laliga', 'bundesliga'];

const SPORT_BY_LEAGUE = {
  nba: 'basketball',
  wnba: 'basketball',
  nfl: 'americanfootball',
  epl: 'football',
  laliga: 'football',
  bundesliga: 'football'
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

const STATUSES = ['scheduled', 'live', 'final'];

/**
 * @typedef {Object} Game
 * @property {string}      id
 * @property {string}      sport       basketball | football | americanfootball
 * @property {string}      league      one of LEAGUE_IDS
 * @property {string}      status      scheduled | live | final
 * @property {string}      homeTeam    short display name
 * @property {string}      awayTeam
 * @property {number|null} homeScore
 * @property {number|null} awayScore
 * @property {string|null} period      sport-specific token, see PERIODS
 * @property {string|null} clock       "7:41" (basketball) | "67'" / "45+2'" (football)
 * @property {string|null} startTime
 * @property {string|null} venue
 * @property {string|null} broadcast
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
    period: status === 'scheduled' ? null : (g.period ?? null),
    clock: g.clock ?? null,
    startTime: g.startTime ?? null,
    venue: g.venue ?? null,
    broadcast: g.broadcast ?? null
  };
}

/**
 * @typedef {Object} Standing
 * Draws are meaningful in football and null for basketball/NFL;
 * points are null where a league ranks on win pct instead.
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
    points: num(s.points)
  };
}

/** @typedef {Object} Team {id, league, name, shortName, logo} */
function normalizeTeam(t) {
  return {
    id: String(t.id),
    league: t.league,
    name: t.name ?? null,
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
