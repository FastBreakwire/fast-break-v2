/**
 * Fast Break — central story data.
 *
 * THIS IS THE FILE YOU EDIT TO PUBLISH NEWS. Nothing else needs to change:
 * index.html renders whatever is in here into the right league section, and
 * the Story View builds the article straight from these fields.
 *
 *   {
 *     id,          // unique kebab-case slug, include the date
 *     sport,       // basketball | football | americanfootball
 *     league,      // nba | wnba | nfl | epl | laliga | bundesliga
 *     category,    // NBA/WNBA : trade | signing | extension | waiver | roster |
 *                  //            contract | legal | investigation | league |
 *                  //            results | standings | rumor
 *                  // NFL      : roster | contract | legal | injury | game |
 *                  //            league | standings
 *                  // football : transfer | contract | match | injury |
 *                  //            manager | league | fixtures
 *                  // never use NBA transaction words (trade, waiver, signing)
 *                  // for football
 *     status,      // confirmed | report | scheduled
 *     headline,
 *     dek,         // one-sentence lead shown under the headline. null if none.
 *     summary,     // card text. Keep it short — the card has little room.
 *     body,        // ARRAY of paragraph strings. Never one big HTML string.
 *     source,      // outlet, plus "(official)" when it is a club/league release
 *     sourceUrl,   // verified link to the original. EDITORIAL ONLY — this is
 *                  // never rendered to the reader. The article shows the
 *                  // outlet name and the date, nothing else.
 *     publishedAt, // YYYY-MM-DD. Original publish date — never rewritten by
 *                  // a later content update, even for a tracker/reference
 *                  // article edited in place.
 *     updatedAt,   // YYYY-MM-DD, ONLY when a real update time is known.
 *                  // For a tracker/reference/overview article (see
 *                  // articleMode below) that has genuinely been updated,
 *                  // this drives homepage freshness ranking INSTEAD of
 *                  // publishedAt — see index.html's effectiveHomepageDate.
 *                  // Every other story ranks off publishedAt exactly as
 *                  // before; omitting updatedAt is always safe.
 *     image,       // Fast Break-owned asset path, or null. Never hotlinked,
 *                  // never a stand-in.
 *     video,       // null, OR a validated structured embed object built by
 *                  // the Control Center's video-provider registry:
 *                  // { provider: 'youtube'|'vimeo', id, title, sourceName,
 *                  //   sourceUrl, official, embeddable, rightsStatus }.
 *                  // index.html's renderVideo()/renderEmbedVideo() only
 *                  // ever build an iframe from a format-revalidated
 *                  // provider+id pair — never raw HTML stored here.
 *     articleMode, // optional: breaking | news | performance | overview |
 *                  // tracker | reference | explainer | feature. Purely
 *                  // informational + drives homepage freshness (see
 *                  // updatedAt above) — omit or leave null freely.
 *     continuityKey, // optional: identifies a tracker/reference/overview
 *                  // article as an ongoing series within one season (e.g.
 *                  // 'bundesliga:tracker:man-of-the-match:2026-27') so a
 *                  // later Scout run can offer an in-place UPDATE instead
 *                  // of a duplicate. Never used to auto-publish anything.
 *     featured,    // EDITORIAL PLACEMENT — HERO STORY, a manually selected
 *                  // global homepage Hero (Control Center's draft editor,
 *                  // one toggle, never hand-authored free text). MULTI-HERO
 *                  // (2026-09): any number of stories may carry featured:true
 *                  // at once — turning it on for one story never demotes any
 *                  // other. index.html's homepage rotates through every
 *                  // featured:true story in the global Hero slot (freshest
 *                  // first, same ranking as everywhere else on the page; see
 *                  // renderHomeLead/showHero); a single one is simply static.
 *                  // featured:true ALSO makes that same story the Hero / Big
 *                  // Story on its own league page (and only that league —
 *                  // every other league's page is untouched); a league page
 *                  // never rotates — if more than one of that league's
 *                  // stories is featured, the freshest one wins there (same
 *                  // tie-break as everywhere else — see renderStories()).
 *                  // Always implies showOnHomepage:true (below).
 *                  // If no story in a given scope (global, or one league)
 *                  // has featured:true, the existing automatic freshness
 *                  // ranking decides the Hero/Big Story exactly as before —
 *                  // see index.html's rankedAll/rankedFor and renderHomeLead/
 *                  // renderStories. A gameResult story (below) is additionally
 *                  // skipped for the automatic (non-featured) global Hero
 *                  // slot by default — featured:true is its one explicit
 *                  // manual override — see index.html's heroEligible().
 *     showOnHomepage, // EDITORIAL PLACEMENT — SHOW ON HOMEPAGE. Omitted or
 *                  // true (the default — every story published before this
 *                  // field existed is unaffected): eligible for the global
 *                  // homepage's modules (Top News, Latest, this hub's lead).
 *                  // Explicit false: excluded from all of those, but the
 *                  // story is otherwise completely unaffected — it still
 *                  // ranks normally on its own league page, its article
 *                  // page, and related-stories. A gameResult story may
 *                  // freely use showOnHomepage:true without that making it
 *                  // eligible for the Hero slot (see featured/gameResult).
 *     gameResult,  // optional, set only by the Control Center's game_result
 *                  // pipeline (a WEBSITE-promoted final score, never set by
 *                  // hand). WEBSITE ≠ HERO: promoting a game is a normal
 *                  // publish, not a feature request, so a gameResult story
 *                  // is excluded from the automatic (non-featured) all-sports
 *                  // Hero slot by default — it still ranks normally
 *                  // everywhere else (Latest, Top News, its league feed,
 *                  // its own article page) and may explicitly opt into
 *                  // showOnHomepage. See index.html's heroEligible().
 *     priority     // high | normal | low. EDITORIAL WEIGHT, and deliberately
 *                  // separate from `featured`. It sets how much room a story
 *                  // earns, not where it sits on the page:
 *                  //   high   ~250-500 words — league-level or career-level news
 *                  //   normal ~100-250 words — the everyday wire
 *                  //   low     ~50-120 words, 2-3 paragraphs — a procedural
 *                  //           note, a minor move, a short injury update
 *                  // A story can be priority:"high" and featured:false, and a
 *                  // featured story can be priority:"normal". Length follows
 *                  // priority; the Big Story slot follows `featured`.
 *   }
 *
 * Rules that keep the feed trustworthy:
 *   - status "confirmed" means official or on the record; reporting that is not
 *     yet announced by the club/league is "report"; anything not yet played or
 *     not yet due is "scheduled".
 *   - `body` carries only what the cited source actually supports. No invented
 *     quotes, figures, background or timestamps. If the material runs out the
 *     article is short — that is the correct outcome for a wire.
 *   - image stays null unless a Fast Break-owned asset genuinely matches.
 *   - sourceUrl is a link that was actually checked. Never guessed.
 *   - updatedAt stays null unless a genuine update time is known.
 *   - the feed is not padded. A league with fewer strong stories shows fewer.
 *   - length follows `priority`, never a word target. A minor transaction that
 *     is fully told in three paragraphs stays three paragraphs. Information
 *     density beats word count.
 *
 * Loaded as a classic script before the main bundle, so it works over file://
 * as well as from a server.
 */

// ===========================================================================
// CENTRAL STORY DATA — single source of truth for every rendered story
// ---------------------------------------------------------------------------
// Re-researched and re-verified 29-30 Aug 2026. Every story carries a real
// article body and a source URL that returned 200 on the day of publication.
//
// IMAGES: only three stories carry one. Every asset in assets/ is a Fast Break
// social graphic with its own headline burned into the artwork, so an image can
// only go on the story it was actually made for — putting the Marmoush card on
// a different Spurs story would print a contradicting headline on the page.
// The remaining assets are held for the stories they belong to.
// ===========================================================================
window.FB_STORIES = [

  /* ----------------------------------------------------------------- NBA */
  {
    id: 'nba-derozan-nuggets-2026-08-21',
    sport: 'basketball', league: 'nba', category: 'signing', status: 'confirmed',
    headline: 'DeMar DeRozan signs with the Nuggets on a one-year deal',
    dek: 'The six-time All-Star lands in Denver on the veteran minimum after a month on the open market.',
    summary: 'A one-year deal worth $3.9m, the veteran minimum for players with ten or more years of service.',
    body: [
      'DeMar DeRozan has agreed to sign with the Denver Nuggets on a one-year contract worth $3.9 million, the veteran minimum for players with ten or more years of NBA service.',
      'DeRozan reached free agency after the Sacramento Kings waived him last month, when trade discussions between the two sides failed to produce a deal. He had spent the previous two seasons in Sacramento, averaging 18.4 points and 4.1 assists per game last year.',
      'He arrives in Denver for his 18th NBA season. Drafted ninth overall by Toronto in 2009, DeRozan carries career averages of 21.1 points, 4.3 rebounds and 4.1 assists on 47.1% shooting, and was last named an All-Star in 2022 with Chicago. The Nuggets are his fifth franchise.',
      'Reporting at the time of the agreement said DeRozan settled on Denver after conversations with Nikola Jokic, Aaron Gordon and Jamal Murray. He is expected to be a scoring option off the bench alongside the club’s existing core.'
    ],
    source: 'NBA.com',
    sourceUrl: 'https://www.nba.com/news/demar-derozan-denver-nuggets-2026-free-agency',
    publishedAt: '2026-08-21', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'nba-curry-extension-window-2026-08-29',
    sport: 'basketball', league: 'nba', category: 'contract', status: 'report',
    headline: 'Curry becomes eligible for a two-year, $136.7m Warriors extension',
    dek: 'The window opened on Saturday. As of Sunday nothing has been signed.',
    summary: 'The extension would run through the 2028-29 season and take Curry to his age-40 year. It has not been signed.',
    body: [
      'Saturday, 29 August was the first day Stephen Curry could sign a maximum contract extension with the Golden State Warriors. The deal available to him is two years and roughly $136.7 million, which would keep him under contract through the 2028-29 season and his age-40 year.',
      'Curry, 38, is entering his 18th season and the final year of a contract worth close to $63 million. The window is now open and no extension has been signed.',
      'The Warriors have made their position public. General manager Mike Dunleavy has said repeatedly over the past year that the club wants another deal done before the season begins, and that he is "pretty confident Steph will finish his career" in Golden State.',
      'Not everyone agrees on the timing. ESPN’s Brian Windhorst has argued Curry would be better served waiting rather than signing this summer.'
    ],
    source: 'HoopsHype',
    sourceUrl: 'https://www.hoopshype.com/story/sports/nba/2026/08/28/stephen-curry-becomes-eligible-for-max-warriors-extension-saturday/91504446007/',
    publishedAt: '2026-08-29', updatedAt: '2026-08-30',
    image: 'assets/curry.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'nba-thompson-heat-2026-08-21',
    sport: 'basketball', league: 'nba', category: 'signing', status: 'confirmed',
    headline: 'Klay Thompson joins the Heat after a Mavericks buyout',
    dek: 'Thompson asked out of Dallas to play for a contender and cleared waivers before signing in Miami.',
    summary: 'A two-year deal reported at about $11.5m, with the second season at Thompson’s option.',
    body: [
      'Klay Thompson has signed with the Miami Heat after agreeing a contract buyout with the Dallas Mavericks. ESPN reported the deal at about $11.5 million over two years, with the second season at Thompson’s option.',
      'The buyout was initiated by Thompson, who told the Mavericks he wanted to play for a contender. Dallas went 26-56 last season, and Thompson had been owed $17.5 million in the final year of his contract.',
      'The 36-year-old averaged 12.9 points across two seasons in Dallas while shooting 38.7% from three. He recently passed Damian Lillard to move fourth on the all-time list for made three-pointers, with 2,899.',
      'Miami had tracked Thompson through the offseason, seeing a floor-spacing wing as the right fit around Giannis Antetokounmpo and Bam Adebayo following the Antetokounmpo trade.',
      '"We have tremendous respect for Klay and all that he has accomplished throughout his career," Mavericks president Masai Ujiri said.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nba/story/_/id/49683637/mavs-buy-klay-thompson-deal-heat-move-deck-sources-say',
    publishedAt: '2026-08-21', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'nba-watson-cavaliers-2026-08-19',
    sport: 'basketball', league: 'nba', category: 'trade', status: 'confirmed',
    headline: 'Peyton Watson joins the Cavaliers in a five-team trade',
    dek: 'Denver could not match Cleveland’s offer for their restricted free agent, and the sign-and-trade pulled in four other clubs.',
    summary: 'Watson signs a four-year, $88m deal with a player option and a 7.5% trade kicker as part of a five-team transaction.',
    body: [
      'The Denver Nuggets have signed-and-traded restricted free agent wing Peyton Watson to the Cleveland Cavaliers. Watson signed a four-year, $88 million contract that includes a player option and a 7.5% trade kicker.',
      'The transaction was completed as a five-team deal involving the Nuggets, Cavaliers, Clippers, Wizards and Hornets. Max Strus moved from Cleveland to the Clippers as part of it.',
      'For Watson, Denver received Cleveland’s unprotected 2031 first-round pick and a Kings second-round pick that conveys in 2032.',
      'Cleveland also acquired Cam Whitmore from Washington, sending Tre Mann, a 2027 second-round pick and cash to the Wizards. Dennis Schroder’s earlier agreed move from Cleveland to Charlotte was folded into the same transaction, which is what took it to five teams.',
      'Cleveland has since released Whitmore.'
    ],
    source: 'NBA.com',
    sourceUrl: 'https://www.nba.com/news/peyton-watson-trade-cavaliers',
    publishedAt: '2026-08-19', updatedAt: '2026-08-28',
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'nba-leonard-investigation-2026-08-14',
    sport: 'basketball', league: 'nba', category: 'investigation', status: 'report',
    headline: 'Kawhi Leonard trade stays frozen as the Clippers cap inquiry widens',
    dek: 'A second, previously undisclosed endorsement arrangement has been alleged, and the Raptors will not complete the deal until the league finishes.',
    summary: 'The June 30 trade cannot be finalised until the NBA closes its investigation into whether the Clippers routed money to Leonard through Aspiration.',
    body: [
      'The trade that would send Kawhi Leonard from the LA Clippers to the Toronto Raptors, agreed on 30 June, cannot be completed until the NBA finishes its investigation into potential salary cap circumvention by the Clippers.',
      'The league is examining whether the Clippers routed money to Leonard through an endorsement deal with Aspiration, a green banking company that has since gone bankrupt. Clippers owner Steve Ballmer invested $60 million in Aspiration, which also held a $300 million, 23-year endorsement agreement with the team.',
      'The Clippers have said they "did not funnel money to Kawhi Leonard through Aspiration" and that they were "victims of a fraud". The Raptors have said they will wait for the league’s findings rather than take on the financial risk of completing the deal mid-investigation.',
      'Under the agreed terms Toronto would send Brandon Ingram, Gradey Dick, unprotected first-round picks in 2031 and 2033, a 2027 first-round pick swap and two second-round picks.',
      'The inquiry has since broadened. It now covers additional expenses the Clippers may have met on Leonard’s behalf, along with a second endorsement agreement that was never disclosed — reported as a multimillion-dollar arrangement with Daktronics.',
      'That widening is what has made the timing so difficult. A trade cannot sensibly be completed while the league is still deciding whether one of the two clubs involved broke the salary cap, because any penalty would land on a roster and a pick position that the trade itself would have already changed.',
      'Commissioner Adam Silver has said the investigation needs to be wrapped up before next season, and the NBA has said its outside counsel expects to finalise its work in the coming weeks. Until it does, one of the summer’s biggest agreed trades stays exactly where it has been since 30 June: agreed, and unexecuted.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nba/story/_/id/49317499/clippers-raptors-trade-involving-kawhi-leonard-hold-amid-probe',
    publishedAt: '2026-08-14', updatedAt: null,
    image: null, video: null,
    priority: 'high'
  },
  {
    id: 'nba-westbrook-retires-2026-08-12',
    sport: 'basketball', league: 'nba', category: 'league', status: 'confirmed',
    headline: 'Russell Westbrook retires as the NBA’s triple-double leader',
    dek: 'Eighteen seasons, 209 triple-doubles and the only full-season triple-double average since Oscar Robertson.',
    summary: 'Westbrook announced his retirement on social media, ending a career that reset the league’s triple-double record.',
    body: [
      'Russell Westbrook has announced his retirement after 18 NBA seasons, confirming the decision on social media.',
      'He leaves as the league’s all-time leader in triple-doubles with 209 — a record he did not so much break as relocate. Forty-two of them came in the 2016-17 season alone, more in one year than most players manage in a career.',
      'That season remains the centrepiece of everything. Westbrook was named Most Valuable Player after averaging 31.6 points, 10.7 rebounds and 10.4 assists, becoming the first player since Oscar Robertson in 1961-62 to average a triple-double across a full campaign. For a statistic that had sat untouched for 55 years, it was a direct answer to the question of whether it could be done again.',
      'The rest of the résumé is built on the same relentlessness. A nine-time All-Star, he finishes fifth on the all-time assists list with 10,351 and 14th in career scoring with 27,176 points — a combination of volume passing and volume scoring that very few guards in the league’s history have sustained together.',
      'He spent his first 11 seasons with the Oklahoma City Thunder, the franchise that drafted him and where the triple-double record was built. He played last season for the Sacramento Kings.',
      'The record may not stand long. Nikola Jokic has 198 career triple-doubles and needs 11 more to pass him, and Luka Doncic sits on 90, although his rate has slowed with injuries and with more of the ball-handling shared. Westbrook could plausibly lose the record inside a season — which says less about the number than about the era he helped create.'
    ],
    source: 'NBA.com',
    sourceUrl: 'https://www.nba.com/news/russell-westbrook-retires-nba-after-18-seasons',
    publishedAt: '2026-08-12', updatedAt: null,
    image: null, video: null,
    priority: 'high'
  },
  {
    id: 'nba-lakers-sale-2026-08-12',
    sport: 'basketball', league: 'nba', category: 'league', status: 'confirmed',
    headline: 'Lakers sold to Josh Kushner and Bob Iger for a record $12.5bn',
    dek: 'The largest price ever paid for a sports franchise, a year after Mark Walter took control of the club.',
    summary: 'A group led by Thrive Capital founder Josh Kushner and former Disney chief executive Bob Iger is buying the franchise.',
    body: [
      'The Los Angeles Lakers are being sold to a group led by Josh Kushner and Bob Iger for $12.5 billion — the highest price ever paid for a sports franchise.',
      'The seller is Mark Walter, who bought a controlling interest in the Lakers from the Buss family only last year at a valuation of roughly $10 billion. That deal was itself a record at the time, which makes the speed of the revaluation the striking part: the franchise has gained around $2.5 billion in headline value inside twelve months, without changing conference, arena or roster core.',
      'Kushner is the founder of the venture firm Thrive Capital, a co-founder of Oscar Health and already a minority owner inside the league at the Miami Heat. Iger was chief executive of the Walt Disney Company from 2005 to 2020, and returned to the role from 2022 to 2026.',
      'Neither man arrived at the Lakers by the obvious route. Both had been involved in the NBA’s Las Vegas expansion process — the orthodox way into the league for buyers at this level — before pivoting to bid for an existing franchise instead.',
      'For the Buss family, whose control of the club ran from 1979 until last year, the sale closes the second stage of an exit that began with the Walter deal.',
      'For the wider sports market it resets the ceiling. NFL owners approved the sale of the Seattle Seahawks — the largest transaction in that league’s history — at $9.612 billion. The Lakers have just gone for nearly $3 billion more.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nba/story/_/id/49590362/josh-kushner-bob-iger-buy-lakers-12b',
    publishedAt: '2026-08-12', updatedAt: null,
    image: null, video: null,
    priority: 'high'
  },
  {
    id: 'nba-garnett-jersey-2026-08-14',
    sport: 'basketball', league: 'nba', category: 'league', status: 'confirmed',
    headline: 'Timberwolves will retire Kevin Garnett’s No. 21 on 28 February',
    dek: 'More than a decade after he retired, and only once the owner he fell out with had sold the club.',
    summary: 'Garnett becomes only the second player in franchise history to have his number retired, at a Target Center ceremony after the Celtics game.',
    body: [
      'The Minnesota Timberwolves will retire Kevin Garnett’s No. 21 on 28 February 2027, following the club’s home game against the Boston Celtics. He will be only the second player in franchise history to have his number retired.',
      'The ceremony comes more than ten years after Garnett stopped playing. He had refused to take part in one because of a long-running dispute with former owner Glen Taylor, saying he "doesn’t do business with snakes".',
      'That obstacle disappeared when Taylor sold the Timberwolves to a group fronted by Marc Lore and Alex Rodriguez, after which Garnett returned to the organisation in an off-court role.',
      'The club will also hold five KG Theme Nights across the 2026-27 season, each with a commemorative figurine giveaway, alongside an exclusive shirt and limited-edition merchandise on the night of the retirement itself.'
    ],
    source: 'HoopsHype',
    sourceUrl: 'https://www.hoopshype.com/story/sports/nba/2026/08/14/timberwolves-to-retire-kevin-garnetts-no-21-jersey-on-february-28/91305638007/',
    publishedAt: '2026-08-14', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },

  {
    id: 'nba-harden-cavaliers-2026-08-20',
    sport: 'basketball', league: 'nba', category: 'contract', status: 'confirmed',
    headline: 'James Harden re-signs with the Cavaliers on a three-year, $97m deal',
    dek: 'Cleveland keep their starting guard after he turned down a $42.3m player option in June.',
    summary: 'The deal includes a player option for 2028-29 and a trade kicker.',
    body: [
      'James Harden has agreed a new three-year contract worth $97 million to remain with the Cleveland Cavaliers. The deal includes a player option for 2028-29 and a trade kicker.',
      'Harden declined his $42.3 million player option in June. Rather than move quickly at the opening of free agency, he and his agents worked through both two-year and three-year structures with the Cavaliers, and he allowed Cleveland to take as much time as it needed to build the rest of the roster before finalising his own terms.',
      'He turned 37 on 26 August. On signing he becomes only the second player in league history to commit to more than $90 million in guaranteed salary at 37 or older, after LeBron James.',
      'Cleveland now line up with Harden alongside Donovan Mitchell, Peyton Watson, Evan Mobley and Jarrett Allen.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nba/story/_/id/49671792/james-harden-agrees-3-year-97m-deal-remain-cavaliers',
    publishedAt: '2026-08-20', updatedAt: null,
    image: 'assets/harden-hero.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'nba-kuminga-timberwolves-2026-08-27',
    sport: 'basketball', league: 'nba', category: 'signing', status: 'confirmed',
    headline: 'Jonathan Kuminga signs with the Timberwolves',
    dek: 'Minnesota fill a power forward vacancy with the former Warriors wing after his split from Atlanta.',
    summary: 'A two-year deal with a player option, reported by ESPN at $12.4m and elsewhere at $13m.',
    body: [
      'Jonathan Kuminga has agreed a two-year contract with the Minnesota Timberwolves. ESPN reported the deal at $12.4 million, with other outlets putting it at $13 million; it includes a player option.',
      'The signing fills a power forward vacancy for Minnesota, and Kuminga is expected to start in 2026-27.',
      'It closes an unsettled eighteen months. Golden State traded Kuminga to the Atlanta Hawks in February alongside Buddy Hield, ending a Bay Area spell that never quite resolved itself, and he reached free agency this summer after splitting from the Hawks.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nba/story/_/id/49736014/jonathan-kuminga-reaches-2-year-deal-minnesota-timberwolves',
    publishedAt: '2026-08-27', updatedAt: null,
    image: 'assets/kumingyt.jpg', video: null,
    priority: 'low'
  },
  {
    id: 'nba-mathurin-pelicans-2026-08-26',
    sport: 'basketball', league: 'nba', category: 'signing', status: 'confirmed',
    headline: 'Bennedict Mathurin signs with the Pelicans on a two-year deal',
    dek: 'The 24-year-old chose flexibility over a longer commitment after the Clippers pulled his qualifying offer.',
    summary: 'Two years and $16m with a player option, putting him on the earliest path to unrestricted free agency.',
    body: [
      'Bennedict Mathurin has agreed a two-year, $16 million contract with the New Orleans Pelicans. The deal includes a player option.',
      'Mathurin had been a restricted free agent at the LA Clippers, who withdrew his $8.8 million qualifying offer after meeting his representatives. That put him on the open market, and reporting at the time said he prioritised flexibility and the earliest possible route to unrestricted free agency next summer over longer offers with more money and more team control.',
      'The sixth overall pick in 2022 averaged 17.6 points, 5.4 rebounds and 2.4 assists across 54 games last season, split between Indiana and the Clippers after a February trade ended three and a half years with the Pacers.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nba/story/_/id/49732472/sources-pelicans-reach-2-year-16m-deal-bennedict-mathurin',
    publishedAt: '2026-08-26', updatedAt: null,
    image: 'assets/peiltrade.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'nba-jordan-nbc-2026-08-26',
    sport: 'basketball', league: 'nba', category: 'league', status: 'report',
    headline: 'Michael Jordan not expected back on NBC’s NBA coverage',
    dek: 'His run as a special on-air contributor looks to have lasted a single season.',
    summary: 'NBC declined to comment. Jordan could still change his mind, but viewers are unlikely to see him this season.',
    body: [
      'Michael Jordan is not expected to return to NBC’s NBA coverage for the coming season, ending a run as a special on-air contributor after a single year.',
      'His contribution last season amounted to one sit-down interview with Mike Tirico, cut into segments that were spread across the schedule. The appearances were infrequent and largely avoided the league’s current affairs.',
      'No reason has been reported and NBC declined to comment. Jordan could still change his mind, but viewers are not expected to see or hear from him during the season ahead.'
    ],
    source: 'Front Office Sports',
    sourceUrl: 'https://frontofficesports.com/michael-jordan-not-expected-return-nba-nbc-coverage/',
    publishedAt: '2026-08-26', updatedAt: null,
    image: 'assets/mj.jpg', video: null,
    priority: 'low'
  },
  {
    id: 'nba-tacko-fall-76ers-2026-09-01',
    sport: 'basketball', league: 'nba', category: 'signing', status: 'confirmed',
    headline: 'Tacko Fall returns to the NBA on an Exhibit 10 deal with the 76ers',
    dek: 'The 7-foot-6 center is back after four years playing in China and New Zealand.',
    summary: 'Philadelphia sign Fall to a training-camp deal; an Exhibit 10 contract does not guarantee a roster spot.',
    body: [
      'The Philadelphia 76ers have signed 7-foot-6 center Tacko Fall to an Exhibit 10 contract, bringing him back to the NBA after four years away.',
      'Fall’s last NBA appearance came with the Cleveland Cavaliers in the 2021-22 season. Since then he has played in China and New Zealand, averaging 11.2 points, 7.2 rebounds and 2.1 blocks in 18.1 minutes per game overseas.',
      'An Exhibit 10 contract does not guarantee Fall a spot on Philadelphia’s final roster. It allows the Sixers to bring him to training camp in Camden, New Jersey, later this month and evaluate whether his form overseas translates back to the NBA. Fall drew renewed attention this year with a 20-point, 21-rebound, five-block showing at the 2026 NBA All-Star Celebrity Game.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nba/story/_/id/49795456/76ers-sign-7-foot-6-center-tacko-fall-others-camp-deal',
    publishedAt: '2026-09-01', updatedAt: null,
    image: 'assets/taco.jpg', video: null,
    priority: 'normal'
  },
  /* ---------------------------------------------------------------- WNBA */
  {
    id: 'wnba-bonner-dream-2026-08-27',
    sport: 'basketball', league: 'wnba', category: 'signing', status: 'confirmed',
    headline: 'Atlanta Dream sign DeWanna Bonner for the rest of the season',
    dek: 'The 17-year veteran joins a playoff-bound Atlanta side on a prorated maximum deal, days after a buyout with Phoenix freed her to chase one more title.',
    summary: 'The Dream added the two-time WNBA champion and six-time All-Star on a rest-of-season contract.',
    body: [
      'The Atlanta Dream have signed DeWanna Bonner for the remainder of the 2026 season and the playoffs. The deal is at the prorated maximum, roughly $116,000.',
      'Bonner arrives in her 17th WNBA season as a two-time champion and a six-time All-Star. She is the only three-time Sixth Player of the Year in league history and ranks third all-time in career points and fifth in career rebounds. At 39 she is the second-oldest player in the league.',
      'The move follows a buyout with the Phoenix Mercury, the franchise that drafted her in 2009 and where she spent most of her career. Phoenix were eliminated from playoff contention on 22 August after a 99-89 defeat to Atlanta, and agreed the buyout two days later.',
      '"Because of the relationship we have with DeWanna, we worked out a buyout agreement that gives her the opportunity to chase a title in what could be her final postseason," Mercury general manager Nick U’Ren said.',
      '"I’m grateful to the Mercury for giving me the opportunity to play in what could be one of my final postseason opportunities," Bonner said.',
      'She averaged 10.6 points, 6.1 rebounds, 1.5 assists and 1.2 steals for Phoenix this season, starting 26 of 37 games. The Las Vegas Aces and New York Liberty were also in the running.',
      'Atlanta have clinched a playoff berth and now add a two-time champion to a roster that includes Angel Reese but has been short on depth — the specific problem Bonner is being brought in to solve.',
      'The move also carries an ending. Bonner was drafted by Phoenix in 2009 and spent the bulk of her career there; leaving on a buyout, in the final weeks of a season her own club could no longer contest, is not the exit most 17-year careers get. Both she and the Mercury framed it as the point of the deal rather than a side effect.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/wnba/story/_/id/49735947/sources-dewanna-bonner-signing-dream-mercury-buyout',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null,
    priority: 'high'
  },
  {
    id: 'wnba-playoff-field-set-2026-08-28',
    sport: 'basketball', league: 'wnba', category: 'standings', status: 'confirmed',
    headline: 'All eight WNBA playoff places are now filled',
    dek: 'Dallas took the last berth, leaving only seeding to be settled before the regular season ends on 24 September.',
    summary: 'Minnesota, Las Vegas, Golden State, Indiana, Atlanta, New York, Washington and Dallas are all in. Seeding is still open.',
    body: [
      'Every place in the 2026 WNBA playoffs has now been claimed, with the Dallas Wings taking the final berth. The regular season runs to 24 September, and seeding has yet to be settled.',
      'Minnesota were first in, clinching on 9 August and sitting at 27-7. Las Vegas followed on 13 August at 24-11, and Golden State on 17 August at 25-9.',
      'Indiana clinched without playing, when Portland lost. Atlanta went through with a win over Phoenix, and New York qualified when Chicago lost.',
      'Washington sealed their place on Sunday with a victory over Portland. Dallas, at 23-16, completed the field on Tuesday.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/wnba/story/_/id/49640698/wnba-playoffs-2026-which-teams-clinched-postseason-berth',
    publishedAt: '2026-08-28', updatedAt: null,
    image: 'assets/wnba-playoffs-bracket.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'wnba-shirt-incident-2026-08-17',
    sport: 'basketball', league: 'wnba', category: 'league', status: 'confirmed',
    headline: 'WNBA says security was wrong to make fans cover their shirts',
    dek: 'The league corrected stewards at a Dream-Fever game in Atlanta who had asked supporters to cover political messaging.',
    summary: 'At least three fans were asked to cover shirts carrying messages about transgender athletes. The league said they should have been free to wear them.',
    body: [
      'The WNBA has said that security staff were wrong to ask fans to cover up their shirts during Sunday’s game in Atlanta between the Dream and the Indiana Fever.',
      'At least three supporters were asked to cover clothing carrying messages about transgender women competing in women’s sport. Two wore shirts arguing that women’s and girls’ sport should be restricted to those assigned female at birth; one wore a shirt in support of transgender people.',
      'In a statement on Monday the league said the fans should have been free to wear the shirts, and confirmed it had informed the security workers at the Atlanta game that they were wrong to ask for the messages to be covered.',
      'The Dream said the club was not involved in the security personnel’s actions.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/wnba/story/_/id/49643708/wnba-says-fans-free-wear-shirts-transgender-athlete-messaging',
    publishedAt: '2026-08-17', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },

  {
    id: 'wnba-clark-mitchell-record-2026-08-28',
    sport: 'basketball', league: 'wnba', category: 'results', status: 'confirmed',
    headline: 'Clark and Mitchell each score 34 as the Fever rout the Sun',
    dek: 'The fourth time this season the pair have both gone past 30 — a WNBA single-season record for a duo.',
    summary: 'Indiana won 111-91, with Clark adding 12 assists and Mitchell extending a 24-game run of 20-point scoring.',
    body: [
      'Caitlin Clark and Kelsey Mitchell each scored 34 points as the Indiana Fever beat the Connecticut Sun 111-91 on Friday, the pair combining for 68 of their side’s points.',
      'It was the fourth time this season both have scored 30 or more in the same game, extending their own WNBA single-season record for a duo. The previous mark was two, set by A’ja Wilson and Jackie Young.',
      'Clark added 12 assists, the fifth time this year she has posted a double-double with at least 30 points and 10 assists. Mitchell’s 34 extended her run to 24 consecutive games scoring 20 or more.',
      'The win sends Indiana into the FIBA World Cup break in form.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/wnba/story/_/id/49758105/clark-mitchell-combine-68-fever-blowout-win-sun',
    publishedAt: '2026-08-28', updatedAt: null,
    image: 'assets/calrk mitchell.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'wnba-smith-out-season-2026-08-27',
    sport: 'basketball', league: 'wnba', category: 'injury', status: 'confirmed',
    headline: 'NaLyssa Smith out for the season with a left leg injury',
    dek: 'A significant blow to the defending champions’ hopes of repeating.',
    summary: 'Smith was hurt in a non-contact incident against Toronto on 23 August. The Aces have not disclosed the injury.',
    body: [
      'Las Vegas Aces forward NaLyssa Smith will miss the remainder of the 2026 season with a left leg injury, the club announced.',
      'Smith was hurt in a non-contact incident at the 3:15 mark of the third quarter against the Toronto Tempo on 23 August. The Aces have not disclosed the specific injury or said whether she will need surgery.',
      'She had been one of the most efficient players in the league, averaging 11.8 points and 6.4 rebounds across 37 games while leading the WNBA in field goal percentage at 63.8%.',
      'Losing her for the postseason is a real problem for the defending champions as they try to repeat.'
    ],
    source: 'Las Vegas Aces (official)',
    sourceUrl: 'https://aces.wnba.com/news/nalyssa-smith-sidelined-for-remainder-of-season',
    publishedAt: '2026-08-27', updatedAt: null,
    image: 'assets/outof.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'wnba-fever-clinch-2026-08-21',
    sport: 'basketball', league: 'wnba', category: 'standings', status: 'confirmed',
    headline: 'Fever clinch a playoff spot for the third straight season',
    dek: 'Indiana went through without playing, when Portland lost to Toronto.',
    summary: 'The Fever were the fourth team into the 2026 postseason, at 24-13.',
    body: [
      'The Indiana Fever clinched a place in the 2026 WNBA playoffs without taking the floor, their berth confirmed when the Portland Fire lost 82-79 to the Toronto Tempo.',
      'It is the third consecutive season Indiana have qualified. At 24-13 they were the fourth team into the field, joining Minnesota, Golden State and Las Vegas.',
      'Caitlin Clark has averaged 21.7 points and 8.3 assists on the way there, shooting 44.4% from the floor and 35.4% from three.'
    ],
    source: 'Bleacher Report',
    sourceUrl: 'https://bleacherreport.com/articles/25469717-caitlin-clark-fever-clinch-2026-wnba-playoff-berth-updated-bracket-picture-and-standings',
    publishedAt: '2026-08-21', updatedAt: null,
    image: 'assets/clark-fever-hero.jpg', video: null,
    priority: 'low'
  },
  {
    id: 'wnba-reese-record-2026-08-30',
    sport: 'basketball', league: 'wnba', category: 'results', status: 'confirmed',
    headline: 'Angel Reese sets the WNBA record with her 29th double-double as the Dream beat the Lynx',
    dek: 'Reese passed Alyssa Thomas’s mark of 28, set in 2023, in Atlanta’s 89-81 win over Minnesota.',
    summary: 'Reese posted 15 points and 11 rebounds for her record 29th double-double of the season.',
    body: [
      'Angel Reese set a new WNBA record for double-doubles in a single season, posting her 29th of the year as the Atlanta Dream beat the Minnesota Lynx 89-81.',
      'Reese finished the game with 15 points and 11 rebounds, passing the previous record of 28 double-doubles set by Alyssa Thomas in 2023. She had tied the mark days earlier against the Portland Fire.',
      'It is the latest record of the season for Reese, who has also set marks for rebounds in a single game and in a season.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/wnba/story/_/id/49776582/angel-reese-breaks-wnba-record-29th-double-double',
    publishedAt: '2026-08-30', updatedAt: null,
    image: 'assets/reese record.jpg', video: null,
    priority: 'high'
  },
  /* ----------------------------------------------------------------- NFL */
  {
    id: 'nfl-seahawks-sale-2026-08-26',
    sport: 'americanfootball', league: 'nfl', category: 'league', status: 'confirmed',
    headline: 'NFL owners unanimously approve record $9.612bn Seahawks sale to the Khosla family',
    dek: 'The first ownership change in Seattle in nearly 30 years, and the largest transaction in league history.',
    summary: 'Commissioner Roger Goodell announced the unanimous vote transferring the franchise from the Paul G. Allen estate to a group led by Vinod and Neeru Khosla.',
    body: [
      'NFL owners voted unanimously on Wednesday to approve the sale of the Seattle Seahawks to the Khosla family, commissioner Roger Goodell announced after a special one-day league meeting in Atlanta. At $9.612 billion it is the largest ownership transaction in league history.',
      'The Khosla family entered into a formal sale agreement with the Paul G. Allen estate on 11 July. The estate had announced in February that it was beginning the process of selling the team, in accordance with the wishes of Allen, the Microsoft co-founder who died in 2018 and whose sister Jody had overseen the franchise since.',
      'The buying group is led by Vinod Khosla, co-founder of Sun Microsystems and founder of the venture firm Khosla Ventures, alongside his wife Neeru — named by the league as the franchise’s principal owner — and their son Neal. The family must relinquish the 3.1% stake in the San Francisco 49ers that Vinod Khosla bought in 2025.',
      '"They will be tremendous caretakers of the Seattle Seahawks, the organization and the great partnership they have," Goodell said.',
      'The transaction closes nearly three decades of Allen family stewardship. Allen bought the Seahawks in 1997, at a point when the franchise’s long-term future in Seattle was genuinely uncertain, and the club has not changed hands since.',
      'Seattle are the reigning champions, having beaten the New England Patriots 29-13 in February for the second Super Bowl title in franchise history — which makes this an unusually clean handover. The incoming owners inherit a roster that has just won, a head coach in place, and no immediate mandate to change anything.',
      '"How often do you get to buy a franchise that just won the Super Bowl? We are incredibly lucky and humbled by this gift," Vinod Khosla said. Asked about the task ahead, he was brief: "Keep the winning streak alive. Get another Super Bowl."'
    ],
    source: 'NFL.com',
    sourceUrl: 'https://www.nfl.com/news/nfl-owners-approve-sale-seattle-seahawks-khosla-family',
    publishedAt: '2026-08-26', updatedAt: null,
    image: null, video: null,
    priority: 'high'
  },
  {
    id: 'nfl-williams-extension-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'contract', status: 'confirmed',
    headline: 'Seahawks give Leonard Williams a three-year, $90m extension',
    dek: 'The defensive tackle was a second-team All-Pro in Seattle’s championship season.',
    summary: '$56m guaranteed, placing Williams in the top five by annual average among interior defensive linemen.',
    body: [
      'The Seattle Seahawks and defensive lineman Leonard Williams have agreed a three-year extension worth $90 million, including $56 million guaranteed.',
      'Williams, 32, has spent two and a half seasons in Seattle. Last year he was named a second-team Associated Press All-Pro and earned his first Pro Bowl selection since 2016 as the Seahawks won the second Super Bowl in franchise history.',
      'The contract places him inside the top five by average annual value among all interior defensive linemen.',
      'He is the latest Seattle player to be paid this offseason, following new deals for Jaxon Smith-Njigba, Rashid Shaheed, Josh Jobe and Devon Witherspoon.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nfl/story/_/id/49742399/sources-seahawks-leonard-williams-lands-3-year-90m-extension',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'nfl-jacobs-charges-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'legal', status: 'confirmed',
    headline: 'Packers running back Josh Jacobs charged with two misdemeanours',
    dek: 'The Brown County District Attorney filed the charges three months after a May arrest.',
    summary: 'Misdemeanour battery and criminal damage to property. The charges do not include domestic violence.',
    body: [
      'Green Bay Packers running back Josh Jacobs was formally charged in Brown County on Thursday with two misdemeanours: battery and criminal damage to property.',
      'The charges follow a domestic dispute at his Village of Hobart home on 23 May. Jacobs was arrested at the time on suspicion of domestic abuse, but the Brown County District Attorney withheld a charging decision pending further investigation.',
      'Having reviewed the evidence, the District Attorney elected to file misdemeanour charges that do not include domestic violence.',
      'Each count carries a maximum penalty of nine months in jail or a $10,000 fine. Court records show Jacobs is due to make his initial appearance on 11 November.'
    ],
    source: 'NBC News',
    sourceUrl: 'https://www.nbcnews.com/sports/nfl/packers-josh-jacobs-charges-battery-criminal-damage-rcna594805',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'nfl-watson-starter-2026-08-24',
    sport: 'americanfootball', league: 'nfl', category: 'roster', status: 'confirmed',
    headline: 'Browns name Deshaun Watson their starting quarterback',
    dek: 'New head coach Todd Monken settled the competition ahead of the season opener.',
    summary: 'Watson beat out Shedeur Sanders and will start when Cleveland open at Jacksonville on 13 September.',
    body: [
      'The Cleveland Browns have named Deshaun Watson their starting quarterback for the 2026 season. The decision was made by new head coach Todd Monken.',
      'Watson beat out Shedeur Sanders for the job.',
      'He will be under centre when the Browns open the regular season on the road against the Jacksonville Jaguars on 13 September.'
    ],
    source: 'Cleveland Browns (official)',
    sourceUrl: 'https://www.clevelandbrowns.com/news/deshaun-watson-named-browns-starting-quarterback',
    publishedAt: '2026-08-24', updatedAt: null,
    image: null, video: null,
    priority: 'low'
  },
  {
    id: 'nfl-cutdown-deadline-2026-08-28',
    sport: 'americanfootball', league: 'nfl', category: 'roster', status: 'scheduled',
    headline: 'All 32 teams must reach 53 players by Sunday',
    dek: 'The deadline has moved forward this year, from the traditional Tuesday to the Sunday after the final preseason weekend.',
    summary: 'Rosters drop from 90 to 53 at 6pm ET on 30 August, with waiver claims due the following afternoon.',
    body: [
      'Every NFL club must cut its roster from 90 players to 53 by 6pm ET on Sunday 30 August.',
      'The date has moved this year. The reduction has traditionally fallen on the Tuesday after the final preseason weekend; it now lands on the Sunday, compressing the turnaround for clubs and for players looking for a new team.',
      'Waiver claims on released players are due at 1pm ET on Monday 31 August. Practice squads must be reported to the league 24 hours after the initial roster is finalised, at 6pm ET the same day.'
    ],
    source: 'NFL.com',
    sourceUrl: 'https://www.nfl.com/news/2026-nfl-53-man-roster-deadline-cut-candidates-trade-targets',
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null,
    priority: 'low'
  },

  {
    id: 'nfl-pro-bowl-eliminated-2026-08-26',
    sport: 'americanfootball', league: 'nfl', category: 'league', status: 'confirmed',
    headline: 'NFL eliminates the Pro Bowl game after 75 years',
    dek: 'The all-star exhibition is gone entirely. The selection survives as an individual honour.',
    summary: 'League executives presented the change to owners on Wednesday. Eighty-eight players will still be voted in, with no alternates.',
    body: [
      'The NFL is doing away with the Pro Bowl game. League executives presented the plan to team owners on Wednesday, ending an all-star exhibition that has been played in one form or another for 75 years.',
      'What disappears is the game itself, in every version it has taken — the full-contact match, the flag football format, the skills competition. What survives is the selection.',
      'Eighty-eight players will still be voted into an official Pro Bowl class covering offence, defence and special teams across both conferences, chosen as now by fans, players and coaches. The significant change is that there will be no alternates: the honour is fixed to the players originally selected rather than passed down as others withdraw.',
      'The selections will be announced in December, and the league will stage an event celebrating the class in Los Angeles in February 2027. Beginning with the 2026 season, players voted in will wear a recognition badge on their team uniform.',
      'The exhibition had become difficult to defend. Ratings had fallen steadily, participation was uneven, and the game itself was routinely played at an intensity that satisfied nobody. Converting the Pro Bowl into a pure award — a line on a résumé and a patch on a jersey — removes the part of it that had stopped working while keeping the part players actually care about.'
    ],
    source: 'Yahoo Sports',
    sourceUrl: 'https://sports.yahoo.com/nfl/breaking-news/article/nfl-eliminating-pro-bowl-event-prioritizing-individual-performance-award-without-alternates-210503896.html',
    publishedAt: '2026-08-26', updatedAt: null,
    image: 'assets/1nfl.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'nfl-pearce-suspension-2026-09-01',
    sport: 'americanfootball', league: 'nfl', category: 'league', status: 'confirmed',
    headline: 'Falcons edge rusher James Pearce Jr. suspended eight games',
    dek: 'The ruling, for a violation of the personal conduct policy, lands a week before Atlanta’s opener.',
    summary: 'Pearce joins fellow second-year pass rusher Jalon Walker, already out with a torn ACL, on the sideline.',
    body: [
      'The NFL has suspended Atlanta Falcons edge rusher James Pearce Jr. for the first eight games of the season, ruling that he violated the league’s personal conduct policy.',
      'The suspension lands a week before Atlanta’s season opener and deepens a pass-rush problem for the Falcons, who led the NFC in sacks a year ago. Fellow second-year pass rusher Jalon Walker is already out for an extended period with a torn ACL.',
      'Pearce is eligible to return once Atlanta’s Week 8 game has been played.'
    ],
    source: 'Sports Illustrated',
    sourceUrl: 'https://sports.yahoo.com/articles/ranking-5-biggest-nfl-storylines-130027020.html',
    publishedAt: '2026-09-01', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'nfl-beckham-giants-roster-2026-08-30',
    sport: 'americanfootball', league: 'nfl', category: 'roster', status: 'confirmed',
    headline: 'Odell Beckham Jr. makes the Giants’ 53-man roster, completing his return',
    dek: 'Seven years after he left, and after stops with four other teams and a Super Bowl with the Rams, Beckham earned the spot back in camp.',
    summary: 'The 33-year-old, who missed all of 2025, caught 7 of 13 targets for 76 yards across three preseason games to make the cut.',
    body: [
      'Odell Beckham Jr. has made the New York Giants’ 53-man roster, completing a return to the team seven years after he left. Beckham, 33, missed the entire 2025 season and had spent the years since his Giants departure with four other franchises, winning a Super Bowl along the way with the Los Angeles Rams.',
      'He earned the spot in training camp, catching 7 of 13 targets for 76 yards without a touchdown across three preseason games. The Giants have announced Beckham will wear No. 13 again, the number he wore in his original run with the team.',
      'The move reunites Beckham with head coach John Harbaugh, who took over the Giants this year after leaving Baltimore; the two worked together during Beckham’s stint with the Ravens in 2023. Beckham joins Malik Nabers, rookie Malachi Fields, Darnell Mooney and Darius Slayton in New York’s receiver room heading into a Week 1 matchup with the Cowboys.'
    ],
    source: 'NFL.com',
    sourceUrl: 'https://www.nfl.com/news/odell-beckham-jr--giants-53-man-roster-new-york-comeback',
    publishedAt: '2026-08-30', updatedAt: null,
    image: 'assets/Odell Beckham Jr. schafft den Giants-Kader.png', video: null,
    priority: 'high'
  },
  /* -------------------------------------------------------- PREMIER LEAGUE */
  {
    id: 'epl-delap-forest-2026-08-27',
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Nottingham Forest sign Liam Delap from Chelsea',
    dek: 'Oliver Glasner had identified the striker as Forest’s first-choice attacking target, and gets him after a single season at Stamford Bridge.',
    summary: 'An initial £45m plus £5m in add-ons takes Delap to the City Ground, a year after Chelsea paid £30m for him.',
    body: [
      'Nottingham Forest have confirmed the signing of Liam Delap from Chelsea. The deal is structured as an initial £45 million plus £5 million in add-ons.',
      'Forest manager Oliver Glasner had identified the 23-year-old as the club’s first-choice attacking target.',
      'It ends a single season at Stamford Bridge. Chelsea signed Delap from Ipswich Town last summer for £30 million, but he scored one Premier League goal in 28 appearances, adding a goal in the Champions League.',
      'The move follows a far more productive year at Ipswich, where he finished as the club’s top scorer with 12 goals in 2024-25.',
      '"I really can’t wait to get started, this is a massive club with a big history," Delap said.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/soccer/story/_/id/49740097/nottingham-forest-confirm-transfer-liam-delap-chelsea',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'epl-palace-city-2026-08-28',
    sport: 'football', league: 'epl', category: 'match', status: 'confirmed',
    headline: 'Cherki and Haaland tear Crystal Palace apart as City win 4-1',
    dek: 'A quickfire second-half double from Rayan Cherki broke the game open at Selhurst Park.',
    summary: 'Haaland scored twice either side of two Cherki goals. Palace’s only reply came from an own goal.',
    body: [
      'Manchester City made it two wins from two with a 4-1 victory at Crystal Palace, Rayan Cherki scoring twice in five second-half minutes to break the game open.',
      'Erling Haaland headed City in front on 17 minutes and the visitors took a narrow lead into the interval. The second half was one-sided: Cherki scored on 54 and again on 59, and Haaland added a fourth on 84.',
      'Palace’s only goal arrived in the 56th minute, an own goal. Their best moment in open play came when a Pino free-kick struck the woodwork.',
      'The match statistics tell the story. City had 72% of the ball to Palace’s 28%, and nine shots on goal to one.',
      'City move to six points from two games. Palace remain without a win, extending a nine-game Premier League winless run under new manager Pierre Sage.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/soccer/match/_/gameId/401879294/manchester-city-crystal-palace',
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'epl-riad-acl-2026-08-28',
    sport: 'football', league: 'epl', category: 'injury', status: 'confirmed',
    headline: 'Crystal Palace confirm Chadi Riad has ruptured his ACL again',
    dek: 'A second cruciate rupture for the defender, who was stretchered off on the opening weekend.',
    summary: 'Scans confirmed the injury. Riad could miss the entire season.',
    body: [
      'Crystal Palace have confirmed that Chadi Riad has ruptured his anterior cruciate ligament and faces a long spell out.',
      'The defender was injured in Palace’s season opener against Everton, going off on a stretcher in the 72nd minute. Scans have since confirmed the rupture.',
      'It is the second ACL rupture of Riad’s career, and he is potentially facing the loss of the entire season. He was absent from the Palace squad for Friday’s home game against Manchester City.'
    ],
    source: 'RotoWire',
    sourceUrl: 'https://www.rotowire.com/soccer/headlines/chadi-riad-injury-return-timeline-remains-unclear-528848',
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null,
    priority: 'low'
  },
  {
    id: 'epl-martinez-chelsea-2026-08-28',
    sport: 'football', league: 'epl', category: 'transfer', status: 'report',
    headline: 'Chelsea agree £7.5m deal for Emiliano Martinez',
    dek: 'Sky Sports reports terms agreed with Aston Villa. Neither club has announced the move.',
    summary: 'A two-year contract with the option of a further year is expected for the World Cup-winning goalkeeper.',
    body: [
      'Chelsea have agreed a £7.5 million deal with Aston Villa for goalkeeper Emiliano Martinez, according to Sky Sports. Neither club has announced the transfer.',
      'The 33-year-old Argentina international is expected to sign a two-year contract with an option for a further year, having completed medical tests. The deal was agreed on Thursday.',
      'Chelsea moved late for Martinez after first-choice goalkeeper Robert Sanchez was criticised for an error in Monday’s win at Fulham.',
      'Martinez had been looking for a new club since Villa signed Zion Suzuki from Parma for close to £30 million, a move that made the World Cup winner second choice at Villa Park.'
    ],
    source: 'Sky Sports',
    sourceUrl: 'https://www.skysports.com/football/news/11677/13577794/emiliano-martinez-transfer-news-chelsea-agree-lb7-5m-deal-to-sign-aston-villas-world-cup-winning-goalkeeper',
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'epl-marmoush-spurs-2026-08-27',
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Tottenham take Omar Marmoush on loan with an obligation to buy',
    dek: 'A season-long loan from Manchester City that carries a mandatory £60m purchase.',
    summary: 'The Egypt forward joins for 2026-27 and will wear the number 22 shirt.',
    body: [
      'Tottenham Hotspur have signed Omar Marmoush from Manchester City on a season-long loan for the 2026-27 campaign. The deal includes a mandatory £60 million option to buy.',
      'The 27-year-old will wear the number 22 shirt at Tottenham. He remains under contract at Manchester City until June 2029.',
      'Marmoush joined City from Eintracht Frankfurt in January 2025 for a reported €70 million but never became a regular under Pep Guardiola, who left the club at the end of last season.',
      'Tottenham have been among the most active buyers in Europe this window, spending more than $400 million. Manchester City have raised roughly the same amount in sales.'
    ],
    source: 'Al Jazeera',
    sourceUrl: 'https://www.aljazeera.com/sports/2026/8/27/tottenham-sign-man-citys-egypt-forward-omar-marmoush-on-season-long-loan',
    publishedAt: '2026-08-27', updatedAt: null,
    image: 'assets/mamush.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'epl-window-deadline-2026-08-28',
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Premier League window closes with City’s record £458m spend and Antony to Man United',
    dek: 'The summer window that opened 15 June shut at 22:00 GMT on Tuesday, with deals still landing in the final minutes.',
    summary: 'Manchester City set a Premier League single-window spending record; Manchester United complete an £81.3m deal for Antony.',
    body: [
      'The Premier League summer transfer window closed at 22:00 GMT on Tuesday 1 September, ending a run that opened on 15 June.',
      'Manchester City’s deadline-day business — capped by the £125m signing of Enzo Fernández — took their spending in the window to £458 million, a Premier League record for a single window, surpassing Liverpool’s £415m last summer. City also signed Iliman Ndiaye from Everton and sent Jack Grealish back to Everton on loan.',
      'Manchester United completed the signing of Ajax winger Antony for a fee of around £81.3 million. Elsewhere on deadline day, Malick Fofana joined Sunderland, Folarin Balogun moved to Everton, and Liverpool brought in Brazil midfielder Arthur on loan from Juventus.',
      'Anything not filed by the deadline now waits until the window reopens in January.'
    ],
    source: 'Sky Sports',
    sourceUrl: 'https://www.skysports.com/football/news/11719/13579708/transfer-deadline-day-deals-summer-2026-confirmed-moves-across-premier-league-championship-efl-europe-and-more',
    publishedAt: '2026-08-28', updatedAt: '2026-09-01',
    image: null, video: null,
    priority: 'normal'
  },

  {
    id: 'epl-barcola-liverpool-2026-08-29',
    sport: 'football', league: 'epl', category: 'transfer', status: 'report',
    headline: 'Liverpool agree terms with PSG for Bradley Barcola',
    dek: 'A guaranteed €116m rising to €140m, reported by David Ornstein. The deal is not yet completed.',
    summary: 'Barcola has two years left in Paris and does not want to extend. Liverpool are pushing before Tuesday’s deadline.',
    body: [
      'Liverpool have reached an agreement in principle with Paris Saint-Germain for Bradley Barcola, according to David Ornstein. The clubs have agreed a guaranteed €116 million (£100 million), rising by a further €24 million (£20 million) in add-ons for a potential total of €140 million.',
      'The deal is not done. Negotiations are ongoing and nothing has been completed or announced by either club.',
      'Barcola has become Liverpool’s priority target as they look to strengthen the attack before the English window closes at 11pm on Tuesday 1 September. The 23-year-old France international has two years left on his PSG contract and does not want to extend with the Champions League holders.',
      'The move has knock-on effects at Anfield: with Barcola arriving and Victor Munoz already signed from Osasuna this summer, Cody Gakpo’s position in the squad has come under question late in the window.'
    ],
    source: 'FootballTransfers',
    sourceUrl: 'https://www.footballtransfers.com/en/transfer-news/uk-premier-league/2026/08/bradley-barcola-liverpool-agree-to-sign-psg-star-for-eur140m',
    publishedAt: '2026-08-29', updatedAt: null,
    image: 'assets/barcola.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'epl-enzo-city-2026-08-29',
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Enzo Fernández completes Manchester City move in £125m British-record deal',
    dek: 'The transfer went through in the closing minutes of the window, matching what Liverpool paid for Alexander Isak a year ago.',
    summary: 'City sign the Chelsea midfielder for a joint-British-record £125m on a five-year deal, done in the final minutes of deadline day.',
    body: [
      'Manchester City have completed the signing of Enzo Fernández from Chelsea for a fee of £125 million, equalling the British transfer record, with the Argentina international signing a five-year deal.',
      'The move went through in the closing minutes of the summer window, which shut at 22:00 GMT on Tuesday 1 September. The £125m fee matches what Liverpool paid Newcastle for Alexander Isak on deadline day a year earlier.',
      'The signing takes City’s spending in a single transfer window to a Premier League record £458 million, surpassing Liverpool’s £415m outlay from last summer.',
      'Fernández previously joined Chelsea from Benfica in 2023 for a then-British-record £107m, making him the first player to be the subject of two transfers worth more than £100m.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/soccer/story/_/id/49794375/man-city-agree-record-equalling-125m-deal-chelsea-enzo-fernandez-sources',
    publishedAt: '2026-08-29', updatedAt: '2026-09-01',
    image: 'assets/enzo fernadez transfer.jpg', video: null,
    priority: 'high'
  },
  {
    id: 'epl-gakpo-city-talks-2026-08-29',
    sport: 'football', league: 'epl', category: 'transfer', status: 'report',
    headline: 'Manchester City open talks with Liverpool for Cody Gakpo',
    dek: 'An opening bid has been made and Liverpool are weighing it up this late in the window.',
    summary: 'Sky Sports reports formal talks, with personal terms also under discussion. Tottenham have also been interested.',
    body: [
      'Manchester City have opened formal talks with Liverpool over a move for Cody Gakpo, with an opening bid already submitted for the 27-year-old.',
      'Sky Sports reports that Gakpo has decided he wants the move to the Etihad, and that discussions over personal terms are under way. Liverpool are considering their position given how late in the window the approach has come — they had not wanted to sell.',
      'The timing is what makes it live. Liverpool are close to signing Bradley Barcola from PSG and added Victor Munoz from Osasuna earlier in the summer, which changes the shape of the forward line and the case for keeping Gakpo.',
      'Tottenham had also been interested in the Netherlands international, but the move is described as advancing in City’s direction.'
    ],
    source: 'Sky Sports',
    sourceUrl: 'https://www.skysports.com/transfer/news/12691/13578859/cody-gakpo-transfer-news-manchester-city-open-talks-to-sign-liverpool-forward',
    publishedAt: '2026-08-29', updatedAt: null,
    image: 'assets/gakpo.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'epl-jesus-arsenal-2026-08-27',
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Gabriel Jesus is not training with the Arsenal first team',
    dek: 'Mikel Arteta confirmed the striker has been pulled from first-team sessions and is expected to leave.',
    summary: '"It’s something to do with the numbers that we have in the squad," Arteta said. Napoli, Everton and Ipswich are interested.',
    body: [
      'Gabriel Jesus has been training away from the Arsenal first team and is expected to leave the club, Mikel Arteta confirmed.',
      'Asked about the striker’s absence from sessions, Arteta said it was "something to do with the numbers that we have in the squad" — a surplus of attacking options rather than a fitness problem.',
      'Arsenal are understood to be pushing for a resolution before the deadline rather than let Jesus run down the final year of his contract and leave for nothing next summer. Napoli, Everton and Ipswich have all shown interest in the 28-year-old Brazilian.',
      'The complication is that Jesus would rather stay at the Emirates than take a move elsewhere, and his wages are reported to be a sticking point for the clubs interested.'
    ],
    source: 'Daily Cannon',
    sourceUrl: 'https://dailycannon.com/2026/08/jesus-napoli-arsenal-training-alone/',
    publishedAt: '2026-08-27', updatedAt: null,
    image: 'assets/jesus.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'epl-bruno-hattrick-ipswich-2026-08-30',
    sport: 'football', league: 'epl', category: 'match', status: 'confirmed',
    headline: 'Bruno Fernandes hat-trick fires Manchester United past Ipswich 5-2',
    dek: 'His first Premier League hat-trick in five years turned a first-half deficit into a rout at Old Trafford.',
    summary: 'Fernandes scored three and set up a fourth as United came from behind to beat newly-promoted Ipswich.',
    body: [
      'Bruno Fernandes scored his first Premier League hat-trick in five years as Manchester United came from behind to beat Ipswich Town 5-2 at Old Trafford.',
      'Ipswich led through Leif Davis in the 29th minute before Fernandes equalised in the 40th. An own goal from Jacob Greaves put United ahead in the 56th, and Fernandes added a penalty five minutes later before completing his hat-trick from close range.',
      'Bryan Mbeumo added a fifth after a Fernandes assist, with Chuba Akpom’s stoppage-time goal a consolation for Ipswich.'
    ],
    source: 'Sky Sports',
    sourceUrl: 'https://www.skysports.com/football/news/11661/13571902/man-utd-5-2-ipswich-bruno-fernandes-scores-hat-trick-to-help-united-come-from-behind-to-win-at-old-trafford',
    publishedAt: '2026-08-30', updatedAt: null,
    image: 'assets/brunorec.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'epl-mudryk-tottenham-loan-2026-09-02',
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Mykhailo Mudryk joins Tottenham on loan from Chelsea',
    dek: 'The winger returns to competitive football after a doping ban, with a reported £75m non-mandatory buy option.',
    summary: 'Mudryk has not played a competitive match since November 2024. Spurs boss Roberto De Zerbi worked with him at Shakhtar Donetsk.',
    body: [
      'Mykhailo Mudryk has joined Tottenham Hotspur on loan from Chelsea for the 2026-27 season.',
      'The Ukraine winger has not featured in an official match since November 2024, after testing positive for a banned substance. His doping ban was lifted earlier this summer and he rejoined Chelsea training almost immediately.',
      'The loan reportedly includes a non-mandatory option for Tottenham to sign Mudryk permanently for around £75 million. Spurs manager Roberto De Zerbi worked with the winger at Shakhtar Donetsk in 2021-22, a relationship understood to have been central to the move.'
    ],
    source: 'FootballTransfers',
    sourceUrl: 'https://www.footballtransfers.com/en/transfer-news/uk-premier-league/2026/09/chelsea-transfer-news-mykhailo-mudryk-tottenham-hotspur-loan-deal-agreed-fabrizio-romano',
    publishedAt: '2026-09-02', updatedAt: null,
    image: 'assets/mudryk.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'epl-woltemade-juventus-loan-2026-09-01',
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Newcastle send Nick Woltemade to Juventus on a season-long loan',
    dek: 'The striker, a club-record £69m signing from Stuttgart last summer, wants more regular football.',
    summary: 'Juventus pay Newcastle a £3.5m loan fee, with no option or obligation to make the move permanent.',
    body: [
      'Newcastle United have sent striker Nick Woltemade to Juventus on a season-long loan, in a deal completed on deadline day.',
      'Juventus will pay Newcastle £3.5 million for the loan, which carries no option or obligation to make the move permanent, plus up to €500,000 in performance-related bonuses over the 2026-27 campaign.',
      'Woltemade joined Newcastle from VfB Stuttgart for a club-record £69 million last summer and made 53 appearances, scoring 11 goals and adding six assists. He is looking for more regular playing time as he tries to impress new Germany head coach Jürgen Klopp.'
    ],
    source: 'Yahoo Sports',
    sourceUrl: 'https://sports.yahoo.com/articles/nick-woltemade-agrees-join-juventus-122100317.html',
    publishedAt: '2026-09-01', updatedAt: null,
    image: 'assets/woltemade.jpg', video: null,
    priority: 'low'
  },
  /* --------------------------------------------------------------- LA LIGA */
  {
    id: 'laliga-madrid-sociedad-2026-08-26',
    sport: 'football', league: 'laliga', category: 'match', status: 'confirmed',
    headline: 'Mbappé hat-trick marks Mourinho’s Bernabéu return as Real Madrid win 4-1',
    dek: 'Thirteen years after his first spell ended, Mourinho was back in the home dugout — and Real Madrid pulled clear after the break.',
    summary: 'Kylian Mbappé scored three times and Vinícius Júnior added a fourth, after Luka Sučić had levelled before half-time.',
    body: [
      'José Mourinho marked his return to the Santiago Bernabéu dugout with a 4-1 win over Real Sociedad, Kylian Mbappé scoring a hat-trick in a rescheduled Matchday 1 fixture. It was Mourinho’s first competitive home match in charge of Real Madrid since his first spell ended 13 years ago. He was appointed on a three-year deal in June and took over in July.',
      'There was a party mood before kick-off. Mourinho’s name drew loud cheers when it was announced, and full-back Marc Cucurella walked out with a guard of honour to show off the World Cup trophy won by Spain over the summer. He was joined by Mikel Oyarzabal, who also played his part in that success and who came close to opening the scoring for Sociedad before Thibaut Courtois blocked with his leg.',
      'Mbappé opened the scoring on 40 minutes, but Luka Sučić levelled four minutes later and the sides went in at 1-1. Madrid were a different proposition after the break: Mbappé restored the lead on the hour after working a one-two with Jude Bellingham, following a move down the left involving Cucurella and Federico Valverde.',
      'Bellingham claimed a second assist eight minutes later, winning back possession after his own shot was blocked to leave Vinícius Júnior with a tap-in. Mbappé completed the hat-trick on 80 minutes, chipping in after a through ball from Vinícius — a symmetrical treble, one goal every 20 minutes. Brahim Díaz had a fifth ruled out by VAR in stoppage time.',
      'It was a second straight LaLiga win for Mourinho. The fixture had been moved from the opening weekend because of international tournament scheduling.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/soccer/report/_/gameId/401882919',
    publishedAt: '2026-08-26', updatedAt: null,
    image: null, video: null,
    priority: 'high'
  },
  {
    id: 'laliga-barca-athletic-2026-08-27',
    sport: 'football', league: 'laliga', category: 'match', status: 'confirmed',
    headline: 'Barcelona 2-0 Athletic Club as Rodri makes his debut',
    dek: 'Hansi Flick called the midfielder the "perfect" signing after an introduction from the bench.',
    summary: 'Raphinha and Fermín López scored at Spotify Camp Nou, with Rodri making his competitive return to Spanish football.',
    body: [
      'Barcelona beat Athletic Club 2-0 at Spotify Camp Nou, with Rodri making his debut for the Spanish champions.',
      'Raphinha opened the scoring in the 37th minute, collecting a precise through ball from Pedri, rounding Unai Simón and finishing for his third goal of the campaign. Fermín López settled it in the 82nd.',
      'Rodri came on as a second-half substitute. A €60 million arrival from Manchester City this summer, he had missed Barcelona’s 5-0 win over Elche.',
      'Hansi Flick described him afterwards as the "perfect" signing, and has identified him as a future partner for Pedri in Barcelona’s double pivot.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/soccer/story/_/id/49746982/rodri-barcelona-debut-hansi-flick-athletic-club-anthony-gordon',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },

  {
    id: 'laliga-alvarez-squad-2026-08-29',
    sport: 'football', league: 'laliga', category: 'transfer', status: 'confirmed',
    headline: 'Julián Álvarez left out of the Atlético squad again',
    dek: 'Simeone confirmed the striker will not travel to Sevilla, a second omission in a fortnight.',
    summary: 'Álvarez asked to be sold in the offseason. Atlético have blocked every offer and set him a deadline to decide.',
    body: [
      'Diego Simeone confirmed on Friday that Julián Álvarez will not be involved when Atlético Madrid travel to face Sevilla, saying the club had already made its position on the striker clear.',
      'It is the second omission in a fortnight. Álvarez was also left out of the squad for Atlético’s La Liga opener against Málaga.',
      'The standoff dates to the offseason, when Álvarez told the club he wanted to be transferred. Atlético said they did not intend to negotiate a release and have blocked every approach since, including a reported $114 million bid from Barcelona.',
      'The club have now given him a deadline of Sunday to decide whether to open up to a move to Arsenal or commit to staying. With the Spanish window closing on 1 September, the two omissions read less like squad rotation than leverage.'
    ],
    source: 'Sky Sports',
    sourceUrl: 'https://www.skysports.com/football/video/19540/13578168/diego-simeone-confirms-julian-alvarez-set-to-miss-atletico-madrid-match-against-sevilla',
    publishedAt: '2026-08-29', updatedAt: null,
    image: 'assets/aövarez.jpg', video: null,
    priority: 'normal'
  },
  {
    id: 'laliga-endrick-stays-2026-08-10',
    sport: 'football', league: 'laliga', category: 'transfer', status: 'confirmed',
    headline: 'Endrick stays at Real Madrid after Mourinho halts loan talks',
    dek: 'Madrid had considered sending the Brazilian to Manchester United or Aston Villa before changing course.',
    summary: 'Mourinho stopped the loan discussions and told the club he sees a role for Endrick this season.',
    body: [
      'Real Madrid have decided Endrick will stay at the club this season, with José Mourinho halting loan talks that had been under way.',
      'Madrid had considered sending the Brazilian out again, with Manchester United and Aston Villa both credited with interest. Mourinho stopped those discussions and took the position that Endrick could play a significant part in his squad.',
      'The 20-year-old spent the second half of last season on loan at Lyon, scoring eight goals and adding five assists in 21 appearances.',
      'The decision is not necessarily final. Loan talks are expected to be revisited in January if he is not getting regular minutes.'
    ],
    source: 'Sports Illustrated',
    sourceUrl: 'https://www.si.com/soccer/real-madrid-u-turn-endrick-2026-27-season',
    publishedAt: '2026-08-10', updatedAt: null,
    image: 'assets/endrick.jpg', video: null,
    priority: 'low'
  },
  {
    id: 'laliga-jesus-barcelona-2026-09-01',
    sport: 'football', league: 'laliga', category: 'transfer', status: 'confirmed',
    headline: 'Barcelona sign Gabriel Jesus from Arsenal on deadline day',
    dek: 'The Brazilian striker had been training away from Arsenal’s first team since late August.',
    summary: 'The move was completed as the summer window closed on Tuesday.',
    body: [
      'Barcelona have signed striker Gabriel Jesus from Arsenal, completing the move on transfer deadline day.',
      'Jesus had been training away from Arsenal’s first team for the final weeks of the window, with manager Mikel Arteta citing a surplus of attacking options. Napoli, Everton and Ipswich had also been credited with interest before Barcelona completed the deal.',
      'The Brazilian joined Arsenal from Manchester City in 2022.'
    ],
    source: 'Al Jazeera',
    sourceUrl: 'https://www.aljazeera.com/sports/2026/8/31/transfer-deadline-day-2026-football-summer-signing-window-barcola-gakpo-alvarez',
    publishedAt: '2026-09-01', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'laliga-cucurella-real-madrid-2026-09-01',
    sport: 'football', league: 'laliga', category: 'transfer', status: 'confirmed',
    headline: 'Real Madrid complete £52m deadline-day deal for Marc Cucurella',
    dek: 'The left-back leaves Chelsea for Spain as Madrid also complete a €125m move for Yan Diomande.',
    summary: 'Cucurella becomes one of two big deadline-day arrivals for Real Madrid, alongside Ivory Coast winger Diomande.',
    body: [
      'Real Madrid have signed left-back Marc Cucurella from Chelsea for a fee of around £52 million, completed on transfer deadline day.',
      'The move was one of two major deadline-day signings for Madrid, who also completed a €125 million deal for Ivory Coast winger Yan Diomande.',
      'Cucurella joined Chelsea from Brighton in 2022 and had established himself as a regular starter in the Premier League.'
    ],
    source: 'GiveMeSport',
    sourceUrl: 'https://www.givemesport.com/real-madrid-transfers-2026-27/',
    publishedAt: '2026-09-01', updatedAt: null,
    image: null, video: null,
    priority: 'low'
  },
  /* ------------------------------------------------------------ BUNDESLIGA */
  {
    id: 'bundesliga-elversberg-leverkusen-2026-08-29',
    sport: 'football', league: 'bundesliga', category: 'match', status: 'confirmed',
    headline: 'Elversberg beat Leverkusen 3-2 on their Bundesliga debut',
    dek: 'The Saarland club, playing their first ever top-flight match, were three up before Leverkusen made it uncomfortable.',
    summary: 'Lukas Petkov scored Elversberg’s first Bundesliga goal inside eight minutes. Schick and Kofane pulled two back too late.',
    body: [
      'SV Elversberg marked their first ever Bundesliga match by beating Bayer Leverkusen 3-2, a result that ranks among the great debuts in the competition’s history.',
      'Lukas Petkov scored the club’s first Bundesliga goal after eight minutes, his shot taking a deflection on the way in. Campbell added a second a minute later, capitalising on a misplaced pass from Edmond Tapsoba, and the promoted side went in 2-0 up at half-time.',
      'It got better 25 seconds after the restart. David Mokwa headed in from close range following a Petkov cross to make it 3-0.',
      'Leverkusen responded through Patrik Schick, who turned in at the near post after a deflection off Maza, and Christian Kofane pulled the second back late on after a Boniface header came off the post. The last ten minutes were played almost entirely in the Elversberg half. It was not enough.',
      'The context makes the result unusual rather than merely surprising. Elversberg came up from the 2. Bundesliga this summer, having finished second with 62 points from 34 matches. Spiesen-Elversberg is a town of a few thousand people in the Saarland, and this was the club’s first appearance in the German top flight in its history.',
      'Leverkusen, by contrast, opened the season as one of the division’s established European contenders. Losing the opening fixture to a promoted side does not decide anything in August, but it hands Elversberg three points and a result the club will be measured against for the rest of the season.'
    ],
    source: 'sport.de',
    sourceUrl: 'https://www.sport.de/fussball/deutschland-bundesliga/ma12193711/sv-07-elversberg_bayer-leverkusen/liveticker/',
    publishedAt: '2026-08-29', updatedAt: null,
    image: null, video: null,
    priority: 'high'
  },
  {
    id: 'bundesliga-bayern-stuttgart-2026-08-28',
    sport: 'football', league: 'bundesliga', category: 'match', status: 'confirmed',
    headline: 'Bayern open the season with a 5-1 rout of Stuttgart',
    dek: 'Upamecano scored the first goal of the 2026-27 Bundesliga, and the champions pulled away after Stuttgart had briefly levelled.',
    summary: 'Dayot Upamecano headed in a Kimmich corner on 21 minutes at the Allianz Arena. Josha Vagnoman equalised, then scored an own goal as Bayern ran away with it.',
    body: [
      'Bayern Munich began the defence of their title with a 5-1 win over VfB Stuttgart at the Allianz Arena on Friday evening, opening the 64th Bundesliga season.',
      'Dayot Upamecano scored the first goal of the 2026-27 campaign on 21 minutes, heading in a Joshua Kimmich corner. Bayern took that single-goal lead into the interval.',
      'Josha Vagnoman levelled for Stuttgart on 52 minutes, but the equaliser lasted three minutes: Michael Olise restored the lead on 55. It then turned bitter for Vagnoman, who put through his own net on 58 to settle the match. Aleksandar Pavlović made it 4-1 on 84 minutes, and Luis Díaz added a fifth in stoppage time.',
      'The result extends a long run in the season opener. This was the 25th edition of the Bundesliga’s official opening fixture, and the defending champions have never lost it, with 19 wins and five draws. Bayern have now gone 14 consecutive season openers without defeat.',
      'Vincent Kompany’s side arrived in form, having beaten Borussia Dortmund 2-1 in the Franz Beckenbauer Supercup on 22 August. "It comes down to staying hungry and resetting everything to zero," Kompany said afterwards.',
      'The 2026-27 season runs to 22 May 2027. Schalke 04, SV Elversberg and SC Paderborn come up from the 2. Bundesliga, replacing VfL Wolfsburg, 1. FC Heidenheim and FC St. Pauli.'
    ],
    source: 'Sportschau (ARD)',
    sourceUrl: 'https://www.sportschau.de/fussball/bundesliga/naechstes-schuetzenfest-zum-auftakt-bayern-schon-wieder-spitze,spielbericht-bayern-muenchen-vfb-stuttgart-106.html',
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },
  {
    id: 'bundesliga-augsburg-seol-2026-08-27',
    sport: 'football', league: 'bundesliga', category: 'transfer', status: 'confirmed',
    headline: 'Augsburg sign South Korea international Youngwoo Seol until 2030',
    dek: 'The wing-back arrives from Red Star Belgrade as the club’s eighth signing of the window.',
    summary: 'Kicker reports a fee of €3.75m plus bonuses, with Red Star retaining a 5% sell-on clause.',
    body: [
      'FC Augsburg have signed Youngwoo Seol from Red Star Belgrade on a contract running to 2030. Kicker reports a fee of €3.75 million plus bonuses, with Red Star retaining a five percent sell-on clause.',
      'The 27-year-old wing-back takes the number 7 shirt and is Augsburg’s eighth signing of the window. He made 101 appearances for Red Star after joining in 2024, winning two Serbian SuperLiga titles and two Serbian Cups.',
      'A 37-time international, Seol started all three of South Korea’s matches at the 2026 World Cup. He is the fourth South Korean to play for Augsburg, after Ja-Cheol Koo, Dong-Won Ji and Jeong-Ho Hong.'
    ],
    source: 'Bundesliga.com',
    sourceUrl: 'https://www.bundesliga.com/en/bundesliga/news/augsburg-sign-seol-young-woo-red-star-belgrade-38811',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null,
    priority: 'low'
  },
  {
    id: 'bundesliga-diaby-leverkusen-2026-09-01',
    sport: 'football', league: 'bundesliga', category: 'transfer', status: 'confirmed',
    headline: 'Moussa Diaby returns to Bayer Leverkusen on deadline day',
    dek: 'The winger rejoins the club he left for Aston Villa in 2023.',
    summary: 'Leverkusen also added Ivorian right-back Guéla Doué from Strasbourg on a five-year deal.',
    body: [
      'Moussa Diaby is back at Bayer Leverkusen, completing a return to the club on the final day of the summer transfer window.',
      'The winger left Leverkusen for Aston Villa in 2023. Terms of the deal bringing him back have not been disclosed.',
      'Leverkusen were busy elsewhere on deadline day too, announcing the signing of Ivorian right-back Guéla Doué from French side Strasbourg on a five-year deal through to 2031.'
    ],
    source: 'Bavarian Football Works',
    sourceUrl: 'https://www.bavarianfootballworks.com/bayern-munich-transfer-news-rumors/250692/deadline-day-transfer-updates-you-should-know-3',
    publishedAt: '2026-09-01', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },

  /* ----------------------------------------------------- CHAMPIONS LEAGUE */
  {
    id: 'ucl-league-phase-draw-2026-08-28',
    sport: 'football', league: 'ucl', category: 'league', status: 'confirmed',
    headline: 'Champions League draw sends Arsenal to Real Madrid and Bayern Munich',
    dek: 'UEFA held the 2026-27 League Phase draw in Monaco, pairing every team with eight opponents.',
    summary: 'Arsenal drew Real Madrid, Bayern Munich, Borussia Dortmund, Real Betis, Lille, Napoli, Sabah and Slavia Prague.',
    body: [
      'UEFA held the draw for the League Phase of the 2026-27 Champions League in Monaco, with each of the 36 clubs learning their eight opponents for the group-style stage.',
      'Arsenal were drawn against Real Madrid, Bayern Munich, Borussia Dortmund, Real Betis, Lille, Napoli, Sabah and Slavia Prague, hosting Real Madrid, Dortmund, Lille and Sabah at the Emirates and travelling to Munich, Seville, Naples and Prague.',
      'Elsewhere in the draw, Manchester City and Paris Saint-Germain — the last two Champions League winners — were paired together, and holders PSG were also drawn against Barcelona.',
      'Each team plays eight League Phase matches, four at home and four away, before the competition moves into its knockout rounds.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/soccer/story/_/id/49743130/uefa-champions-league-draw-2026-27-psg-arsenal-barcelona-real-madrid',
    publishedAt: '2026-08-28', updatedAt: null,
    image: 'assets/realarsbay.jpg', video: null,
    priority: 'normal'
  },

  /* -------------------------------------------------------- EUROPA LEAGUE */
  // Only the confirmed, verified format/schedule facts are used here — team-
  // by-team pairings for the 2026-27 draw could not be independently
  // confirmed against a live 2026-27 source at the time of writing (search
  // results kept surfacing prior-season fixture data for specific clubs), so
  // none are reported as this season's matchups.
  {
    id: 'uel-league-phase-draw-2026-08-28',
    sport: 'football', league: 'uel', category: 'league', status: 'confirmed',
    headline: 'Europa League League Phase draw held in Monaco',
    dek: 'Thirty-six clubs learned their opponents for a 144-match league stage running into January.',
    summary: 'Each club plays eight League Phase matches, two against a side from each of four pots, before the knockout rounds.',
    body: [
      'UEFA held the League Phase draw for the 2026-27 Europa League at the Grimaldi Forum in Monaco on Friday 28 August.',
      'Thirty-six clubs were split into four pots of nine, seeded by club coefficient, and each was drawn against two opponents from every pot — one at home, one away — for a 144-match league stage. Teams cannot face a club from their own association, and can meet at most two sides from the same country.',
      'League Phase matchdays run from 16-17 September 2026 through 28 January 2027, after which the competition moves into its knockout stage. The final is scheduled for Stadion Frankfurt in Frankfurt, Germany, on 26 May 2027.'
    ],
    source: 'UEFA.com',
    sourceUrl: 'https://www.uefa.com/uefaeuropaleague/news/02a8-216e9cafba52-f039617d7982-1000--2026-27-europa-league-league-phase-draw-contenders-learn/',
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null,
    priority: 'normal'
  },

  {
    id: "laliga-valencia-2026-09-06",
    sport: "football", league: "laliga", category: "match", status: "confirmed",
    headline: "Barcelona dominates Valencia 5-0 away at Mestalla",
    dek: "Barcelona's commanding performance on the road delivered a five-goal shutout win in La Liga's fourth round of regular-season play.",
    summary: "Barcelona beat Valencia 5-0 away from home in La Liga on 2026-09-06, dominating possession and chance creation in the process.",
    body: [
      "Barcelona delivered a dominant display at Mestalla, defeating Valencia 5-0 on 2026-09-06 in La Liga's fourth round of regular-season fixtures. Playing away from home, Barcelona controlled the match with 74 percent possession to Valencia's 26 percent, translating that advantage into a comprehensive victory.",
      "Barcelona's attacking threat was evident throughout. The visitors generated 10 shots on target and created 6 big chances, while Valencia managed only 2 shots on target and 1 big chance. Barcelona also recorded 19 key passes and 15 successful dribbles, showcasing sustained attacking pressure. Expected Goals figures reflected the one-sided nature of the contest: Barcelona 4.05, Valencia 0.67.",
      "Defensively, Barcelona conceded little danger. Valencia committed 7 fouls to Barcelona's 6, and while both sides shared an equal record in aerial duels at 5 successful apiece, Barcelona's control of the ball and territory left the hosts with few meaningful opportunities. The 5-0 margin delivered a commanding performance on the road."
    ],
    source: "Official match data",
    sourceUrl: null,
    publishedAt: "2026-09-06", updatedAt: null,
    image: null, video: {"provider":"youtube","id":"bhtXUaCHL7A","title":"VALENCIA 0 vs 5 FC BARCELONA | LALIGA 2026/27 MD04 🔵🔴","sourceName":"FC Barcelona","sourceUrl":"https://www.youtube.com/watch?v=bhtXUaCHL7A","official":false,"embeddable":true,"rightsStatus":"EMBED_ALLOWED"},
    articleMode: "performance", continuityKey: null,
    priority: "normal",
    gameResult: true
  },

  {
    id: "college-football-ole-miss-rebels-2026-09-06",
    sport: "americanfootball", league: "college-football", category: "game", status: "confirmed",
    headline: "Ole Miss edges Louisville 41-38 at Nissan Stadium",
    dek: "The Rebels overcame a third-quarter deficit to secure a three-point home victory in regular-season play on September 6th.",
    summary: "Ole Miss Rebels defeated Louisville Cardinals 41-38 in college football on 2026-09-06, with the Rebels outgaining Louisville 488 to 469 total yards.",
    body: [
      "Ole Miss won 41-38 against Louisville in regular-season college football at Nissan Stadium in Nashville, Tennessee. The Rebels trailed early but seized control in the second quarter and held on through the fourth to secure the three-point victory.",
      "Ole Miss scored 0 points in the first quarter before adding 10 in the second to lead 10-6 at halftime. Louisville responded with 18 points in the third to take a 24-20 advantage into the final quarter, but Ole Miss scored 17 in the fourth to complete the comeback. The Rebels accumulated 488 total yards—336 passing and 152 rushing—compared to Louisville's 469 total yards (307 passing, 162 rushing). Ole Miss held a 24-20 advantage in first downs.",
      "Louisville's nine penalties for 82 yards and longer possession time—30:58 to 29:02—proved insufficient to overcome two turnovers, including one interception thrown. Ole Miss committed one fumble lost in the game. Louisville converted all seven of its third-down attempts on six attempts, while Ole Miss went 6-for-16 on third down. Ole Miss gained 9.1 yards per pass attempt compared to Louisville's 10.6."
    ],
    source: "Official match data",
    sourceUrl: null,
    publishedAt: "2026-09-06", updatedAt: null,
    image: null, video: {"provider":"youtube","id":"5ow5lZ5Ezqo","title":"No. 24 Louisville Cardinals vs. No. 9 Ole Miss Rebels | Game Highlights | 2026 SEC Football Week 1","sourceName":"SEC","sourceUrl":"https://www.youtube.com/watch?v=5ow5lZ5Ezqo","official":false,"embeddable":true,"rightsStatus":"EMBED_ALLOWED"},
    articleMode: "performance", continuityKey: null,
    priority: "normal",
    gameResult: true
  },

  {
    id: "epl-arsenal-2026-09-07",
    sport: "football", league: "epl", category: "injury", status: "report",
    headline: "Arteta cautiously optimistic on Mosquera injury after Chelsea absence",
    dek: "The Arsenal defender sat out Sunday's match against Chelsea with a muscle injury, though the manager believes it may not be severe.",
    summary: "Mikel Arteta provided an injury update on 22-year-old Cristhian Mosquera, who missed Arsenal's Chelsea fixture with a muscle problem that the manager hopes is not serious.",
    body: [
      "Cristhian Mosquera missed Arsenal's Sunday match against Chelsea due to a muscle injury, but manager Mikel Arteta expressed cautious optimism about the severity of the problem.",
      "The 22-year-old defender's absence came as Arsenal took on Chelsea in what appears to have been a Premier League fixture. While Arteta stopped short of declaring the injury minor, he indicated that early indications suggest it may not be as serious as initial concern might suggest."
    ],
    source: "Yahoo Sports",
    sourceUrl: "https://sports.yahoo.com/articles/arteta-gives-injury-arsenal-22yo-110500225.html",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-manchester-united-2026-09-07",
    sport: "football", league: "epl", category: "league", status: "report",
    headline: "Manchester United's defensive struggles and substitution choices come under scrutiny after Everton draw",
    dek: "Following a 2-2 draw at Everton, questions are being raised about Manchester United's ability to close out matches, with debate over both tactical decisions and the team's defensive record.",
    summary: "Manchester United fan and former Premier League striker offer contrasting takes on why United drew 2-2 at Everton, citing substitution strategy and defensive frailty.",
    body: [
      "Manchester United's 2-2 draw at Everton on Sunday has sparked debate about the club's ability to see matches through to victory. Fan Beth Tucker pointed to manager Michael Carrick's decision to substitute Marcus Rashford as a turning point in the game, while former Premier League striker Clinton Morrison has identified deeper defensive issues as a root cause of United's recent struggles.",
      "United have conceded six goals across their opening three games of the season, a defensive record that has drawn criticism. The performance at Everton represents the latest setback in what has been a difficult start to the campaign, raising questions about whether the team's problems are merely early-season teething troubles or more fundamental structural issues.",
      "The contrasting analyses—one focused on in-game management and the other on defensive solidity—reflect broader uncertainty about the direction of Carrick's tenure and whether United can improve their form in the coming weeks."
    ],
    source: "Yahoo Sports",
    sourceUrl: "https://sports.yahoo.com/articles/cannot-trust-man-utd-see-111720801.html",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nba-timberwolves-trade-josh-green-2026-09-07",
    sport: "basketball", league: "nba", category: "trade", status: "report",
    headline: "Timberwolves trade Josh Green and cash to Jazz for Williams and Konchar",
    dek: "Minnesota has moved the 3-and-D wing to Utah in a deal that brings back forward Cody Williams and guard John Konchar.",
    summary: "The Timberwolves have traded Josh Green and cash to the Jazz for Cody Williams and John Konchar.",
    body: [
      "The Minnesota Timberwolves have traded Josh Green and cash to the Utah Jazz in exchange for forward Cody Williams and guard John Konchar, according to reporting.",
      "The deal sends the 3-and-D wing out of Minnesota as the team makes a move to reshape its roster. In return, the Timberwolves acquire Williams and Konchar from Utah."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nba/story/_/id/49759209/wolves-trade-3-d-wing-josh-green-jazaz",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nba-boston-celtics-2026-09-07",
    sport: "basketball", league: "nba", category: "league", status: "report",
    headline: "Jaylen Brown Receives Key to City at Boston Common Farewell Event",
    dek: "The former Celtics forward marked his departure from Boston with a block party and civic honor.",
    summary: "Jaylen Brown hosted a farewell block party at Boston Common and received the key to the city.",
    body: [
      "Jaylen Brown received the key to the city of Boston during a block party at Boston Common, marking his farewell to the franchise and the city.",
      "The event served as Brown's public goodbye following his departure from the Boston Celtics. No further details about the timing or circumstances of his exit were available."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nba/story/_/id/49778671/jaylen-brown-boston-celtics-farewell-block-party-key-city-nba",
    publishedAt: "2026-09-07", updatedAt: null,
    image: "assets/nba-boston-celtics-2026-09-07.png", video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nba-oladipo-seeks-nba-return-2026-09-07",
    sport: "basketball", league: "nba", category: "league", status: "report",
    headline: "Oladipo seeks NBA return with open letter to general managers",
    dek: "The guard, sidelined since April 2023, has written directly to NBA front offices stating he is now healthy and ready to play.",
    summary: "Victor Oladipo has written an open letter to NBA general managers requesting another opportunity in the league, saying he is healthy after being out since April 2023.",
    body: [
      "Victor Oladipo has addressed NBA general managers in an open letter asking for another chance at an NBA roster, stating that he is now healthy after more than three years away from the league.",
      "Oladipo has been out of the NBA since April 2023. The letter represents a direct appeal to front offices as he attempts to secure a path back to professional basketball."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nba/story/_/id/49794486/oladipo-writes-open-letter-nba-gms-asking-second-chance",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nba-sacramento-kings-2026-09-07",
    sport: "basketball", league: "nba", category: "league", status: "report",
    headline: "Ben Simmons Agrees to One-Year Deal With Kings",
    dek: "The guard has reached a reported $3.5 million contract with Sacramento after time away from the NBA, according to his representation.",
    summary: "Ben Simmons has agreed to a one-year, $3.5 million deal with the Sacramento Kings, his agents told ESPN and Andscape.",
    body: [
      "Ben Simmons has agreed to a one-year, $3.5 million contract with the Sacramento Kings, according to reporting from ESPN and Andscape, citing Simmons' agents Max Wiepking, Sean Tribe and Ryan Arney.",
      "The deal marks Simmons' return to NBA competition. The reported contract value is $3.5 million on a one-year term."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nba/story/_/id/49824980/sources-ben-simmons-agrees-1-year-35m-deal-kings",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nba-philadelphia-76ers-2026-09-07",
    sport: "basketball", league: "nba", category: "signing", status: "report",
    headline: "76ers sign Fall, Nelson Jr., Thomas to training camp deals",
    dek: "The Philadelphia 76ers have bolstered their camp roster with three Exhibit 10 signings ahead of the 2026–27 season.",
    summary: "The 76ers signed Tacko Fall, Jameer Nelson Jr., and Saint Thomas to Exhibit 10 contracts for training camp.",
    body: [
      "The Philadelphia 76ers have signed three players to Exhibit 10 contracts, according to reporting from ESPN. The signings include Tacko Fall, Jameer Nelson Jr., and Saint Thomas.",
      "Exhibit 10 deals are non-guaranteed contracts that allow teams to invite players to training camp while retaining flexibility on their final roster decisions. Fall, a 7-foot-6 center, is among those brought in on the agreement."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nba/story/_/id/49795456/76ers-sign-7-foot-6-center-tacko-fall-others-camp-deal",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nba-la-clippers-2026-09-07",
    sport: "basketball", league: "nba", category: "investigation", status: "report",
    headline: "NBA suspends Clippers owner Ballmer for one year, strips team of five first-round picks over Kawhi Leonard sponsorship investigation",
    dek: "The league announced significant penalties against the LA Clippers following an investigation into a sponsorship arrangement involving Kawhi Leonard. Owner Steve Ballmer faces a one-year suspension.",
    summary: "The NBA has penalized the LA Clippers with five forfeited first-round picks, a $30 million fine, and a one-year suspension of owner Steve Ballmer following an investigation into a Kawhi Leonard sponsorship deal.",
    body: [
      "The NBA has announced punishments against the LA Clippers stemming from an investigation into a Kawhi Leonard sponsorship arrangement. The league docked the team five first-round picks, fined them $30 million, and suspended owner Steve Ballmer for one year.",
      "The Clippers have indicated they plan to challenge the findings through legal means, according to reporting."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nba/story/_/id/49806356/nba-announces-punishments-clippers-kawhi-probe",
    publishedAt: "2026-09-07", updatedAt: null,
    image: "assets/nba-la-clippers-2026-09-07.jpg", video: null,
    imageCredit: "Own work", imageSourceUrl: "https://commons.wikimedia.org/wiki/File:L.A._Clippers_Plaza_Basketball_Court_and_Video_Board_at_Intuit_Dome.jpg", imageRights: "CC BY-SA 4.0",
    articleMode: "news", continuityKey: null,
    priority: "high"
  },

  {
    id: "nba-houston-rockets-thompson-2026-09-07",
    sport: "basketball", league: "nba", category: "signing", status: "report",
    headline: "Rockets, Thompson agree to $208M rookie-scale extension",
    dek: "Houston guard Amen Thompson has reached a five-year deal with the franchise, according to ESPN reporting. The contract is built on the rookie-scale extension framework.",
    summary: "Amen Thompson and the Houston Rockets have agreed to a five-year, $208 million rookie-scale contract extension, according to ESPN.",
    body: [
      "Houston Rockets guard Amen Thompson has agreed to a five-year, $208 million rookie-scale contract extension with the franchise, according to ESPN reporting.",
      "The deal keeps Thompson with the Rockets on an extended rookie-scale agreement, a structure that applies to players selected early in the NBA Draft during their initial years of eligibility."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nba/story/_/id/49814480/sources-rockets-amen-thompson-agrees-5-year-208m-extension",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "bundesliga-germany-2026-09-07",
    sport: "football", league: "bundesliga", category: "league", status: "confirmed",
    headline: "American players in Germany: 2026/27 Bundesliga tracker",
    dek: "Several USMNT regulars and promising youngsters are competing in the Bundesliga this season. Here's how they have started.",
    summary: "Tracks American nationals competing in Germany's Bundesliga during the 2026/27 season, with early-campaign statistics and performance notes.",
    body: [
      "A cohort of American players is featured across Bundesliga rosters for the 2026/27 campaign, ranging from established USMNT regulars to developing talent.",
      "Malik Tillman, a 24-year-old midfielder for Bayer Leverkusen, has appeared in 2 matches with 2 starts. A Bayern Munich academy product, Tillman scored six goals in 29 appearances during his first Bundesliga season at Leverkusen before representing the United States at the 2026 FIFA World Cup. In Leverkusen's Matchday 2 home fixture, Tillman started and played 67 minutes as the club defeated Union Berlin 4-0.",
      "Joe Scally, a 23-year-old full-back for Borussia Mönchengladbach, has recorded 2 appearances with 1 start through early in the campaign.",
      "Cole Campbell is among the American contingent, though additional details regarding his club assignment and early-season statistics were not specified in available information.",
      "Mathis Albert, a 17-year-old forward for Borussia Dortmund, has not yet appeared in a league match this season.",
      "Lennard Maloney, a 26-year-old midfielder for Mainz, came off the bench in the 88th minute during Mainz's 5-0 victory over Hamburg at the Volksparkstadion. Maloney was primarily used as a substitute during the 2025/26 season, a role he continued in early 2026/27."
    ],
    source: "Bundesliga.com",
    sourceUrl: "https://www.bundesliga.com/en/2bundesliga/news/us-soccer-players-germany-round-up-gio-reyna-scally-tillman-5874",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "tracker", continuityKey: "bundesliga:tracker:american-soccer-players-germany-edition:2026-27",
    priority: "normal"
  },

  {
    id: "epl-western-michigan-2026-09-07",
    sport: "football", league: "epl", category: "league", status: "report",
    headline: "Western Michigan chose acceptance over outrage after controversial Michigan finish",
    dek: "Rather than fight the Big Ten's replay ruling that gave Michigan a walk-off touchdown, Western Michigan's leadership decided to move forward—a notably restrained response in an era of athletic grievance.",
    summary: "After a controversial loss to Michigan, Western Michigan's president and football coach chose to accept the Big Ten's replay decision instead of contesting the result, despite believing the call may have been unfair.",
    body: [
      "When Western Michigan's university president called a press conference the morning after the Broncos' loss to Michigan, the school had an unusually clean case for outrage. According to CBS Sports reporting, Western Michigan had entered Michigan Stadium as a four-touchdown underdog and led for most of the night before a controversial Hail Mary finish cost them the game. Yet instead of filing suit or mounting a public campaign against the Big Ten's replay ruling, the program's leadership chose a path of acceptance.",
      "The president spent hours after the loss inside Michigan Stadium exploring ways to contest the decision, speaking with MAC commissioner Jon Steinbrecher and Big Ten commissioner Tony Petitti at 1 a.m. Still, the school ultimately declined to push the issue further. According to the reporting, both the president and football coach Lance Taylor neither believed the call was correct nor were they staunch supporters of the outcome, but they expressed support for the integrity of the Big Ten's system and process. People close to the program reportedly wanted them to press the matter further Saturday night, but they did not.",
      "Taylor took ownership of the loss, assigning responsibility to his own team rather than the controversial finish. He noted that Western Michigan had chances to put the game away before it reached the final Hail Mary and that his own clock management could have been better. The president framed the situation as an opportunity for the university to demonstrate its values. 'Western Michigan University teaches people how to get punched in the mouth and the gut, and then get up and go forward,' he said, according to the reporting. 'That's what we're going to do, because that's what you do if you're from Western Michigan University.' The school was aware that the game's result would not change regardless of their response."
    ],
    source: "CBS Sports",
    sourceUrl: "https://www.cbssports.com/college-football/news/inside-western-michigan-leaders-michigan-clock-controversy-hail-mary/",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "feature", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-anderson-sets-premier-league-2026-09-07",
    sport: "football", league: "epl", category: "match", status: "report",
    headline: "Anderson sets Premier League passing record in Man of the Match display against Coventry",
    dek: "Elliot Anderson reached a new Premier League milestone during Saturday's match against Coventry, earning recognition for an all-action midfield performance.",
    summary: "Elliot Anderson set a new Premier League passing record during Manchester's Man of the Match performance against Coventry on Saturday.",
    body: [
      "Elliot Anderson set a new Premier League record for passes during Saturday's match against Coventry, delivering a Man of the Match display in the process.",
      "The midfielder's all-action performance helped secure the win, with Anderson's passing output surpassing the previous Premier League standard."
    ],
    source: "Yahoo Sports",
    sourceUrl: "https://sports.yahoo.com/articles/anderson-breaks-premier-league-passing-085000417.html",
    publishedAt: "2026-09-07", updatedAt: null,
    image: "assets/epl-anderson-sets-premier-league-2026-09-07.png", video: null,
    articleMode: "performance", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-manchester-united-2026-09-07-2",
    sport: "football", league: "epl", category: "transfer", status: "report",
    headline: "Manchester United offered chance to sign Atlético Madrid's Sørloth",
    dek: "The Norway striker has emerged as a potential target for the Premier League club, though his departure from the Spanish side may hinge on Atlético securing a replacement.",
    summary: "According to reports, Manchester United have been offered the opportunity to sign Atlético Madrid striker Alexander Sørloth, with the player's availability dependent on Atlético finding a successor.",
    body: [
      "Manchester United have been offered the chance to sign Atlético Madrid striker Alexander Sørloth, according to reports from TeamTalk and ESPN's transfer coverage.",
      "Sørloth's potential departure from Atlético Madrid appears to be conditional on the Spanish club securing a replacement striker. The Norway international's availability for transfer remains uncertain pending how Atlético addresses their attacking options."
    ],
    source: "Yahoo Sports",
    sourceUrl: "https://sports.yahoo.com/articles/rloth-departure-depends-atl-tico-090000620.html",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "laliga-fc-barcelona-2026-09-07",
    sport: "football", league: "laliga", category: "league", status: "report",
    headline: "Valencia fans protest after 5-0 home defeat to Barcelona",
    dek: "Supporters staged a demonstration against club officials and players following a heavy loss to Barcelona in LaLiga on Sunday.",
    summary: "Valencia fans protested against club officials and players after a 5-0 home loss to Barcelona in LaLiga.",
    body: [
      "Valencia fans protested against club officials and players following a 5-0 home defeat to Barcelona in LaLiga on Sunday, according to reporting from ESPN.",
      "The loss marked a significant setback for the home side, and the demonstration reflected supporter frustration with both the club's leadership and the team's performance on the pitch."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/soccer/story/_/id/49854032/valencia-fans-slam-owner-peter-lim-club-mercenaries",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-arsenal-alonso-2026-09-07",
    sport: "football", league: "epl", category: "match", status: "report",
    headline: "Alonso: Chelsea must address defensive frailties after Arsenal loss",
    dek: "Chelsea manager Xabi Alonso acknowledged his side's defensive vulnerabilities following a 2-1 defeat to Arsenal, a result that has seen the club concede seven goals in just three games this season.",
    summary: "Chelsea fell 2-1 to Arsenal, conceding their seventh goal in three games; Alonso called for defensive improvements.",
    body: [
      "Chelsea suffered a 2-1 defeat against Arsenal, a result that has underscored persistent defensive concerns for Xabi Alonso's side early in the season. According to reports, Alonso acknowledged the need to resolve these frailties, with the loss part of a troubling defensive trend.",
      "The defeat marked Chelsea's seventh goal conceded in just three games this season, a statistic that reflects the scale of the defensive challenge facing the club as the campaign continues."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/soccer/story/_/id/49851013/xabi-alonso-chelsea-address-defensive-issues-arsenal-defeat",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "performance", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-manchester-united-carrick-2026-09-07",
    sport: "football", league: "epl", category: "match", status: "report",
    headline: "Carrick says Man United's draw with Everton 'feels like defeat' after late equaliser",
    dek: "Manchester United conceded an equaliser in the 96th minute to draw 2-2 with Everton, prompting manager Michael Carrick to express frustration with the result.",
    summary: "Manchester United drew 2-2 with Everton after conceding a goal in the 96th minute; Carrick said the result felt like a defeat.",
    body: [
      "Manchester United drew 2-2 with Everton, conceding an equaliser in the 96th minute at what was reported as Hill Dickinson Stadium. The late goal proved costly, as the match ended level after United appeared positioned for a win.",
      "Manager Michael Carrick responded to the result by telling reporters that the draw \"feels like a defeat,\" reflecting his disappointment at surrendering a lead so late in the contest."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/soccer/story/_/id/49849966/man-united-draw-everton-feels-defeat",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "performance", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-arsenal-2026-09-07-2",
    sport: "football", league: "epl", category: "match", status: "report",
    headline: "Arsenal defeats Chelsea 2-1 in London derby comeback",
    dek: "Arsenal recovered from a goal down to secure a 2-1 victory over Chelsea in Sunday's Emirates encounter, with Martin Odegaard and Kai Havertz among those involved in the turnaround.",
    summary: "Arsenal came from behind to beat Chelsea 2-1 at the Emirates on Sunday.",
    body: [
      "Arsenal staged a second-half recovery to defeat Chelsea 2-1 in a London derby at the Emirates on Sunday. The hosts fell behind but turned the match around to secure the victory.",
      "Martin Odegaard and Kai Havertz featured prominently in Arsenal's comeback, according to reporting from the match."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/soccer/story/_/id/49850276/martin-odegaard-kai-havertz-arsenal-statement-london-derby-chelsea-report-reaction",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "performance", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-manchester-united-2026-09-07-3",
    sport: "football", league: "epl", category: "transfer", status: "report",
    headline: "Leeds United sign 16-year-old Silva Mexes from Manchester United academy",
    dek: "The left-winger has agreed a two-year scholarship contract with the Championship club after leaving Manchester United's youth ranks.",
    summary: "Leeds United have completed the signing of academy prospect Silva Mexes from Manchester United on a two-year scholarship deal.",
    body: [
      "Leeds United have agreed a deal to sign Silva Mexes from Manchester United, with the 16-year-old left-winger accepting a two-year scholarship contract at Elland Road.",
      "Mexes departs Manchester United's academy to join the Championship side. The move concludes Leeds' summer pursuit of the prospect."
    ],
    source: "Yahoo Sports",
    sourceUrl: "https://sports.yahoo.com/articles/leeds-united-land-talented-man-090000435.html",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "bundesliga-rb-leipzig-niclas-f-llkrug-2026-09-05",
    sport: "football", league: "bundesliga", category: "match", status: "confirmed",
    headline: "Füllkrug nets return goal as Bremen hammers Leipzig",
    dek: "Werder Bremen secured a 3-1 victory over RB Leipzig at the Weserstadion, bouncing back from their defeat at Freiburg the previous weekend. Niclas Füllkrug marked his return to the club with a goal in the comfortable win.",
    summary: "Werder Bremen defeated RB Leipzig 3-1, with Niclas Füllkrug scoring his first goal since rejoining the club.",
    body: [
      "Werder Bremen came from their loss at Freiburg to thoroughly outplay RB Leipzig, winning 3-1 at the Weserstadion. Eren Dinkçi opened the scoring in the fourth minute, before Niclas Füllkrug and Marco Grüll added second-half goals to put the match beyond reach. Ridle Baku pulled one back late for Leipzig, but it proved only a consolation.",
      "Füllkrug powered home unmarked from Grüll's corner in the 68th minute to double Bremen's lead, while Grüll himself netted the third 12 minutes later. Christopher Nkunku, making his second full debut for Leipzig, had the visitors' clearest chance of the first half but his effort from Baku's cross went straight at Bremen goalkeeper Hein.",
      "Manager Daniel Thioune made three changes to the Bremen side that lost 4-1 in the Black Forest, bringing in new signings Arthur, Youri Regeer and Eren Dinkçi to the starting XI. Leipzig head coach Martín Demichelis was without Castello Lukeba, Rocco Reitz and Brajan Gruda but handed starts to Maxime Estève, Neil El Aynaoui, Johan Bakayoko and summer arrival Nkunku."
    ],
    source: "Bundesliga.com (official)",
    sourceUrl: "https://www.bundesliga.com/en/bundesliga/news/werder-bremen-rb-leipzig-match-report-highlights-matchday-2-fullkrug-39043",
    publishedAt: "2026-09-05", updatedAt: null,
    image: null, video: null,
    articleMode: "performance", continuityKey: null,
    priority: "high"
  },

  {
    id: "bundesliga-eintracht-frankfurt-2026-09-07",
    sport: "football", league: "bundesliga", category: "match", status: "confirmed",
    headline: "Augsburg complete stunning comeback to top Bundesliga after crushing Frankfurt",
    dek: "Arijon Ibrahimović's debut goal started Augsburg's fightback from 1-0 down, with two strikes in quick succession flipping the contest before late finishes sealed a 4-1 victory and sent Manuel Baum's side to the summit.",
    summary: "Augsburg rallied from a 1-0 deficit to beat Eintracht Frankfurt 4-1, moving to the top of the Bundesliga table on Matchday 2.",
    body: [
      "Eintracht Frankfurt made a perfect start but could not hold on as Augsburg stormed back to a 4-1 victory at the Commerzbank-Arena on Matchday 2. Jonathan Burkardt's sixth-minute header gave Frankfurt an early lead, but Arijon Ibrahimović equalized for Augsburg just after the restart before the visitors struck twice more in as many minutes through Mats Fellhauer to seize control of the contest.",
      "Alexis Claude-Maurice added a third in the 65th minute before Fabian Rieder sealed the rout with a goal in the 89th minute. Ibrahimović, making his Bundesliga debut after joining in place of injured Anton Kade, was influential throughout and claimed 39 per cent of the fan vote for Man of the Match, registering three shots on goal.",
      "Frankfurt had made three changes to the side that drew at Union Berlin, with Lilian Brassier making his Bundesliga bow alongside returning starters Mario Götze and Ritsu Dōan, but their bright opening proved misleading. The defeat left Frankfurt winless after two matches, while Augsburg, fresh from an opening-day victory over Schalke, moved to the top of the table with the comeback triumph."
    ],
    source: "Bundesliga.com",
    sourceUrl: "https://www.bundesliga.com/en/bundesliga/news/eintracht-frankfurt-augsburg-match-report-highlights-matchday-2-39067",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "performance", continuityKey: null,
    priority: "normal"
  },

  {
    id: "bundesliga-manuel-baum-2026-09-07",
    sport: "football", league: "bundesliga", category: "league", status: "confirmed",
    headline: "Augsburg top Bundesliga after perfect start under Baum",
    dek: "Manuel Baum's side have won their opening two matches with an impressive goal differential, defeating Schalke and Eintracht Frankfurt to claim the early league lead.",
    summary: "Augsburg sit atop the Bundesliga table after consecutive wins in the opening two weeks of the 2026/27 season, with seven goals scored and just one conceded.",
    body: [
      "Augsburg have made an unexpected flying start to the 2026/27 Bundesliga campaign, winning both of their opening matches to sit top of the table after two weeks. Manuel Baum's side scored seven goals while conceding only one in victories over Schalke and Eintracht Frankfurt, establishing themselves as an early surprise package.",
      "The wins put Augsburg ahead of Freiburg, Borussia Dortmund, and newly-promoted Elversberg in the standings. Four different players—Rodrigo Ribeiro (21), Anton Kade (22), Fabian Rieder (24), and Arijon Ibrahimović (20)—have already found the net, while defenders Noahkai Banks (19), Chrislain Matsima (24), and Hennes Behrens (21) have also impressed. The squad balances youth with experience, including Michael Gregoritsch (32), Marius Wolf (31), and goalkeeper Finn Dahmen (28), who have combined for 527 Bundesliga appearances.",
      "Augsburg's strong start builds on a solid finish to last season, when they lost just one of their final seven matches and finished four points short of a UEFA Europa Conference League spot. In their opening fixture, they dominated Schalke with 13 shots on target and an expected goals value of 3.48 en route to a 3-0 victory before a more challenging trip to Frankfurt."
    ],
    source: "Bundesliga.com",
    sourceUrl: "https://www.bundesliga.com/en/bundesliga/news/augsburg-flying-start-baum-frankfurt-schalke-ibrahimovic-39069",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "bundesliga-borussia-dortmund-j-rgen-klopp-2026-09-07",
    sport: "football", league: "bundesliga", category: "league", status: "confirmed",
    headline: "Kovač sets Dortmund record after 50 games, surpassing Klopp and Hitzfeld",
    dek: "Niko Kovač has accumulated more points than any other Borussia Dortmund head coach in their first 50 Bundesliga matches, including legendary predecessors like Jürgen Klopp.",
    summary: "Kovač has amassed 107 points across 50 Bundesliga games as Dortmund head coach—a club record surpassing Lucien Favre and Thomas Tuchel—while maintaining a 2.14 points-per-game average.",
    body: [
      "Niko Kovač has set a new Borussia Dortmund record in his first 50 Bundesliga matches as head coach, accumulating 107 points—more than any other manager to reach that milestone in the club's history. The record was marked by Dortmund's victory over Hoffenheim, which saw the team come from 2-0 down to secure the win.",
      "Across those 50 games, Dortmund have won 33 matches under Kovač. His 107-point tally surpasses Lucien Favre's 106 points and Thomas Tuchel's 105 points over the same span. By comparison, Jürgen Klopp managed 86 points in his first 50 league games as Dortmund head coach.",
      "Kovač's points-per-game ratio of 2.14 also tops the list among Dortmund head coaches after 50 games, ahead of Tuchel (2.09), Favre (2.08), Marco Rose (2.03), Edin Terzić (1.97), Klopp (1.91), and Ottmar Hitzfeld (1.85).",
      "The former Eintracht Frankfurt and Bayern Munich manager downplayed the achievement when speaking to Sky Germany. 'The stats are what they are,' Kovač said. 'When I'm not here anymore, someone else will do better. I will take the praise, but no more than that.'"
    ],
    source: "Bundesliga.com",
    sourceUrl: "https://www.bundesliga.com/en/bundesliga/news/better-than-klopp-hitzeld-kovac-highest-point-per-game-ratio-39070",
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "college-football-michigan-wolverines-2026-09-05",
    sport: "americanfootball", league: "college-football", category: "game", status: "confirmed",
    headline: "Michigan Edges Western Michigan 13-12 in Defensive Battle",
    dek: "The Wolverines survived a turnover-plagued performance at home on September 5, 2026, holding off the Broncos by a single point despite significant statistical disadvantages.",
    summary: "Michigan defeated Western Michigan 13-12 in a regular-season game marked by Michigan's three turnovers and penalties but sealed by a one-point home victory.",
    body: [
      "Michigan escaped with a 13-12 victory over Western Michigan at Michigan Stadium, winning a low-scoring defensive struggle that saw the Wolverines overcome their own mistakes to secure the one-point result.",
      "The Wolverines scored 7 points in the opening quarter and added 6 more in the fourth to reach 13. Western Michigan answered with 3 in the first quarter and 3 in the second, then added 6 in the fourth to finish one point short. The third quarter saw neither team score.",
      "Michigan's statistical profile was complicated by self-inflicted damage. The Wolverines committed 3 turnovers to Western Michigan's none, including 2 fumbles lost and 1 interception thrown. They also drew 9 penalties for 80 yards against Western Michigan's 5 penalties for 40 yards. Despite those issues, Michigan outgained Western Michigan 276 yards to 221, with a 170-to-89 edge in passing yards balanced against Western Michigan's 132-to-106 rushing advantage.",
      "Western Michigan controlled the game's tempo, holding the ball for 40 minutes and 8 seconds compared to Michigan's 19 minutes and 52 seconds. The Broncos also led in first downs (16 to 12) and converted 8 of 18 third-down attempts versus Michigan's 3 of 10. Both teams attempted one fourth-down conversion; Michigan converted it while Western Michigan did not."
    ],
    source: "Official match data",
    sourceUrl: null,
    publishedAt: "2026-09-05", updatedAt: null,
    image: null, video: null,
    articleMode: "performance", continuityKey: null,
    priority: "normal"
  },

  {
    id: "college-football-lsu-tigers-2026-09-06",
    sport: "americanfootball", league: "college-football", category: "game", status: "confirmed",
    headline: "LSU routs Clemson 51-10 in season opener",
    dek: "The Tigers dominated from the start, building a 44-3 lead through three quarters in the regular-season game on September 6.",
    summary: "LSU defeated Clemson 51-10 on September 6, 2026, scoring 44 points through the first three quarters of regular-season play.",
    body: [
      "LSU routed Clemson 51-10 in the regular season on September 6, with the Tigers establishing control early and maintaining it throughout. LSU led 17-3 after the first quarter, extended that advantage to 31-3 by halftime, and had built a 44-3 lead through three quarters before each team scored seven points in the fourth.",
      "The game saw LSU outscore Clemson in every period except the final quarter, with the home team's offense accounting for the bulk of the scoring in the opening three frames."
    ],
    source: "Official match data",
    sourceUrl: null,
    publishedAt: "2026-09-06", updatedAt: null,
    image: null, video: {"provider":"youtube","id":"G4EXb0jEpE4","title":"LSU Tigers vs. Clemson Tigers | Game Highlights | 2026 SEC Football","sourceName":"SEC","sourceUrl":"https://www.youtube.com/watch?v=G4EXb0jEpE4","official":false,"embeddable":true,"rightsStatus":"EMBED_ALLOWED"},
    articleMode: "performance", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nfl-mark-sanchez-to-plead-2026-09-06",
    sport: "americanfootball", league: "nfl", category: "league", status: "report",
    headline: "Mark Sanchez to plead guilty in Indianapolis assault case",
    dek: "The former NFL quarterback and current Fox broadcaster has agreed to enter a guilty plea in connection with an alleged 2025 incident involving a truck driver.",
    summary: "Mark Sanchez has agreed to plead guilty in an assault case stemming from an alleged attack on a truck driver in Indianapolis last year.",
    body: [
      "Mark Sanchez, the former NFL quarterback now working as a Fox Sports broadcaster, has agreed to plead guilty in connection with an alleged assault of a truck driver in Indianapolis, according to reporting.",
      "The incident occurred in 2025. Details regarding the specific charges, timeline for the guilty plea, or any potential sentencing have not been disclosed."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nfl/story/_/id/49818375/mark-sanchez-plans-plead-guilty-indianapolis-assault-case",
    publishedAt: "2026-09-06", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-manchester-united-2026-09-06",
    sport: "football", league: "epl", category: "injury", status: "report",
    headline: "Maguire suffers nose injury in early collision during Everton clash",
    dek: "Manchester United defender Harry Maguire was hurt in the opening minutes of Sunday's Premier League match against Everton after colliding with Thierno Barry.",
    summary: "Harry Maguire sustained a blow to the nose in an early collision with Everton's Thierno Barry during Manchester United's Premier League match on Sunday.",
    body: [
      "Manchester United defender Harry Maguire suffered a nose injury in the opening minutes of Sunday's Premier League fixture against Everton after a collision with Everton's Thierno Barry.",
      "According to reporting from the match, the injury occurred early in the encounter as United looked to secure a second consecutive league victory. The extent of the injury and whether Maguire continued playing was not immediately clear from available updates."
    ],
    source: "Yahoo Sports",
    sourceUrl: "https://sports.yahoo.com/articles/doesn-t-look-good-way-132000540.html",
    publishedAt: "2026-09-06", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-manchester-city-2026-09-06",
    sport: "football", league: "epl", category: "league", status: "report",
    headline: "Haaland reaches 300th club goal as Manchester City beat Coventry to maintain perfect start",
    dek: "Erling Haaland scored his 300th career club goal in Manchester City's 1-0 victory over Coventry City, a milestone that outpaces Kylian Mbappé in the race toward 300. City extended their unbeaten record at the top of the Premier League.",
    summary: "Erling Haaland scored his 300th club goal as Manchester City defeated Coventry City 1-0 to maintain their perfect start to the Premier League season.",
    body: [
      "Erling Haaland reached 300 club goals as Manchester City defeated Coventry City 1-0 on Sunday, extending the club's unbeaten run at the start of the Premier League season.",
      "The milestone places Haaland ahead of Kylian Mbappé in the race toward the 300-goal mark at club level. City remain at the top of the Premier League standings following the victory."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/soccer/story/_/id/49839417/erling-haaland-cristiano-ronaldo-kylian-mbappe-300-club-goals",
    publishedAt: "2026-09-06", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-de-zerbi-2026-09-06",
    sport: "football", league: "epl", category: "league", status: "report",
    headline: "De Zerbi unfazed by Spurs' goal drought despite third successive blank",
    dek: "Tottenham manager Roberto De Zerbi has dismissed concerns over his side's inability to score in three consecutive Premier League matches, suggesting the team's issues run deeper than finishing.",
    summary: "Roberto De Zerbi says Tottenham are making 'wrong' decisions despite going three Premier League games without a goal.",
    body: [
      "Tottenham manager Roberto De Zerbi has expressed a philosophical stance toward his side's recent goalscoring struggles, insisting he is not worried despite the team failing to register in three successive Premier League outings.",
      "The Spurs boss's comments suggest he views the root of the problem as tactical or decision-making related, rather than a lack of ability in the final third. De Zerbi's public confidence contrasts sharply with the club's form on the pitch, which has seen them enter a goal-scoring drought spanning multiple games."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/soccer/story/_/id/49837481/roberto-de-zerbi-spurs-nottingham-forest-premier-league-transfers",
    publishedAt: "2026-09-06", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "bundesliga-bayern-m-nchen-harry-kane-2026-09-06",
    sport: "football", league: "bundesliga", category: "league", status: "confirmed",
    headline: "Harry Kane two goals from Bundesliga century, eyes milestone against Schalke",
    dek: "The Bayern Munich striker stands at 98 Bundesliga goals across 95 appearances. A brace in the September 5 fixture could see him reach 100 goals faster than any player in the league's history.",
    summary: "Harry Kane is two goals short of 100 Bundesliga strikes and could reach the milestone in Bayern Munich's Matchday 2 fixture at Schalke on September 5.",
    body: [
      "Harry Kane is two goals away from a century of Bundesliga goals. The Bayern Munich striker has netted 98 times in 95 league appearances, and according to Bundesliga.com, a double against promoted Schalke on September 5 would see him reach three figures after only 96 games—33 fewer than Gerd Müller, the previous record holder.",
      "Kane's scoring rate in the Bundesliga is among the most prolific in history. Since arriving at Bayern in 2023, he has found the net once every 78.5 minutes, outpacing comparisons with Erling Haaland (87 minutes), Robert Lewandowski (100 minutes) and Müller (105 minutes). The England captain won the Torjägerkanone—the Bundesliga's top scorer award—three times already.",
      "Beyond the 100-goal mark, Kane's overall output for Bayern suggests further records could fall. He has scored 148 goals in 150 appearances for the club across all competitions, including 61 strikes in 51 games last season. Bundesliga.com noted that he could reach a double century of Bayern goals before the 2026/27 campaign ends."
    ],
    source: "Bundesliga.com",
    sourceUrl: "https://www.bundesliga.com/en/bundesliga/news/harry-kane-100-goals-record-stuttgart-schalke-38258",
    publishedAt: "2026-09-06", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-liverpool-2026-09-07",
    sport: "football", league: "epl", category: "match", status: "report",
    headline: "UEFA Champions League League Phase Schedule: September 2026 to January 2027",
    dek: "The Champions League league phase begins September 8 and runs through January 27, 2027, with 18 matchdays of regular-season fixtures featuring Europe's elite clubs competing for top-eight and playoff advancement spots.",
    summary: "Complete schedule for the 2026/27 UEFA Champions League league phase, from matchday 1 through the final matchday on January 27, 2027.",
    body: [
      "The UEFA Champions League's new league phase structure runs from September 8 through January 27, 2027. Unlike the traditional group stage, all participating clubs compete in a single standings, with the top eight teams advancing directly to the knockout round and positions 9 through 24 entering a playoff round to complete the Round of 16.",
      "Matchday 1 takes place on Tuesday, September 8, and includes headline fixtures such as Real Madrid against Inter, Liverpool against Atlético Madrid, and Napoli against Arsenal, among others.",
      "The schedule spans 18 matchdays across five months, with subsequent rounds scheduled for October 14, November 4, November 24, December 9, January 19, and January 27. Kick-off times are staggered, primarily at 12:45 p.m. and 3 p.m. (likely local European times), to manage simultaneous matches and maintain competitive balance across the league phase.",
      "The format represents a significant departure from the traditional group-stage model, consolidating all clubs into one unified competition table and altering the qualifying pathway to the knockout stages."
    ],
    source: "CBS Sports",
    sourceUrl: "https://www.cbssports.com/soccer/news/uefa-champions-league-schedule-real-madrid-inter-liverpool-atletico-madrid-matchday-1/",
    publishedAt: "2026-09-07", updatedAt: null,
    image: "assets/epl-liverpool-2026-09-07.webp", video: null,
    imageCredit: "UEFA®", imageSourceUrl: "https://www.uefa.com/uefachampionsleague/news/02a8-2174c9e9019d-f909a77bd77a-1000--2026-27-champions-league-all-the-league-phase-fixtures/", imageRights: null,
    articleMode: "reference", continuityKey: "epl:reference:uefa-champions-league-schedule-real:2026",
    priority: "normal"
  },

  {
    id: "nfl-giants-release-wide-receiver-2026-09-07",
    sport: "americanfootball", league: "nfl", category: "roster", status: "report",
    headline: "Giants release wide receiver Darius Slayton",
    dek: "The New York Giants have parted ways with Slayton, who had been the longest-tenured player on the roster.",
    summary: "The Giants released wide receiver Darius Slayton, their longest-tenured player, according to reporting.",
    body: [
      "The New York Giants have released wide receiver Darius Slayton, ending a seven-season run with the franchise. Slayton had been the longest-tenured player on the roster and will now become an unrestricted free agent.",
      "A fifth-round pick in 2018, Slayton recorded 296 receptions for 4,435 receiving yards and 22 touchdowns during his time in New York. He posted at least 500 receiving yards in six seasons and led the Giants in receiving four times.",
      "New York signed Slayton to a three-year, $36 million contract before last season, but the veteran receiver was due $13 million in 2026. His release creates just over $3 million in cap space for the Giants.",
      "Slayton's role became increasingly uncertain after the team added Darnell Mooney and Odell Beckham Jr., while Malik Nabers is working toward a Week 1 return and rookie Malachi Fields has impressed. The Giants had also explored a potential trade during final roster cuts, but Slayton's salary made a deal difficult.",
      "The 29-year-old is not subject to waivers because of his veteran status and is free to sign with another team immediately."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nfl/story/_/id/49862543/giants-release-wr-darius-slayton-team-longest-tenured-player",
    publishedAt: "2026-09-07", updatedAt: null,
    image: "assets/nfl-giants-release-wide-receiver-2026-09-07.jpg", video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "college-football-florida-state-seminoles-2026-09-07",
    sport: "americanfootball", league: "college-football", category: "game", status: "confirmed",
    headline: "SMU Tops Florida State 27-24 on the Road",
    dek: "The Mustangs improved to a perfect record in road contests with a three-point victory over the Seminoles at Doak Campbell Stadium.",
    summary: "SMU won 27-24 at Florida State in regular-season college football on September 7, 2026, behind a 430-yard passing performance.",
    body: [
      "SMU defeated Florida State 27-24 on the road in regular-season college football action, securing a three-point win at Doak Campbell Stadium in Tallahassee.",
      "The Mustangs' offense was led by their passing attack, which generated 430 yards and a pass efficiency of 0.72. SMU gained 585 total yards and 23 first downs. Florida State managed 324 total yards—125 passing and 199 rushing—with a pass efficiency of 0.52.",
      "The scoring was distributed evenly early: both teams scored 7 points in the first quarter. SMU pulled ahead 17-10 at halftime after outscoring Florida State 10-3 in the second quarter. Florida State cut into the lead with 7 points in the third quarter while SMU did not score, trimming the deficit. In the fourth quarter, both teams scored 10 points, but SMU's margin held.",
      "SMU converted 8 of 14 third-down attempts, while Florida State converted 2 of 15. The Mustangs committed 4 turnovers—2 interceptions and 2 lost fumbles—to Florida State's 1 lost fumble. SMU also drew 6 penalties for 47 yards compared to Florida State's 3 penalties for 27 yards. Florida State held possession longer at 32:16 to SMU's 27:44."
    ],
    source: "Official match data",
    sourceUrl: null,
    publishedAt: "2026-09-07", updatedAt: null,
    image: null, video: {"provider":"youtube","id":"hpqo7nFX7wg","title":"SMU vs. Florida State Highlights | 2026 ACC Football","sourceName":"ACC Digital Network","sourceUrl":"https://www.youtube.com/watch?v=hpqo7nFX7wg","official":false,"embeddable":true,"rightsStatus":"EMBED_ALLOWED"},
    articleMode: "performance", continuityKey: null,
    priority: "normal",
    gameResult: true
  },

  {
    id: "nfl-gonzalez-agrees-to-record-2026-09-08",
    sport: "americanfootball", league: "nfl", category: "contract", status: "report",
    headline: "Gonzalez agrees to record-breaking extension with Patriots",
    dek: "The cornerback has signed a four-year deal worth $135 million, becoming the highest-paid player at his position in NFL history.",
    summary: "Christian Gonzalez and the New England Patriots have agreed to a four-year, $135 million extension that makes Gonzalez the highest-paid cornerback in NFL history.",
    body: [
      "# Christian Gonzalez agrees to record $135M Patriots extension",
      "The New England Patriots have agreed to a four-year, $135 million extension with star cornerback Christian Gonzalez, according to ESPN.",
      "The deal includes $102 million guaranteed*and a $33 million signing bonus, making Gonzalez the highest-paid cornerback in NFL history at $33.75 million per year.",
      "The 24-year-old surpasses Devon Witherspoon, who signed a four-year, $132 million extension with Seattle last month.",
      "Gonzalez, the No. 17 pick in the 2023 NFL Draft, has developed into one of New England’s most important defensive players and has earned both Pro Bowl and All-Pro honors.",
      "The extension settles one of the Patriots’ biggest offseason storylines just before the start of the 2026 season."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nfl/story/_/id/49865736/sources-christian-gonzalez-patriots-reach-4-year-135m-deal",
    publishedAt: "2026-09-08", updatedAt: null,
    image: "assets/nfl-gonzalez-agrees-to-record-2026-09-08.jpg", video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal",
    featured: true
  },

  {
    id: "ucl-club-brugge-kv-2026-09-08",
    sport: "football", league: "ucl", category: "match", status: "confirmed",
    headline: "Aston Villa wins 3-2 at Club Brugge in Champions League opener",
    dek: "Aston Villa secured victory in the Champions League League Stage with a 3-2 away win over Club Brugge KV on September 8. The visitors overcame a dominant possession performance from the hosts to seal all three points.",
    summary: "Aston Villa won 3-2 away at Club Brugge KV in Champions League League Stage play, with superior finishing compensating for Brugge's 64% possession advantage.",
    body: [
      "Aston Villa beat Club Brugge KV 3-2 in the Champions League League Stage on September 8, winning by a single goal despite conceding possession to their hosts. Playing away from home, Villa converted their chances more efficiently than Brugge, whose control of the ball did not translate into goals.",
      "Aston Villa had 9 shots on target to Club Brugge's 7, and created 4 big chances compared to Brugge's 2. The visitors also generated a higher expected goals figure of 3 to 1.46. Club Brugge dominated possession at 64% to 36% and completed significantly more passes—602 to 338—but the Belgian side's 7 shots on target were not enough to prevent the defeat. Both teams received 3 yellow cards each; there were no red cards."
    ],
    source: "Official match data",
    sourceUrl: null,
    publishedAt: "2026-09-08", updatedAt: null,
    image: "assets/ucl-club-brugge-kv-2026-09-08-2.jpg", video: null,
    imageCredit: "m.iacobucci.tiscali.it", imageSourceUrl: "https://depositphotos.com/photos/aston-villa.html?filter=all&sh=75a2b7eac9b201b0b2775b19ff3ec4c6ebd101ea&qview=897282356", imageRights: "ID: 897282356",
    articleMode: "performance", continuityKey: null,
    priority: "normal",
    gameResult: true
  },

  {
    id: "epl-liverpool-2026-09-08",
    sport: "football", league: "epl", category: "contract", status: "report",
    headline: "Mac Allister signals he'll depart Liverpool to make room for Camara signing",
    dek: "The midfielder has confirmed Liverpool won't offer him a new contract, positioning himself as the likely departure needed to fund and accommodate a move for AS Monaco's Lamine Camara in 2027.",
    summary: "Alexis Mac Allister has indicated he will leave Liverpool after the club declined to offer him a contract extension, apparently clearing space for the club's pursuit of Lamine Camara.",
    body: [
      "Alexis Mac Allister has essentially confirmed his exit from Liverpool after revealing the club informed him it cannot offer a new contract. The midfielder, who arrived at Anfield at the same time as Ryan Gravenberch and Dominik Szoboszlai, has notably not received contract talks despite both teammates securing new deals.",
      "\"I received the news that the club wasn't in a position to offer me a new contract which makes me sad. The fans don't need to worry, I will give 100% until last day I'm here,\" Mac Allister said. The statement follows Liverpool's decision not to renew his terms, leaving him without a deal extension as the only senior midfielder in that position.",
      "According to reports, Liverpool's reluctance to extend Mac Allister stems from their interest in signing Lamine Camara from AS Monaco. Journalist Ben Jacobs reported that Liverpool contacted both Camara and Monaco on deadline day to signal an intention to move for the player in 2027. The club could not pursue that deal in 2026 because Mac Allister remained on the roster, and selling him would provide both the financial resources and free up a foreign player slot needed for Camara's arrival.",
      "Liverpool previously sold Curtis Jones to Inter Milan while he was entering the final year of his contract, with Jones similarly absent from new deal discussions before the transfer."
    ],
    source: "Yahoo Sports",
    sourceUrl: "https://sports.yahoo.com/articles/liverpool-star-confirms-hes-sacrifice-190500221.html",
    publishedAt: "2026-09-08", updatedAt: null,
    image: "assets/epl-liverpool-2026-09-08.jpg", video: null,
    imageCredit: "Musiu0  ID 872900836", imageSourceUrl: "https://depositphotos.com/editorial/madrid-spain-march-2026-liga-match-real-madrid-elche-played-872900836.html", imageRights: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "ucl-kylian-scores-as-ethan-2026-09-08",
    sport: "football", league: "ucl", category: "league", status: "report",
    headline: "Kylian scores as Ethan sent off in Mbappé brothers' contrasting Champions League nights",
    dek: "Kylian Mbappé netted in Real Madrid's win over Inter Milan while his younger brother Ethan was dismissed for Lille in a separate Champions League fixture on Tuesday.",
    summary: "Kylian Mbappé scored in Real Madrid's 2-0 Champions League win against Inter Milan on Tuesday; his brother Ethan, playing for Lille, was sent off in the 56th minute of his side's 3-2 home loss to Real Betis.",
    body: [
      "The Mbappé brothers made contrasting impacts in their Champions League fixtures on Tuesday. Kylian struck for Real Madrid in a 2-0 victory over Inter Milan, while Ethan was dismissed for Lille during a 3-2 home defeat to Real Betis.",
      "Kylian opened the scoring in the 14th minute with a first-time finish after winning possession deep in Inter's half. At 27 years old, the goal was his 71st in 99 Champions League appearances, moving him level with Real Madrid legend Raúl as the fifth all-time leading scorer in the competition.",
      "Ethan's evening at Lille began promisingly. The 22-year-old registered his first Champions League assist in the 12th minute with a left-footed cross to the far post for Japan forward Ayase Ueda, helping Lille into an early lead. However, his night ended in the 56th minute when he was sent off following a video review for raising his right elbow to the face of Betis defender Natan in an off-the-ball incident. It was Ethan's first red card across all competitions. Tuesday's fixture was only his third Champions League appearance and his second start.",
      "Both brothers are currently coached by an Ancelotti."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/soccer/story/_/id/49871988/kylian-ethan-mbappe-champions-league-goal-red-card-real-madrid-lille",
    publishedAt: "2026-09-08", updatedAt: null,
    image: "assets/ucl-kylian-scores-as-ethan-2026-09-08.jpg", video: null,
    imageCredit: "depositphotos®", imageSourceUrl: "https://depositphotos.com/editorial/san-sebastian-spain-september-2024-league-match-real-sociedad-real-747337942.html", imageRights: "Musiu0 ID 747337942",
    articleMode: "news", continuityKey: null,
    priority: "normal",
    featured: true
  },

  {
    id: "ucl-mcginn-reaches-villa-milestone-2026-09-08",
    sport: "football", league: "ucl", category: "match", status: "report",
    headline: "McGinn reaches Villa milestone in Champions League opener",
    dek: "Aston Villa's captain scored to become the club's all-time leading goalscorer in European competition as Villa defeated Club Brugge 3-2 in their opening UCL match.",
    summary: "John McGinn scored in Villa's 3-2 Champions League win at Club Brugge, becoming Aston Villa's all-time leading scorer in UEFA competitions with his 12th European goal.",
    body: [
      "Aston Villa opened their Champions League campaign with a 3-2 victory over Belgian champions Club Brugge, with captain John McGinn scoring in the 11th minute to mark a significant personal milestone. McGinn's curling left-footed shot from outside the area found the top corner beyond goalkeeper Yann Sommer, giving Villa an early lead.",
      "McGinn's goal was his 12th in European competition for Villa, surpassing Ollie Watkins' previous club record in UEFA competitions. Emiliano Buendía added a second for Villa shortly after, and Nicolas Jackson, who arrived from Chelsea this summer to replace Watkins, scored a third in the 43rd minute after Sommer ventured from his penalty area. Hugo Vetlesen equalized for Brugge in the 19th minute with a low left-footed strike, and Nicolo Tresoldi added a second from the penalty spot in the 61st.",
      "The victory came after Villa endured three consecutive games without a goal in their Premier League campaign. The club underwent significant changes over the summer, with Watkins, Morgan Rogers, Emiliano Martínez, Ezri Konsa and Youri Tielemans among several key departures following last season's Europa League title win."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/soccer/report/_/gameId/401915426",
    publishedAt: "2026-09-08", updatedAt: null,
    image: "assets/ucl-mcginn-reaches-villa-milestone-2026-09-08.jpg", video: null,
    imageCredit: "depositphotos", imageSourceUrl: "https://depositphotos.com/editorial/salzburg-austria-august-2026-john-mcginn-midfielders-aston-villa-2026-897282412.html", imageRights: "m.iacobucci.tiscali.it ID 897282412",
    articleMode: "performance", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nfl-sec-seeks-legal-authority-2026-09-08",
    sport: "americanfootball", league: "nfl", category: "roster", status: "report",
    headline: "SEC seeks legal authority to expel LSU in updated federal court filing",
    dek: "The conference claims it has the votes to remove the school, citing its rules against pro athletes returning to college sports. LSU coach Lane Kiffin's recruitment efforts are central to the dispute.",
    summary: "The SEC has filed updated legal language seeking authority to expel LSU over the school's attempts to roster players with professional contracts, according to a federal court filing.",
    body: [
      "The SEC is seeking legal authority to expel LSU, according to an updated federal court filing obtained by CBS Sports. The language is part of a legal suit first filed last week as the conference seeks to enforce rules prohibiting athletes with professional contracts from returning to college sports.",
      "In the filing, the SEC argues that association with LSU violates the conference's First Amendment rights. 'Forced association with a member whose conduct is antithetical to the SEC's mission and core values violates the Conference's fundamental First Amendment rights,' the filing states, adding that LSU has 'rejected those core values repeatedly and publicly.' The conference claims an injunction is necessary to prevent harm to the SEC's name, brand, and media properties.",
      "The dispute centers on LSU's effort to roster players Dae'Quan Wright and Zxavian Harris, both of whom have signed professional contracts. LSU did not include them on its roster for a game against Clemson on Saturday night, though a Louisiana judge previously granted a preliminary injunction clearing the way for them to play. The SEC's federal suit keeps their long-term eligibility uncertain. With two open spots on its roster, LSU could still add the duo at some point this season.",
      "LSU coach Lane Kiffin's public statements and recruitment efforts regarding professionally signed players feature prominently in the dispute. Kiffin's name appears 32 times in the SEC's 44-page filing, with numerous references to his public comments about his recruiting strategy."
    ],
    source: "CBS Sports",
    sourceUrl: "https://www.cbssports.com/college-football/news/sec-legal-authority-expel-lsu-court/",
    publishedAt: "2026-09-08", updatedAt: null,
    image: "assets/nfl-sec-seeks-legal-authority-2026-09-08.jpg", video: null,
    imageCredit: "depositphotos", imageSourceUrl: "https://depositphotos.com/editorial/baton-rouge-louisiana-usa-2020-tiger-stadium-popularly-known-death-369333198.html", imageRights: "mfmegevand ID 369333198",
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nba-grizzlies-2026-09-08",
    sport: "basketball", league: "nba", category: "trade", status: "report",
    headline: "Pelicans trade Hawkins and Peavy to Grizzlies for Johnson and Gibson",
    dek: "New Orleans has dealt guard Jordan Hawkins and forward Micah Peavy, along with draft compensation, to Memphis in a reported four-player swap.",
    summary: "The Pelicans have traded Jordan Hawkins, Micah Peavy, and future draft picks to the Grizzlies for AJ Johnson and Taj Gibson, according to reporting.",
    body: [
      "The Pelicans have traded Jordan Hawkins, Micah Peavy, a future second-round draft pick and a future second-round pick swap to the Grizzlies for AJ Johnson and Taj Gibson, according to ESPN reporting.",
      "The deal involves four players and draft assets moving between the two teams. Hawkins and Peavy depart New Orleans while Johnson and Gibson arrive in exchange."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nba/story/_/id/49868291/sources-pelicans-trade-jordan-hawkins-grizzlies-4-player-deal",
    publishedAt: "2026-09-08", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nfl-dallas-cowboys-2026-09-08",
    sport: "americanfootball", league: "nfl", category: "roster", status: "report",
    headline: "Jerry Jones says Cowboys have 'serious room financially' to pursue trades",
    dek: "After restructuring three veteran contracts last week, Dallas has generated over $19 million in cap space and signaled openness to moves before the 2026 season.",
    summary: "Cowboys owner Jerry Jones told 105.3 The Fan that the team has 'serious room financially' to make a trade following recent contract restructures.",
    body: [
      "Dallas Cowboys owner and general manager Jerry Jones said the team has created enough salary cap flexibility to pursue trades, according to remarks he made to 105.3 The Fan on Tuesday.",
      "The Cowboys restructured the contracts of defensive tackle Kenny Clark, cornerback DaRon Bland, and tight end Jake Ferguson last week, generating a little more than $19 million in salary cap room. Jones characterized that move as a signal of the team's financial readiness. 'That does show that we have really viable, serious room financially to make a trade if we wanted to right now,' Jones said. According to NFLPA figures, Dallas currently has $33.6 million in cap room, which would roll over to the 2027 cap if unused.",
      "Jones had previously indicated at the start of training camp that he would be willing to make a significant trade to strengthen the Cowboys' roster in 2026, even if it required trading away future draft picks. On Tuesday, he said general trade discussions have continued, though he noted that nothing is currently being negotiated."
    ],
    source: "ESPN",
    sourceUrl: "https://www.espn.com/nfl/story/_/id/49869284/cowboys-serious-financial-room-make-trade-says-jones",
    publishedAt: "2026-09-08", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "epl-liverpool-2026-09-08-2",
    sport: "football", league: "epl", category: "contract", status: "report",
    headline: "LIV Golf Files for Chapter 11 Bankruptcy, Owing Top Players $64 Million",
    dek: "The Saudi-backed golf league and roughly 50 affiliated entities have entered Chapter 11 protection while owing a combined $64.2 million to 27 creditors, with 14 of its own players among the largest unsecured debtors.",
    summary: "LIV Golf and affiliated entities filed for Chapter 11 bankruptcy, listing top players including Jon Rahm among creditors owed a combined $64.2 million.",
    body: [
      "LIV Golf New Jersey LLC and approximately 50 affiliated entities have filed for Chapter 11 bankruptcy protection in U.S. Bankruptcy Court. The filing allows the league to continue operating while a court-supervised restructuring determines how it will pay back creditors.",
      "According to the bankruptcy filing, 14 of LIV Golf's own players rank among its 30 largest unsecured debts. Two-time major champion Jon Rahm leads the creditor list, followed by Bryson DeChambeau ($5.77 million), Dustin Johnson ($5.49 million), Cameron Smith ($4.84 million), Adrian Meronk ($4.44 million), and Tyrell Hatton ($3.37 million). All are owed money under their player contracts with the tour. The 27 named creditors with specified amounts are collectively owed $64.2 million.",
      "Beyond player contracts, other creditors include IMG Media, owed $3.2 million as a vendor, and the United Nations refugee agency, listed as owed $1.72 million under a grant agreement, though LIV disputes that claim. Three additional creditors, including the rival Premier Golf League concept that predated LIV's launch, appear on the filing with undetermined dollar amounts because those debts are tied to ongoing lawsuits.",
      "The restructuring plan could potentially settle some player debts through ownership stakes rather than direct cash payments, though details remain unclear as the bankruptcy process unfolds."
    ],
    source: "Yahoo Sports",
    sourceUrl: "https://sports.yahoo.com/articles/liv-golf-owes-top-players-220257189.html",
    publishedAt: "2026-09-08", updatedAt: null,
    image: null, video: null,
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "college-football-college-football-playoff-opens-2026-09-08",
    sport: "americanfootball", league: "college-football", category: "league", status: "report",
    headline: "College Football Playoff opens 30-day window to negotiate 24-team expansion with ESPN",
    dek: "The CFP has triggered an exclusive negotiating period with ESPN to explore media rights for a potential 24-team field, with a formal Dec. 1 deadline to decide whether to expand for the 2027 season.",
    summary: "The College Football Playoff announced a 30-day negotiating window with ESPN to discuss financial terms for potential expansion to 24 teams, ahead of a Dec. 1 deadline for a decision on 2027 changes.",
    body: [
      "The College Football Playoff triggered a 30-day exclusive negotiating window with ESPN on Tuesday to explore media rights and financial considerations for a potential 24-team field. The announcement represents an initial step toward evaluating expansion, though the CFP clarified the move does not constitute a commitment to expand.",
      "The mandatory negotiating period will allow ESPN to present firm offers to the CFP. If no agreement is reached, the playoff field will remain at 12 teams for the 2027 season. The CFP has set a formal deadline of Dec. 1 to decide whether expansion will take effect in 2027.",
      "Conference preferences on expansion remain divided. The Big Ten, ACC, and Big 12 have all advocated for a 24-team format, while the SEC has maintained support for a 16-team field. The SEC's commissioner has cited models suggesting his conference would see only marginal financial benefit from a 24-team playoff. Scheduling complications, particularly the potential elimination of conference championship games—which remain substantial revenue generators for conferences—remain a key consideration in the expansion debate.",
      "The CFP noted it may also explore offers from other media companies during or after the 30-day window with ESPN, allowing it to evaluate multiple options before the December deadline."
    ],
    source: "CBS Sports",
    sourceUrl: "https://www.cbssports.com/college-football/news/college-football-playoff-expansion-negotiating-window/",
    publishedAt: "2026-09-08", updatedAt: null,
    image: "assets/college-football-college-football-playoff-opens-2026-09-08.jpg", video: null,
    imageCredit: "Depositphotos®", imageSourceUrl: "https://depositphotos.com/editorial/february-15-2020-brazil-in-this-photo-illustration-the-national-collegiate-athletic-association-ncaa-website-344773882.html", imageRights: "rafapress ID 344773882",
    articleMode: "news", continuityKey: null,
    priority: "normal"
  },

  {
    id: "nfl-seattle-seahawks-2026-09-10",
    sport: "americanfootball", league: "nfl", category: "game", status: "confirmed",
    headline: "Seahawks outlast Patriots 13-10 in fourth-quarter surge",
    dek: "Seattle scored 10 unanswered points in the fourth quarter to defeat New England at home. The Seahawks improved their efficiency in the final period after a tightly contested first three quarters.",
    summary: "Seattle Seahawks 13, New England Patriots 10 — Seahawks win on September 10, 2026.",
    body: [
      "The Seattle Seahawks beat the New England Patriots 13-10 at Lumen Field, winning a low-scoring contest defined by a scoreless first quarter and a decisive fourth-quarter push. The Seahawks scored 10 points in the final period to claim victory by a 3-point margin.",
      "The Patriots took an early lead, scoring 7 points in the second quarter to reach halftime with the advantage. Seattle responded with 3 points in the third quarter, and New England matched that with 3 more to keep the game competitive entering the fourth. The Seahawks then outscored the Patriots 10-0 in the final frame to secure the win.",
      "Seattle finished with 285 total yards, outpacing New England's 277. The Seahawks completed 17 of 24 passes for 188 yards and a pass efficiency rating of 0.71, while the Patriots completed 23 of 33 passes for 168 yards and a rating of 0.70. New England rushed for 109 yards on 31 attempts; Seattle managed 97 yards on 22 rushes. The Patriots committed three turnovers to Seattle's zero, but the Seahawks were penalized more frequently with 10 penalties for 98 yards compared to seven penalties for 50 yards for New England."
    ],
    source: "Official match data",
    sourceUrl: null,
    publishedAt: "2026-09-10", updatedAt: null,
    image: null, video: null,
    articleMode: "performance", continuityKey: null,
    priority: "normal",
    gameResult: true
  },

  {
    id: "laliga-fc-barcelona-2026-09-10",
    sport: "football", league: "laliga", category: "league", status: "report",
    headline: "Deco explains Gordon preference over Rashford as Barcelona reinforces squad",
    dek: "Barcelona's sporting director has outlined why the club chose to sign Anthony Gordon from Newcastle rather than make Marcus Rashford's loan permanent, citing stylistic fit with head coach Hansi Flick's system.",
    summary: "Deco says Gordon's playing style aligns better with Barcelona's tactical approach than Rashford's did, explaining the club's summer transfer strategy.",
    body: [
      "Barcelona sporting director Deco has clarified the club's decision to pursue Anthony Gordon instead of retaining Marcus Rashford ahead of the 2026/27 season. In an interview with Catalan radio station RAC1, Deco said Gordon's style of play matched the requirements of head coach Hansi Flick more closely than the England forward's did.",
      "Rashford spent last season on loan at Barcelona, scoring 14 goals across all competitions as the club won La Liga and the Copa del Rey. Barcelona held the option to sign him permanently for £30.3m (35 million euros) but chose not to exercise it, allowing the Manchester United forward to return to Old Trafford. Gordon joined from Newcastle United in a deal worth over 80 million euros, making him one of Barcelona's two most expensive signings alongside Manchester City midfielder Rodri.",
      "Deco praised Rashford's contributions while explaining the rationale for the shift. \"We are extremely grateful to Rashford,\" he said. \"He contributed a lot last season, but our idea of play is much more linked to Anthony's. His style fits with what the coach is looking for.\" Gordon, 25, has made an early impression since his arrival, laying on five assists in his opening five matches, though he is yet to score.",
      "Both Gordon and Rodri were brought in to address specific weaknesses in the squad, according to Deco, as Barcelona continued their rebuild following a successful 2025/26 campaign."
    ],
    source: "BBC Sport",
    sourceUrl: "https://www.bbc.co.uk/sport/football/articles/clyl7njnk46o?at_medium=RSS&at_campaign=rss",
    publishedAt: "2026-09-10", updatedAt: null,
    image: "assets/laliga-fc-barcelona-2026-09-10.jpg", video: null,
    imageCredit: "Depositphotos", imageSourceUrl: "https://depositphotos.com/editorial/anthony-gordon-newcastle-united-arrives-carabao-cup-quarter-final-match-856778834.html", imageRights: "856778834",
    articleMode: "news", continuityKey: null,
    priority: "normal",
    featured: true
  }
];
