/**
 * Fast Break Editorial Scout — Source Matrix.
 *
 * Every RSS entry below was live-verified (fetched, read, checked for a
 * current pubDate — not just an HTTP 200) before being added here — nothing
 * in this file is "probably available". Feeds that were checked and found
 * dead/stale/unusable are listed in DEAD_OR_UNAVAILABLE at the bottom, on
 * purpose, so the next person doesn't re-guess the same URL.
 *
 * SOURCE EXPANSION (2026-09): ESPN must not be the de-facto default simply
 * because it previously had 3 dedicated, clean, single-league feeds while
 * every other outlet had at most one shared, noisy, multi-topic feed. That
 * structural imbalance — not feed-array order — was the real root cause of
 * ESPN dominance (see lib/verify.js's pickPrimarySource, which has always
 * chosen the primary source by earliest publish time + tier, never by
 * "whichever feed was fetched first"). The fix is broader real coverage:
 * this matrix now also carries BBC, The Guardian, Kicker, an additional Sky
 * Sports Transfer Centre feed, Fox Sports, and Sport1 — all confirmed live
 * with current items at verification time. ESPN's own 3 feeds are kept
 * (ESPN remains a legitimate, still-useful source — see the file's own
 * README-style notes above pickPrimarySource) but are listed LAST below,
 * and pickPrimarySource now explicitly deprioritizes ESPN as a tie-break
 * (see its own comment) so it no longer wins primary-source status purely
 * by being fast/frequent when an equally-timed non-ESPN, or any official,
 * source is available.
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

  // --- Tier 2: trusted media / publisher (non-ESPN, checked first) --------
  {
    id: 'bbc-football',
    outlet: 'BBC Sport',
    tier: 2,
    url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    // Confirmed by live fetch (2026-09-08): dedicated football feed
    // spanning every competition BBC covers, not just the Premier League —
    // needs the same post-fetch league matching as ESPN Soccer/Sky/Yahoo.
    leagueHint: null,
    scopedToSingleLeague: false,
    possibleLeagues: ['epl', 'laliga', 'bundesliga', 'ucl', 'uel']
  },
  {
    id: 'guardian-football',
    outlet: 'The Guardian',
    tier: 2,
    url: 'https://www.theguardian.com/football/rss',
    // Confirmed by live fetch (2026-09-08): dedicated football feed,
    // multi-competition.
    leagueHint: null,
    scopedToSingleLeague: false,
    possibleLeagues: ['epl', 'laliga', 'bundesliga', 'ucl', 'uel']
  },
  {
    id: 'kicker-bundesliga',
    outlet: 'kicker',
    tier: 2,
    url: 'https://newsfeed.kicker.de/news/bundesliga',
    // Confirmed by live fetch (2026-09-08): dedicated Bundesliga feed from
    // Germany's leading football outlet — league-specific by construction,
    // same as bundesliga-official above. Items are German-language; Scout's
    // own team/competition name matching (data/sports.js) still resolves
    // correctly since club/competition names are largely shared across
    // languages, and the article-generation stage (Control Center) writes
    // its own English-language copy from whatever evidence it retrieves.
    leagueHint: 'bundesliga',
    scopedToSingleLeague: true
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
    id: 'sky-sports-transfer-centre',
    outlet: 'Sky Sports',
    tier: 2,
    url: 'https://www.skysports.com/rss/12691',
    // Confirmed by live fetch (2026-09-08): Sky's dedicated Transfer Centre
    // feed — narrower than sky-sports-news above, but a genuinely different
    // item set (transfer-specific), not a mirror of it.
    leagueHint: null,
    scopedToSingleLeague: false,
    possibleLeagues: ['epl', 'laliga', 'bundesliga', 'ucl', 'uel']
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
  },
  {
    id: 'fox-sports',
    outlet: 'FOX Sports',
    tier: 2,
    url: 'https://api.foxsports.com/v2/content/optimized-rss?partnerKey=MB0Wehpmuj2lUhuRhQaafhBjAJqaPU244mlTDK1i&size=30',
    // Confirmed by live fetch (2026-09-08): general combined feed, US-sports
    // leaning (useful additional coverage for NBA/WNBA/NFL/college
    // football), needs the same post-filtering as CBS/Yahoo.
    leagueHint: null,
    scopedToSingleLeague: false,
    possibleLeagues: ['nba', 'wnba', 'nfl', 'college-football']
  },
  {
    id: 'sport1-news',
    outlet: 'SPORT1',
    tier: 2,
    url: 'https://www.sport1.de/news.rss',
    // Confirmed by live fetch (2026-09-08, follows one redirect to
    // /feed — Node's fetch follows it automatically). General German sports
    // feed, Bundesliga-relevant among other content; German-language, same
    // reasoning as kicker-bundesliga above re: name matching + English
    // article generation.
    leagueHint: null,
    scopedToSingleLeague: false,
    possibleLeagues: ['bundesliga']
  },

  // --- Tier 2: ESPN — kept, but checked LAST, never the default -----------
  // ESPN remains a legitimate, often-fast, sometimes-exclusive source (see
  // notes.tier3 below and pickPrimarySource's own comment) — it is not
  // removed and its feeds are not degraded. It is simply no longer
  // structurally advantaged over everything else in this file: it now has
  // exactly as many dedicated feeds relative to its competitors as before,
  // but the OTHER outlets above have real dedicated/near-dedicated coverage
  // too, and pickPrimarySource (lib/verify.js) explicitly deprioritizes
  // ESPN as a tie-break when timing is close.
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
    'WNBA and La Liga still have no dedicated feed in this matrix (see',
    'DEAD_OR_UNAVAILABLE — every official/near-official candidate URL',
    'checked for both was dead or badly stale) and are only reachable',
    'through the general/combined tier-2 feeds above (BBC/Guardian/Sky/CBS/',
    'Yahoo/Fox/ESPN Soccer) plus their own team names matching against',
    'data/sports.js. Treat their candidate counts as structurally lower than',
    'the other 6 competitions — that is a source-matrix gap, not evidence',
    'that less is actually happening in those leagues.'
  ].join(' ')
};

// Checked and found dead/unusable — kept here so nobody re-guesses these.
const DEAD_OR_UNAVAILABLE = [
  { outlet: 'NBA.com', reason: 'No league-wide RSS. Only ~30 separate per-team feeds exist (nba.com/{team}/news/rss.html) — too fragmented for V1.' },
  { outlet: 'NFL.com', reason: 'No official RSS found (nfl.com/feeds/rss/news -> 404); only unofficial third-party scrapers.' },
  { outlet: 'WNBA.com', reason: 'The only "RSS" URL findable is a dead /archive/ page with no live items.' },
  { outlet: 'Premier League (premierleague.com)', reason: 'No public RSS found (premierleague.com/rss -> 404).' },
  { outlet: 'La Liga (laliga.com)', reason: 'No public RSS found (laliga.com/en-GB/rss -> 404).' },
  { outlet: 'UEFA.com', reason: "Official newsroom feed (uefa.newsmarket.com/Rss) returns an SSL handshake failure — unreachable." },
  { outlet: 'Reuters', reason: 'Reuters officially discontinued all RSS feeds in June 2020. Re-confirmed 2026-09-08: apnews.com/apf-sports and similar endpoints redirect to plain HTML pages, no feed.' },
  { outlet: 'AP News', reason: 'Re-checked live 2026-09-08: apnews.com/apf-sports?output=rss redirects (301) to https://apnews.com/sports, a normal HTML page — no RSS endpoint exists. Confirmed dead, not just unreachable.' },
  { outlet: 'The Athletic', reason: 'Unclear RSS availability post-NYT integration, and largely paywalled even if a feed exists. Treated as a web-search verification target, not an RSS source.' },
  { outlet: 'TNT Sports', reason: 'Every candidate RSS path tried (tntsports.co.uk/rss.xml, /football/rss.xml, /rss/football.xml) either 404s or is blocked by an edge/WAF "Access Denied" response (2026-09-08). No working feed found; do not invent one.' },
  { outlet: 'NBC Sports', reason: 'Every candidate path tried (nbcsports.com/rss.xml, /nbc-sports-rss.xml, /rss/nba, /rss/nfl, soccer.nbcsports.com/feed/) either 404s or redirects to a plain HTML page, not a feed (2026-09-08).' },
  { outlet: 'Marca', reason: "The one reachable feed found (marca.com's English Premier League section RSS) returned HTTP 200 but with lastBuildDate stuck at April 2026 — stale/abandoned, not live. Excluded rather than added as a dead-weight source." },
  { outlet: 'AS (as.com)', reason: "The English La Liga section feed (en.as.com/rss/tags/rss2.xml) 404s; the Spanish-language La Liga feed (as.com/rss/futbol/primera.xml) returns HTTP 200 but with lastBuildDate from August 2022 — genuinely dead despite responding." },
  { outlet: 'Arsenal / Liverpool / Man Utd / Chelsea / Bayern Munich / Real Madrid / FC Barcelona (official club sites)', reason: 'Checked 2026-09-08 — every candidate club RSS URL 404s or is blocked (403). Modern club sites do not expose stable public RSS; not worth a per-club scraper for V1.' }
];

module.exports = { feeds, notes, DEAD_OR_UNAVAILABLE };
