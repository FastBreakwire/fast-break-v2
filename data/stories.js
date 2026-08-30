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
 *     publishedAt, // YYYY-MM-DD
 *     updatedAt,   // YYYY-MM-DD, ONLY when a real update time is known
 *     image,       // Fast Break-owned asset path, or null. Never hotlinked,
 *                  // never a stand-in.
 *     video,       // local MP4 path or null
 *     featured,    // NOT what selects the Big Story, and never a pin. The
 *                  // homepage ranks each league by freshness — a recency
 *                  // decay with priority as a weight — and gives the Big
 *                  // Story slot to whatever comes first, so the lead updates
 *                  // itself as stories are added. The renderer does not read
 *                  // this field at all.
 *                  // It is kept as an editorial annotation recording which
 *                  // story held the lead when the file was last edited, one
 *                  // per league. It can go stale as stories age; that is
 *                  // cosmetic and cannot affect what the page shows.
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
    featured: true,
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
  /* ---------------------------------------------------------------- WNBA */
  {
    id: 'wnba-bonner-dream-2026-08-27',
    featured: true,
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
  /* ----------------------------------------------------------------- NFL */
  {
    id: 'nfl-seahawks-sale-2026-08-26',
    featured: true,
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
    sport: 'football', league: 'epl', category: 'transfer', status: 'scheduled',
    headline: 'Premier League window shuts at 11pm on 1 September',
    dek: 'Three days left in a window that opened on 15 June.',
    summary: 'Clubs have until Tuesday night UK time to complete their business.',
    body: [
      'The Premier League summer transfer window closes at 11pm UK time on Tuesday 1 September. It opened on 15 June, an unusually long run shaped around the summer World Cup.',
      'Business is still moving as it closes. Chelsea have agreed terms with Aston Villa for Emiliano Martinez, Tottenham have taken Omar Marmoush on loan from Manchester City with an obligation to buy, and Nottingham Forest have completed a club-record deal for Liam Delap. Anything not filed by 11pm waits until January.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/soccer/story/_/id/48944912/premier-league-efl-summer-transfer-window-2026-dates-does-open-deadline-day',
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null,
    priority: 'low'
  },

  {
    id: 'epl-barcola-liverpool-2026-08-29',
    featured: true,
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
    sport: 'football', league: 'epl', category: 'transfer', status: 'report',
    headline: 'Enzo Fernández agrees personal terms with Manchester City',
    dek: 'A verbal agreement on the player’s side. City have not yet made a bid, and the fee is Chelsea’s call.',
    summary: 'Fabrizio Romano reports terms agreed. Chelsea are expected to ask for around £130m with three days of the window left.',
    body: [
      'Enzo Fernández has a verbal agreement with Manchester City on personal terms, according to Fabrizio Romano. The transfer itself is some way from done.',
      'City have not submitted an official bid and concrete club-to-club negotiations have not taken place. Contact is expected shortly, but the decision on price sits with Chelsea, who are understood to want more than the £120 million originally attached to the midfielder and are likely to ask for around £130 million.',
      'The push is coming from City manager Enzo Maresca, who coached Fernández at Stamford Bridge and wants to work with the 25-year-old Argentina international again.',
      'Fernández’s position at Chelsea has weakened since the season began — manager Xabi Alonso left him out of the matchday squad for the Carabao Cup win over Luton Town. With the window closing on Tuesday 1 September, there is very little time for a deal of this size to be built from scratch.'
    ],
    source: 'Yahoo Sports',
    sourceUrl: 'https://sports.yahoo.com/articles/enzo-fernandez-agrees-terms-man-062512514.html',
    publishedAt: '2026-08-29', updatedAt: null,
    image: 'assets/enzo.jpg', video: null,
    priority: 'normal'
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
  /* --------------------------------------------------------------- LA LIGA */
  {
    id: 'laliga-madrid-sociedad-2026-08-26',
    featured: true,
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
  /* ------------------------------------------------------------ BUNDESLIGA */
  {
    id: 'bundesliga-elversberg-leverkusen-2026-08-29',
    featured: true,
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
  }
];
