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
 *     featured     // optional. true = this league's Big Story on the homepage.
 *                  // PRESENTATION ONLY — it does not change article depth.
 *                  // Keep it to ONE story per league; the renderer uses the
 *                  // first it finds and warns in the console about extras.
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
 *
 * Loaded as a classic script before the main bundle, so it works over file://
 * as well as from a server.
 */

// ===========================================================================
// CENTRAL STORY DATA — single source of truth for every rendered story
// ---------------------------------------------------------------------------
// Re-researched and re-verified 29 Aug 2026. Every story below carries a real
// article body and a source URL that returned 200 on the day of publication.
// The NBA stories were migrated out of the old static Q1-Q4 markup in
// index.html so that NBA runs through the same Latest / Big Story / Story View
// path as every other league.
// ===========================================================================
window.FB_STORIES = [

  /* ----------------------------------------------------------------- NBA */
  {
    id: 'nba-derozan-nuggets-2026-08-21',
    featured: true,
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
    image: null, video: null
  },
  {
    id: 'nba-curry-extension-window-2026-08-29',
    sport: 'basketball', league: 'nba', category: 'contract', status: 'report',
    headline: 'Curry becomes eligible for a two-year, $136.7m Warriors extension',
    dek: 'Golden State can put the offer on the table from Saturday. Nothing has been signed.',
    summary: 'The extension would run through the 2028-29 season and take Curry to his age-40 year. It has not been signed.',
    body: [
      'Saturday, 29 August is the first day Stephen Curry can sign a maximum contract extension with the Golden State Warriors. The deal available to him is two years and roughly $136.7 million, which would keep him under contract through the 2028-29 season and his age-40 year.',
      'Curry, 38, is entering his 18th season and the final year of a contract worth close to $63 million. No extension has been signed.',
      'The Warriors have made their position public. General manager Mike Dunleavy has said repeatedly over the past year that the club wants another deal done before the season begins, and that he is "pretty confident Steph will finish his career" in Golden State.',
      'Not everyone agrees on the timing. ESPN’s Brian Windhorst has argued Curry would be better served waiting rather than signing this summer.'
    ],
    source: 'HoopsHype',
    sourceUrl: 'https://www.hoopshype.com/story/sports/nba/2026/08/28/stephen-curry-becomes-eligible-for-max-warriors-extension-saturday/91504446007/',
    publishedAt: '2026-08-29', updatedAt: null,
    image: null, video: null
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
    image: null, video: null
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
    image: null, video: null
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
      'The inquiry has since broadened to cover additional expenses the Clippers may have covered for Leonard, along with a second endorsement agreement that was never disclosed — reported as a multimillion-dollar arrangement with Daktronics. Commissioner Adam Silver has said the investigation needs to be wrapped up before next season, and the NBA has said its outside counsel expects to finalise its work in the coming weeks.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nba/story/_/id/49317499/clippers-raptors-trade-involving-kawhi-leonard-hold-amid-probe',
    publishedAt: '2026-08-14', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'nba-westbrook-retires-2026-08-12',
    sport: 'basketball', league: 'nba', category: 'league', status: 'confirmed',
    headline: 'Russell Westbrook retires as the NBA’s triple-double leader',
    dek: 'Eighteen seasons, 209 triple-doubles and the only full-season triple-double average since Oscar Robertson.',
    summary: 'Westbrook announced his retirement on social media, ending a career that reset the league’s triple-double record.',
    body: [
      'Russell Westbrook has announced his retirement after 18 NBA seasons, confirming the decision on social media.',
      'He leaves as the league’s all-time leader in triple-doubles with 209, a record he built at a pace no one has matched. Forty-two of them came in the 2016-17 season alone.',
      'That year remains the centrepiece of his career. Westbrook was named MVP after averaging 31.6 points, 10.7 rebounds and 10.4 assists, becoming the first player since Oscar Robertson in 1961-62 to average a triple-double across a full season.',
      'A nine-time All-Star, he finishes fifth on the all-time assists list with 10,351 and 14th in career scoring with 27,176 points. He spent his first 11 seasons with the Oklahoma City Thunder and played last season for the Sacramento Kings.'
    ],
    source: 'NBA.com',
    sourceUrl: 'https://www.nba.com/news/russell-westbrook-retires-nba-after-18-seasons',
    publishedAt: '2026-08-12', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'nba-lakers-sale-2026-08-12',
    sport: 'basketball', league: 'nba', category: 'league', status: 'confirmed',
    headline: 'Lakers sold to Josh Kushner and Bob Iger for a record $12.5bn',
    dek: 'The largest price ever paid for a sports franchise, a year after Mark Walter took control of the club.',
    summary: 'A group led by Thrive Capital founder Josh Kushner and former Disney chief executive Bob Iger is buying the franchise.',
    body: [
      'The Los Angeles Lakers are being sold to a group led by Josh Kushner and Bob Iger for $12.5 billion, a record price for a sports franchise.',
      'The seller is Mark Walter, who bought a controlling interest in the Lakers from the Buss family only last year at a valuation of roughly $10 billion — itself a record at the time.',
      'Kushner is the founder of the venture firm Thrive Capital, a co-founder of Oscar Health and a minority owner of the Miami Heat. Iger was chief executive of the Walt Disney Company from 2005 to 2020 and again from 2022 to 2026.',
      'Both men had been involved in the NBA’s Las Vegas expansion process before pivoting to make an offer for the Lakers.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/nba/story/_/id/49590362/josh-kushner-bob-iger-buy-lakers-12b',
    publishedAt: '2026-08-12', updatedAt: null,
    image: null, video: null
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
    image: null, video: null
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
      'Atlanta have clinched a playoff berth and now add a two-time champion to a roster that includes Angel Reese but has been short on depth.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/wnba/story/_/id/49735947/sources-dewanna-bonner-signing-dream-mercury-buyout',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
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
    image: 'assets/wnba-playoffs-bracket.jpg', video: null
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
    image: null, video: null
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
      'Seattle are the reigning champions, having beaten the New England Patriots 29-13 in February for the second Super Bowl title in franchise history.',
      '"How often do you get to buy a franchise that just won the Super Bowl? We are incredibly lucky and humbled by this gift," Vinod Khosla said. Asked about the task ahead, he was brief: "Keep the winning streak alive. Get another Super Bowl."'
    ],
    source: 'NFL.com',
    sourceUrl: 'https://www.nfl.com/news/nfl-owners-approve-sale-seattle-seahawks-khosla-family',
    publishedAt: '2026-08-26', updatedAt: null,
    image: null, video: null
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
    image: null, video: null
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
    image: null, video: null
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
    image: null, video: null
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
    image: null, video: null
  },

  /* -------------------------------------------------------- PREMIER LEAGUE */
  {
    id: 'epl-delap-forest-2026-08-27',
    featured: true,
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
    image: null, video: null
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
    image: null, video: null
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
    image: null, video: null
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
    image: null, video: null
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
    image: null, video: null
  },
  {
    id: 'epl-window-deadline-2026-08-28',
    sport: 'football', league: 'epl', category: 'transfer', status: 'scheduled',
    headline: 'Premier League window shuts at 11pm on 1 September',
    dek: 'Three days left in a window that opened on 15 June.',
    summary: 'Clubs have until Tuesday night UK time to complete their business.',
    body: [
      'The Premier League summer transfer window closes at 11pm UK time on Tuesday 1 September.',
      'The window opened on 15 June, giving clubs an unusually long run at their squads, and closes with several deals still outstanding across the division.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/soccer/story/_/id/48944912/premier-league-efl-summer-transfer-window-2026-dates-does-open-deadline-day',
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null
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
    image: null, video: null
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
    image: null, video: null
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
      'Leverkusen responded through Patrik Schick, who turned in at the near post after a deflection off Maza, and Christian Kofane pulled the second back late on after a Boniface header came off the post. It was not enough.',
      'Elversberg came up from the 2. Bundesliga this summer.'
    ],
    source: 'sport.de',
    sourceUrl: 'https://www.sport.de/fussball/deutschland-bundesliga/ma12193711/sv-07-elversberg_bayer-leverkusen/liveticker/',
    publishedAt: '2026-08-29', updatedAt: null,
    image: null, video: null
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
    image: null, video: null
  },
  {
    id: 'bundesliga-augsburg-seol-2026-08-27',
    sport: 'football', league: 'bundesliga', category: 'transfer', status: 'confirmed',
    headline: 'Augsburg sign South Korea international Youngwoo Seol until 2030',
    dek: 'The wing-back arrives from Red Star Belgrade as the club’s eighth signing of the window.',
    summary: 'Kicker reports a fee of €3.75m plus bonuses, with Red Star retaining a 5% sell-on clause.',
    body: [
      'FC Augsburg have signed Youngwoo Seol from Red Star Belgrade on a contract running to 2030. The 27-year-old wing-back will wear the number 7 shirt and is Augsburg’s eighth signing of the summer window.',
      'Kicker reports that Augsburg will pay €3.75 million plus potential bonuses, with Red Star also understood to have secured a five percent sell-on clause.',
      'Seol joined Red Star in 2024 and made 101 appearances for the Serbian club, winning two Serbian SuperLiga titles and two Serbian Cups.',
      'A 37-time international, he started all three of South Korea’s matches at the 2026 World Cup. He becomes the fourth South Korean to play for Augsburg, after Ja-Cheol Koo, Dong-Won Ji and Jeong-Ho Hong.'
    ],
    source: 'Bundesliga.com',
    sourceUrl: 'https://www.bundesliga.com/en/bundesliga/news/augsburg-sign-seol-young-woo-red-star-belgrade-38811',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  }
];
