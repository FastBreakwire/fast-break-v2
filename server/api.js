/**
 * Fast Break API layer.
 *
 *   Browser  ->  /api/*  ->  provider adapter  ->  Highlightly
 *
 * The browser never sees a provider key or a provider response shape. If no
 * key is configured the routes still answer, flagged as demo data, so the
 * site keeps working in development.
 *
 * Run:  HIGHLIGHTLY_API_KEY=... node server/api.js
 */

const http = require('http');
const provider = require('./highlightlyProvider');
const { LEAGUE_IDS } = require('./models');

const PORT = process.env.PORT || 3000;

// How far ahead the schedule route looks by default — matches the compact
// game rail's own GAME_RAIL_DAYS (index.html). A caller can override with
// ?days= (the full-schedule view asks for a much larger window), clamped
// below to a sane range either way.
const SCHEDULE_DAYS = 14;

/* -------------------------------------------------- demo fallback source */
/* Mirrors the demo set in the page so behaviour is identical with or without
   a running API. These are placeholders, never presented as real results. */
const DEMO_GAMES = [
  { id:'nba-1', sport:'basketball', league:'nba', status:'live',
    homeTeam:'NYK', awayTeam:'PHI', homeScore:74, awayScore:68,
    period:'Q3', clock:'7:41', startTime:null, venue:'Madison Square Garden', broadcast:'ABC' },
  { id:'nba-2', sport:'basketball', league:'nba', status:'live',
    homeTeam:'CLE', awayTeam:'MIA', homeScore:51, awayScore:48,
    period:'Q2', clock:'2:15', startTime:null, venue:'Rocket Arena', broadcast:'ESPN' },
  { id:'wnba-1', sport:'basketball', league:'wnba', status:'scheduled',
    homeTeam:'IND', awayTeam:'NYL', homeScore:null, awayScore:null,
    period:null, clock:null, startTime:'7:00 PM', venue:'Gainbridge Fieldhouse', broadcast:'ESPN' }
];

function demoGames(league) {
  const rows = league ? DEMO_GAMES.filter(g => g.league === league) : DEMO_GAMES;
  return { games: rows, source: 'demo' };
}

/* ------------------------------------------------------------- handlers */

async function handleGames(params) {
  const league = params.get('league');
  if (league && !LEAGUE_IDS.includes(league)) {
    return { status: 400, body: { error: 'unsupported league', supported: LEAGUE_IDS } };
  }
  if (!provider.isEnabled()) {
    return { status: 200, body: demoGames(league) };
  }
  try {
    const games = await provider.getGames({ league, date: params.get('date') });
    return { status: 200, body: { games, source: provider.name } };
  } catch (err) {
    // Never fail the page over a provider outage — degrade to demo data.
    console.error('[api/games]', err.code || err.message);
    return { status: 200, body: { ...demoGames(league), providerError: err.code || 'PROVIDER_ERROR' } };
  }
}

// The upcoming schedule has no demo dataset of its own — DEMO_GAMES is a
// single "today" slate, not a dated range, so faking one here would mean
// inventing dates rather than reusing an existing placeholder. When the
// provider is unavailable this route degrades to an honestly empty list
// instead (the frontend already hides the whole section when it gets none),
// never a fabricated schedule.
async function handleSchedule(params) {
  const league = params.get('league');
  if (league && !LEAGUE_IDS.includes(league)) {
    return { status: 400, body: { error: 'unsupported league', supported: LEAGUE_IDS } };
  }

  if (!provider.isEnabled()) {
    return { status: 200, body: { games: [], source: 'demo' } };
  }

  // full=1 asks for the COMPLETE available range (past + current + future)
  // for one competition — the Full Schedule page's past/matchweek
  // navigation needs this; the compact rail never passes it and keeps using
  // the forward-only window below unchanged.
  if (params.get('full') === '1') {
    try {
      const { games, totalCount, fetchedCount } = await provider.getFullSchedule({ league });
      return { status: 200, body: { games, source: provider.name, totalCount, fetchedCount } };
    } catch (err) {
      console.error('[api/schedule?full=1]', err.code || err.message);
      return { status: 200, body: { games: [], source: 'demo', providerError: err.code || 'PROVIDER_ERROR' } };
    }
  }

  const daysParam = Number(params.get('days'));
  // The full-schedule view legitimately asks for a season-scale window
  // (up to ~280 days); the compact rail always asks for GAME_RAIL_DAYS.
  const days = Number.isFinite(daysParam) && daysParam > 0
    ? Math.min(Math.round(daysParam), 280)
    : SCHEDULE_DAYS;
  // More pages only for a caller that actually asked for a wide window —
  // the compact rail's normal 14-day request stays at the cheap default.
  const maxPages = days > 31 ? 6 : 3;

  try {
    const games = await provider.getUpcomingGames({ league, days, maxPages });
    return { status: 200, body: { games, source: provider.name } };
  } catch (err) {
    console.error('[api/schedule]', err.code || err.message);
    return { status: 200, body: { games: [], source: 'demo', providerError: err.code || 'PROVIDER_ERROR' } };
  }
}

// One real match, by id, for the game detail page. `id` is the Highlightly
// match id already carried on every normalized game object (g.id) — the
// same id the rail/schedule cards already render, never a second id scheme.
async function handleMatch(params) {
  const league = params.get('league');
  const id = params.get('id');
  if (!league || !LEAGUE_IDS.includes(league)) {
    return { status: 400, body: { error: 'unsupported league', supported: LEAGUE_IDS } };
  }
  if (!id) {
    return { status: 400, body: { error: 'id required' } };
  }
  if (!provider.isEnabled()) {
    return { status: 503, body: { error: 'provider not configured', source: 'demo' } };
  }
  try {
    const game = await provider.getMatchDetail({ league, id });
    if (!game) return { status: 404, body: { error: 'not found' } };
    return { status: 200, body: { game, source: provider.name } };
  } catch (err) {
    console.error('[api/match]', err.code || err.message);
    return { status: 502, body: { error: err.code || 'PROVIDER_ERROR' } };
  }
}

function passthrough(method) {
  return async params => {
    if (!provider.isEnabled()) {
      return { status: 503, body: { error: 'provider not configured', source: 'demo' } };
    }
    try {
      const data = await provider[method]({
        league: params.get('league'),
        teamId: params.get('team'),
        season: params.get('season')
      });
      return { status: 200, body: { data, source: provider.name } };
    } catch (err) {
      console.error(`[api/${method}]`, err.code || err.message);
      return { status: 502, body: { error: err.code || 'PROVIDER_ERROR' } };
    }
  };
}

// Competition logos for the sport-nav mega menu — takes no per-request
// params (it returns every competition's crest at once), so it doesn't fit
// the passthrough() shape above (that always forwards league/team/season).
async function handleCompetitionLogos() {
  if (!provider.isEnabled()) {
    return { status: 200, body: { data: {}, source: 'demo' } };
  }
  try {
    const data = await provider.getCompetitionLogos();
    return { status: 200, body: { data, source: provider.name } };
  } catch (err) {
    console.error('[api/competitionLogos]', err.code || err.message);
    return { status: 200, body: { data: {}, source: 'demo', providerError: err.code || 'PROVIDER_ERROR' } };
  }
}

const ROUTES = {
  '/api/games': handleGames,
  '/api/schedule': handleSchedule,
  '/api/match': handleMatch,
  '/api/standings': passthrough('getStandings'),
  '/api/teams': passthrough('getTeams'),
  '/api/competitionLogos': handleCompetitionLogos,
  '/api/players': passthrough('getPlayers'),
  '/api/health': async () => ({
    status: 200,
    body: { ok: true, provider: provider.name, providerEnabled: provider.isEnabled() }
  })
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = ROUTES[url.pathname];

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=15');
  // The documented local dev setup runs the static frontend and this API on
  // two different ports (8080 / 3000) — two different origins as far as the
  // browser is concerned. The response bodies here carry only normalized
  // game/team/standings data, never the provider key, so allowing any origin
  // to read them costs nothing; this does not change what the API does or
  // exposes, only who is allowed to fetch it.
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!route) {
    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'not found' }));
  }
  try {
    const { status, body } = await route(url.searchParams);
    res.writeHead(status);
    res.end(JSON.stringify(body));
  } catch (err) {
    console.error('[api]', err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'internal error' }));
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Fast Break API on :${PORT} — provider ${provider.isEnabled() ? 'live' : 'DEMO (no key)'}`);
  });
}

module.exports = { server, ROUTES };
