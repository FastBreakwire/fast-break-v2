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

const ROUTES = {
  '/api/games': handleGames,
  '/api/standings': passthrough('getStandings'),
  '/api/teams': passthrough('getTeams'),
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
