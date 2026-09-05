/**
 * Fast Break Editorial Scout — Source Matrix.
 *
 * Every RSS entry below was live-verified (fetched and read) before being
 * added here — nothing in this file is "probably available". Feeds that
 * were checked and found dead/nonexistent are listed in DEAD_OR_UNAVAILABLE
 * at the bottom, on purpose, so the next person doesn't re-guess the same
 * URL and doesn't wonder why NBA.com or WNBA.com aren't sources.
 *
 * Tiers (fixed vocabulary, matches the V1 spec exactly):
 *   1 = Official / Primary   (league, team, competition's own release)
 *   2 = Trusted Media / Publisher (ESPN, Sky, CBS, Yahoo, Bundesliga.com's
 *       own newsroom counts as tier 1 since it IS the official source, but
 *       the OTHERS below are all tier 2 — none of them are Fast Break)
 *   3 = Insider / Reporter   (not RSS-polled in V1, see NOTES)
 *
 * module.exports shape: { feeds: [...], notes: {...}, DEAD_OR_UNAVAILABLE: [...] }
 */

const feeds = [
  // --- Tier 1: official ---------------------------------------------------
  {
    id: 'bundesliga-official',
    outlet: 'Bundesliga.com',
    tier: 1,
    url: 'https://www.bundesliga.com/rss/en/rss-news.rss',
    // League-specific by construction — the feed itself only ever carries
    // Bundesliga content, so no post-fetch league filtering is needed here.
    leagueHint: 'bundesliga',
    scopedToSingleLeague: true
  },

  // --- Tier 2: trusted media / publisher -----------------------------------
  {
    id: 'espn-nba',
    outlet: 'ESPN',
    tier: 2,
    url: 'https://www.espn.com/espn/rss/nba/news',
    leagueHint: 'nba',
    scopedToSingleLeague: true
  },
  {
    id: 'espn-nfl',
    outlet: 'ESPN',
    tier: 2,
    url: 'https://www.espn.com/espn/rss/nfl/news',
    leagueHint: 'nfl',
    scopedToSingleLeague: true
  },
  {
    id: 'espn-soccer',
    outlet: 'ESPN',
    tier: 2,
    url: 'https://www.espn.com/espn/rss/soccer/news',
    // Confirmed by live fetch: ONE combined feed across every soccer
    // competition ESPN covers (EPL, women's football, internationals, ...).
    // Never trust this feed's items as any one league without matching the
    // item text against TEAMS_CFG/COMPETITIONS_CFG first.
    leagueHint: null,
    scopedToSingleLeague: false,
    possibleLeagues: ['epl', 'laliga', 'bundesliga', 'ucl', 'uel']
  },
  {
    id: 'sky-sports-news',
    outlet: 'Sky Sports',
    tier: 2,
    url: 'https://www.skysports.com/rss/12040',
    // Confirmed by live fetch: general Sky Sports News feed, not
    // football-only (an F1 item was in the same fetch as a transfer item).
    leagueHint: null,
    scopedToSingleLeague: false,
    possibleLeagues: ['epl', 'laliga', 'bundesliga', 'ucl', 'uel', 'nba', 'nfl']
  },
  {
    id: 'cbs-sports-headlines',
    outlet: 'CBS Sports',
    tier: 2,
    url: 'https://www.cbssports.com/rss/headlines/',
    // Confirmed by live fetch: general headlines, not sport-specific.
    leagueHint: null,
    scopedToSingleLeague: false,
    possibleLeagues: ['nba', 'wnba', 'nfl', 'epl', 'laliga', 'bundesliga', 'ucl', 'uel']
  },
  {
    id: 'yahoo-sports',
    outlet: 'Yahoo Sports',
    tier: 2,
    url: 'https://sports.yahoo.com/rss/',
    // Confirmed by live fetch: the single noisiest feed in the matrix — the
    // same fetch that carried a real NBA trade story also carried a Texas
    // high-school football recap and an adaptive-baseball program story.
    // Needs the most aggressive post-filtering of any source here.
    leagueHint: null,
    scopedToSingleLeague: false,
    possibleLeagues: ['nba', 'wnba', 'nfl', 'epl', 'laliga', 'bundesliga', 'ucl', 'uel']
  }
];

const notes = {
  tier3: [
    'Individual insiders/reporters (the "breaks trades first" tier) are NOT',
    'RSS-polled in V1 — there is no public RSS for X/Twitter, and a paid API',
    'contract is explicitly out of scope. In practice this tier still reaches',
    'the Scout indirectly: a real insider scoop is almost always turned into',
    'a tier-2 article ("Sources: ...") within minutes, which the feeds above',
    'do catch. Confirmed live today: the ESPN NBA feed carried exactly this',
    'pattern ("Sources: Simmons, Kings agree to one-year deal").'
  ].join(' '),
  weakCoverage: [
    'WNBA and La Liga have no dedicated feed in this matrix (see',
    'DEAD_OR_UNAVAILABLE) and are only reachable through the general/combined',
    'tier-2 feeds above (Sky/CBS/Yahoo/ESPN Soccer) plus their own team names',
    'matching against data/sports.js. Treat their candidate counts as',
    'structurally lower than the other 6 competitions — that is a source-',
    'matrix gap, not evidence that less is actually happening in those leagues.'
  ].join(' ')
};

// Checked and found dead/unusable — kept here so nobody re-guesses these.
const DEAD_OR_UNAVAILABLE = [
  { outlet: 'NBA.com', reason: 'No league-wide RSS. Only ~30 separate per-team feeds exist (nba.com/{team}/news/rss.html) — too fragmented for V1.' },
  { outlet: 'NFL.com', reason: 'No official RSS found; only unofficial third-party scrapers.' },
  { outlet: 'WNBA.com', reason: 'The only "RSS" URL findable is a dead /archive/ page with no live items.' },
  { outlet: 'Premier League (premierleague.com)', reason: 'No public RSS found.' },
  { outlet: 'La Liga (laliga.com)', reason: 'No public RSS found.' },
  { outlet: 'UEFA.com', reason: "Official newsroom feed (uefa.newsmarket.com/Rss) returns an SSL handshake failure — unreachable." },
  { outlet: 'Reuters', reason: 'Reuters officially discontinued all RSS feeds in June 2020.' },
  { outlet: 'AP News', reason: 'Not reachable from this environment at spec time — genuinely unverified, not confirmed dead. Re-check before relying on it.' },
  { outlet: 'BBC Sport', reason: 'Not reachable from this environment at spec time — genuinely unverified, not confirmed dead. Re-check before relying on it.' },
  { outlet: 'The Athletic', reason: 'Unclear RSS availability post-NYT integration, and largely paywalled even if a feed exists. Treated as a web-search verification target, not an RSS source.' }
];

module.exports = { feeds, notes, DEAD_OR_UNAVAILABLE };
