/**
 * Highlightly provider adapter — SERVER SIDE ONLY.
 *
 * This is the single place in the codebase that knows Highlightly's raw
 * response shape. Everything above it consumes the normalized models in
 * ./models.js. Swapping to a different provider means writing a sibling
 * adapter with the same four methods; the score UI does not change.
 *
 * The API key is read from the environment and never leaves this process.
 *
 *   HIGHLIGHTLY_API_KEY=...   (required to enable live data)
 *   HIGHLIGHTLY_BASE_URL=...  (optional override)
 *
 * NOTE ON ENDPOINTS
 * -----------------
 * The request paths and field names below are written against the shape
 * Highlightly documents for its basketball/football feeds, but they have NOT
 * been verified against a live account — no key was available. Treat
 * `mapGame`, `mapStanding`, `mapTeam` and `mapPlayer` as the adjustment
 * points: run one real request per sport, then correct the field reads.
 * Nothing outside this file needs to change when you do.
 */

const {
  normalizeGame,
  normalizeStanding,
  normalizeTeam,
  normalizePlayer,
  LEAGUE_IDS
} = require('./models');

const BASE_URL = process.env.HIGHLIGHTLY_BASE_URL || 'https://api.highlightly.net';
const API_KEY = process.env.HIGHLIGHTLY_API_KEY || null;

/** Highlightly groups leagues per sport feed; map our ids onto theirs. */
const PROVIDER_LEAGUE = {
  nba:        { path: 'basketball', league: 'NBA' },
  wnba:       { path: 'basketball', league: 'WNBA' },
  nfl:        { path: 'american-football', league: 'NFL' },
  epl:        { path: 'football', league: 'Premier League' },
  laliga:     { path: 'football', league: 'La Liga' },
  bundesliga: { path: 'football', league: 'Bundesliga' }
};

function isEnabled() {
  return Boolean(API_KEY);
}

async function request(path, params = {}) {
  if (!API_KEY) {
    const err = new Error('HIGHLIGHTLY_API_KEY is not set');
    err.code = 'NO_PROVIDER_KEY';
    throw err;
  }
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  );
  const res = await fetch(`${BASE_URL}/${path}?${qs}`, {
    headers: { 'x-api-key': API_KEY, Accept: 'application/json' }
  });
  if (!res.ok) {
    const err = new Error(`Highlightly ${res.status} on /${path}`);
    err.code = 'PROVIDER_ERROR';
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/* ---------------------------------------------------------------- mapping */

/** Provider status strings -> our three-state model + period token. */
function mapStatus(raw, sport) {
  const s = String(raw || '').toLowerCase();
  if (s.includes('not started') || s.includes('scheduled')) return { status: 'scheduled', period: null };
  if (s.includes('finished') || s.includes('full time') || s === 'ft') return { status: 'final', period: 'FT' };
  if (s.includes('half') && s.includes('time')) return { status: 'live', period: 'HT' };
  if (s.includes('penalt')) return { status: 'live', period: 'PENS' };
  if (s.includes('extra')) return { status: 'live', period: 'ET' };
  if (s.includes('overtime') || s === 'ot') return { status: 'live', period: 'OT' };

  const q = s.match(/q(\d)|(\d)(?:st|nd|rd|th)\s*quarter/);
  if (q) return { status: 'live', period: `Q${q[1] || q[2]}` };
  const h = s.match(/(\d)(?:st|nd)\s*half/);
  if (h) return { status: 'live', period: `${h[1]}H` };

  return { status: 'live', period: sport === 'football' ? '1H' : 'Q1' };
}

function mapGame(raw, leagueId, sport) {
  const { status, period } = mapStatus(raw.status || raw.state, sport);
  return normalizeGame({
    id: String(raw.id ?? raw.matchId ?? raw.gameId),
    sport,
    league: leagueId,
    status,
    period,
    homeTeam: raw.homeTeam?.shortName ?? raw.homeTeam?.name ?? raw.home?.name,
    awayTeam: raw.awayTeam?.shortName ?? raw.awayTeam?.name ?? raw.away?.name,
    homeScore: raw.homeScore ?? raw.score?.home ?? null,
    awayScore: raw.awayScore ?? raw.score?.away ?? null,
    clock: raw.clock ?? raw.minute ?? null,
    startTime: raw.startTime ?? raw.date ?? null,
    venue: raw.venue?.name ?? raw.venue ?? null,
    broadcast: raw.broadcast ?? null
  });
}

function mapStanding(raw) {
  return normalizeStanding({
    teamId: String(raw.team?.id ?? raw.teamId),
    teamName: raw.team?.name ?? raw.teamName,
    teamLogo: raw.team?.logo ?? null,
    position: raw.position ?? raw.rank,
    played: raw.played ?? raw.games,
    wins: raw.wins,
    losses: raw.losses,
    draws: raw.draws ?? null,
    points: raw.points ?? null
  });
}

function mapTeam(raw, leagueId) {
  return normalizeTeam({
    id: String(raw.id),
    league: leagueId,
    name: raw.name ?? raw.displayName,
    shortName: raw.shortName ?? raw.abbreviation ?? null,
    logo: raw.logo ?? null
  });
}

function mapPlayer(raw, leagueId) {
  return normalizePlayer({
    id: String(raw.id),
    league: leagueId,
    teamId: raw.team?.id ? String(raw.team.id) : null,
    name: raw.name ?? raw.displayName,
    position: raw.position ?? null,
    number: raw.number ?? raw.jersey ?? null
  });
}

/* ------------------------------------------------------------ public API */

async function getGames({ league, date } = {}) {
  const cfg = PROVIDER_LEAGUE[league];
  if (!cfg) return [];
  const sport =
    cfg.path === 'football' ? 'football'
    : cfg.path === 'american-football' ? 'americanfootball'
    : 'basketball';

  const data = await request(`${cfg.path}/matches`, { league: cfg.league, date });
  const rows = data.data ?? data.matches ?? data ?? [];
  return rows.map(r => mapGame(r, league, sport));
}

async function getStandings({ league, season } = {}) {
  const cfg = PROVIDER_LEAGUE[league];
  if (!cfg) return [];
  const data = await request(`${cfg.path}/standings`, { league: cfg.league, season });
  const rows = data.data ?? data.standings ?? data ?? [];
  return rows.map(mapStanding);
}

async function getTeams({ league } = {}) {
  const cfg = PROVIDER_LEAGUE[league];
  if (!cfg) return [];
  const data = await request(`${cfg.path}/teams`, { league: cfg.league });
  const rows = data.data ?? data.teams ?? data ?? [];
  return rows.map(r => mapTeam(r, league));
}

async function getPlayers({ league, teamId } = {}) {
  const cfg = PROVIDER_LEAGUE[league];
  if (!cfg) return [];
  const data = await request(`${cfg.path}/players`, { league: cfg.league, team: teamId });
  const rows = data.data ?? data.players ?? data ?? [];
  return rows.map(r => mapPlayer(r, league));
}

module.exports = {
  name: 'highlightly',
  isEnabled,
  getGames,
  getStandings,
  getTeams,
  getPlayers,
  SUPPORTED_LEAGUES: LEAGUE_IDS
};
