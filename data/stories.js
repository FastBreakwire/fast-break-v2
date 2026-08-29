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
 *     category,    // US sports: signing | results | roster | contract |
 *                  //            legal | league | standings
 *                  // football : transfer | match | injury | manager |
 *                  //            contract | league
 *                  // never use NBA transaction words (trade, waiver) for football
 *     status,      // confirmed | report | scheduled
 *     headline,
 *     dek,         // one-sentence lead shown under the headline. null if none.
 *     summary,     // card text. Keep it short — the card has little room.
 *     body,        // ARRAY of paragraph strings. [] when the verified source
 *                  // material does not support an article yet. Never one big
 *                  // HTML string.
 *     source,      // outlet, plus "(official)" when it is a club/league release
 *     sourceUrl,   // verified link to the original. null if not verified.
 *     publishedAt, // YYYY-MM-DD
 *     updatedAt,   // YYYY-MM-DD, ONLY when a real update time is known
 *     image,       // URL or null — never a stand-in
 *     video,       // local MP4 path or null
 *     featured     // optional. true = this league's Big Story on the homepage.
 *                  // Keep it to ONE story per league; the renderer uses the
 *                  // first it finds and warns in the console about extras.
 *   }
 *
 * Rules that keep the feed trustworthy:
 *   - status "confirmed" means official or on the record; single-insider
 *     reporting is "report"; anything not yet played is "scheduled".
 *   - `body` carries only what the cited source actually supports. No invented
 *     quotes, figures, background or timestamps. If the material runs out the
 *     article is short — that is the correct outcome for a wire.
 *   - image/video stay null unless a rights-cleared asset exists.
 *   - sourceUrl is a link that was actually checked. Never guessed.
 *   - updatedAt stays null unless a genuine update time is known.
 *
 * Loaded as a classic script before the main bundle, so it works over file://
 * as well as from a server.
 */

// ===========================================================================
// CENTRAL STORY DATA — single source of truth for every rendered story
// ---------------------------------------------------------------------------
// Researched and verified 28 Aug 2026 against the 48-hour window
// (26-28 Aug 2026). Five stories carry full articles and verified source
// links; the rest carry verified headline/dek/summary with body: [] until
// their source material is re-checked.
// ===========================================================================
window.FB_STORIES = [

  /* ---------------------------------------------------------------- WNBA */
  {
    id: 'wnba-bonner-dream-2026-08-27',
    featured: true,
    sport: 'basketball', league: 'wnba', category: 'signing', status: 'confirmed',
    headline: 'Atlanta Dream sign DeWanna Bonner for the rest of the season',
    dek: 'The 17-year veteran joins a playoff-bound Atlanta side on a prorated maximum deal, days after a buyout with Phoenix freed her to chase one more title.',
    summary: 'The Dream added the two-time WNBA champion and six-time All-Star on a rest-of-season contract, the club announced.',
    body: [
      'The Atlanta Dream have signed DeWanna Bonner to a rest-of-season contract, the club announced on Thursday. The deal covers the remainder of the 2026 season and the playoffs.',
      'Bonner arrives in her 17th WNBA season as a two-time champion, a six-time All-Star and a two-time All-WNBA selection. She is the only three-time Sixth Player of the Year in league history, winning the award in 2009, 2010 and 2011. She ranks third all-time in career points and fifth in career rebounds.',
      'The move follows a buyout with the Phoenix Mercury, the franchise that drafted her in 2009 and where she spent most of her career. Phoenix were eliminated from playoff contention on 22 August, and general manager Nick U\u2019Ren said the club worked out the buyout so Bonner could chase a title in what could be her final postseason. She cleared waivers on Wednesday evening.',
      '"At this stage of my career, I don\u2019t know what the future holds, but I\u2019m grateful to the Mercury for giving me the opportunity to play in what could be one of my final postseason opportunities," Bonner said in a statement.',
      'ESPN reported the contract is at the prorated maximum, roughly $116,000, and that the Las Vegas Aces and New York Liberty were also in the running. Bonner averaged 10.6 points, 6.1 rebounds, 1.5 assists and 1.2 steals for Phoenix this season, starting 26 of 37 games.',
      'Atlanta have already clinched a fourth consecutive playoff berth. Their starting five of Jordin Canada, Allisha Gray, Rhyne Howard, Naz Hillmon and Angel Reese has been among the league\u2019s strongest, with Howard, Gray and Reese all named 2026 All-Stars. The bench has been thinner: Atlanta average 17.2 points from substitutes, second-fewest in the league, and have been without Brionna Jones since a left leg injury on 13 August.'
    ],
    source: 'WNBA.com (club announcement) / ESPN',
    sourceUrl: 'https://www.wnba.com/news/atlanta-dream-sign-dewanna-bonner',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'wnba-playoff-race-2026-08-27',
    sport: 'basketball', league: 'wnba', category: 'standings', status: 'confirmed',
    headline: 'Playoff seeding still open as Valkyries visit the Liberty',
    dek: 'Golden State sit second, New York hold the sixth seed, and Phoenix are already out.',
    summary: 'Golden State sit second at 27-11, New York hold the sixth seed at 23-15, and Phoenix are already eliminated at 13-25.',
    body: [],
    source: 'The Big Lead', sourceUrl: null,
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'wnba-aug26-results-2026-08-26',
    sport: 'basketball', league: 'wnba', category: 'results', status: 'confirmed',
    headline: 'Mystics beat Mercury 94-84; Valkyries see off the Sun 80-66',
    dek: 'Two second straight wins on the same night, with Sonia Citron leading Washington.',
    summary: 'Washington took a second straight win behind 19 points from Sonia Citron, while Golden State also made it two in a row against Connecticut.',
    body: [],
    source: 'The Big Lead', sourceUrl: null,
    publishedAt: '2026-08-26', updatedAt: null,
    image: null, video: null
  },

  /* ----------------------------------------------------------------- NFL */
  {
    id: 'nfl-seahawks-sale-2026-08-26',
    featured: true,
    sport: 'americanfootball', league: 'nfl', category: 'league', status: 'confirmed',
    headline: 'NFL owners unanimously approve record $9.612bn Seahawks sale to the Khosla family',
    dek: 'The first ownership change in Seattle in nearly 30 years, and the largest transaction in league history.',
    summary: 'Commissioner Roger Goodell announced the unanimous vote approving the transfer of the franchise from the Paul G. Allen estate to a group led by Vinod and Neeru Khosla.',
    body: [
      'NFL owners voted unanimously on Wednesday to approve the sale of the Seattle Seahawks to the Khosla family, commissioner Roger Goodell announced after a special one-day league meeting in Atlanta. At $9.612 billion it is the largest ownership transaction in league history.',
      'The Khosla family entered into a formal sale agreement with the Paul G. Allen estate on 11 July. The estate had announced on 18 February that it was beginning the process of selling the team. The sale was in accordance with the wishes of Allen, the Microsoft co-founder who died in 2018 and whose sister Jody had overseen the franchise since.',
      'The buying group is led by Vinod Khosla, co-founder of Sun Microsystems and founder of the venture firm Khosla Ventures, alongside his wife Neeru \u2014 announced by the league as the franchise\u2019s principal owner \u2014 and their son Neal. The family must relinquish the 3.1% stake in the San Francisco 49ers that Vinod Khosla bought in 2025.',
      'Goodell pointed to that existing NFL experience as part of the appeal. "They know our league well," he said. "They have been ownership in the NFC West with the San Francisco 49ers. They understand the passion of the NFL, they understand the 12s, they understand this Seattle community."',
      'Seattle are the reigning champions, having beaten the New England Patriots 29-13 in February for the second Super Bowl title in franchise history. Goodell joked that the incoming owners had shown "great timing".',
      '"How often do you get to buy a franchise that just won the Super Bowl?" Vinod Khosla said. "We are incredibly lucky and humbled by this gift, I would say, from the Allen trust." He said the group intends to take a long-term approach and lean on existing management: "The task ahead is actually pretty simple. Keep the winning streak alive."'
    ],
    source: 'NFL.com / ESPN',
    sourceUrl: 'https://www.nfl.com/news/nfl-owners-approve-sale-seattle-seahawks-khosla-family',
    publishedAt: '2026-08-26', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'nfl-jacobs-charges-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'legal', status: 'confirmed',
    headline: 'Packers running back Josh Jacobs charged with two misdemeanours',
    dek: 'The Brown County District Attorney filed the charges over a May arrest; the earlier felony count was not pursued.',
    summary: 'Misdemeanour battery and criminal damage to property charges were filed. The Packers said they will cooperate with the NFL.',
    body: [],
    source: 'ESPN / NFL.com (Wisconsin court records)', sourceUrl: null,
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'nfl-watson-starter-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'roster', status: 'confirmed',
    headline: 'Browns name Deshaun Watson their 2026 starting quarterback',
    dek: 'Cleveland confirmed the decision despite a modest preseason showing.',
    summary: 'Watson sat out Thursday\u2019s game against New England, as did backup Shedeur Sanders.',
    body: [],
    source: 'Pro Football Rumors / Yahoo Sports', sourceUrl: null,
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'nfl-leonard-williams-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'contract', status: 'report',
    headline: 'Seahawks and Leonard Williams agree three-year, $90M extension',
    dek: 'Reported by NFL Network, not yet announced by the club.',
    summary: 'NFL Network insider Ian Rapoport reports $56M guaranteed, keeping the defensive tackle in Seattle through 2029.',
    body: [],
    source: 'NFL Network (Ian Rapoport)', sourceUrl: null,
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'nfl-cutdown-deadline-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'roster', status: 'scheduled',
    headline: 'All 32 teams must reach the 53-man limit by Sunday',
    dek: 'Rosters drop from 90 to 53 on 30 August, and the waiver wire opens immediately after.',
    summary: 'Preseason Week 3 closes on 29 August; waived players hit the wire in reverse order of last season\u2019s records.',
    body: [],
    source: 'NFL.com / NBC Sports', sourceUrl: null,
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  },

  /* -------------------------------------------------------- PREMIER LEAGUE */
  {
    id: 'epl-delap-forest-2026-08-27',
    featured: true,
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Nottingham Forest sign Liam Delap from Chelsea in club-record deal',
    dek: 'A five-year contract at the City Ground ends a single season at Stamford Bridge that produced three goals in 47 games.',
    summary: 'Both clubs confirmed the permanent transfer. The deal is worth an initial \u00a345m, rising to \u00a350m with add-ons \u2014 a Forest record.',
    body: [
      'Nottingham Forest have signed Liam Delap from Chelsea, both clubs confirmed. The deal is worth an initial \u00a345m with a further \u00a35m in add-ons, making it a Forest club record. The 23-year-old striker has signed a five-year contract at the City Ground.',
      'It ends a single season at Stamford Bridge. Chelsea signed Delap from Ipswich Town last summer for \u00a330m after he scored 12 Premier League goals in his debut top-flight campaign, but he managed three goals in 47 appearances across four competitions. He was part of the squad that won the FIFA Club World Cup, featuring in six of seven games.',
      'The fee means Chelsea stand to make up to \u00a320m on the player. Forest\u2019s previous record was the \u00a337.5m paid for Omari Hutchinson in August 2025.',
      '"I really can\u2019t wait to get started, this is a massive club with a big history," Delap said in a statement to club media. "I spoke to the manager and I like his way, I think he can be the one to really help me develop and make that next step and hopefully I can bring goals here."',
      'Sky Sports reported interest from several other Premier League clubs, including Everton, before Forest secured the signing. Forest lost their opening fixture to Leeds United.'
    ],
    source: 'ESPN / Chelsea FC (official)',
    sourceUrl: 'https://www.espn.com/soccer/story/_/id/49740097/nottingham-forest-confirm-transfer-liam-delap-chelsea',
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'epl-riad-acl-2026-08-28',
    sport: 'football', league: 'epl', category: 'injury', status: 'confirmed',
    headline: 'Crystal Palace confirm Chadi Riad has ruptured his ACL',
    dek: 'The defender faces a long spell out, announced hours before Palace host Manchester City.',
    summary: 'Palace announced the injury in Friday\u2019s press conference.',
    body: [],
    source: 'Crystal Palace press conference, via RotoWire', sourceUrl: null,
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'epl-martinez-chelsea-2026-08-28',
    sport: 'football', league: 'epl', category: 'transfer', status: 'report',
    headline: 'Emiliano Martinez in London for a Chelsea medical',
    dek: 'Neither club has announced anything.',
    summary: 'The Aston Villa goalkeeper is reported to be close to completing a move to Stamford Bridge.',
    body: [],
    source: 'CaughtOffside', sourceUrl: null,
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'epl-mw2-palace-city-2026-08-28',
    sport: 'football', league: 'epl', category: 'match', status: 'scheduled',
    headline: 'Matchweek 2 opens with Crystal Palace against Manchester City',
    dek: 'The round runs through Monday.',
    summary: 'Palace host City on Friday evening after losing 2-0 at Everton in the opening round.',
    body: [],
    source: 'PremierLeague.com / NBC Sports', sourceUrl: null,
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'epl-window-deadline-2026-08-28',
    sport: 'football', league: 'epl', category: 'transfer', status: 'scheduled',
    headline: 'Transfer window shuts on 1 September at 23:00 BST',
    dek: 'A handful of days left in a window shaped by the summer World Cup.',
    summary: 'Clubs have until Tuesday night to finalise squads.',
    body: [],
    source: 'PremierLeague.com', sourceUrl: null,
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'epl-marmoush-spurs-2026-08-27',
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Tottenham take Omar Marmoush on a season-long loan from Manchester City',
    dek: 'The Egypt international joins for the 2026-27 campaign.',
    summary: 'Spurs announced the loan deal.',
    body: [],
    source: 'Tottenham Hotspur (official)', sourceUrl: null,
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  },

  /* --------------------------------------------------------------- LA LIGA */
  {
    id: 'laliga-madrid-sociedad-2026-08-26',
    featured: true,
    sport: 'football', league: 'laliga', category: 'match', status: 'confirmed',
    headline: 'Mbapp\u00e9 hat-trick marks Mourinho\u2019s Bernab\u00e9u return as Real Madrid win 4-1',
    dek: 'Thirteen years after his first spell ended, Mourinho was back in the home dugout \u2014 and Real Madrid pulled clear after the break.',
    summary: 'Kylian Mbapp\u00e9 scored three times and Vin\u00edcius J\u00fanior added a fourth, after Luka Su\u010di\u0107 had levelled before half-time.',
    body: [
      'Jos\u00e9 Mourinho marked his return to the Santiago Bernab\u00e9u dugout with a 4-1 win over Real Sociedad, Kylian Mbapp\u00e9 scoring a hat-trick in a rescheduled Matchday 1 fixture. It was Mourinho\u2019s first competitive home match in charge of Real Madrid since his first spell ended 13 years ago.',
      'There was a party mood before kick-off. Mourinho\u2019s name drew loud cheers when it was announced, and full-back Marc Cucurella walked out with a guard of honour to show off the World Cup trophy won by Spain over the summer. He was joined by Mikel Oyarzabal, who also played his part in that success and who came close to opening the scoring for Sociedad before Thibaut Courtois blocked with his leg.',
      'Mbapp\u00e9 opened the scoring on 40 minutes, but Luka Su\u010di\u0107 levelled four minutes later and the sides went in at 1-1. Madrid were a different proposition after the break: Mbapp\u00e9 restored the lead on the hour after working a one-two with Jude Bellingham, following a move down the left involving Cucurella and Federico Valverde.',
      'Bellingham claimed a second assist eight minutes later, winning back possession after his own shot was blocked to leave Vin\u00edcius J\u00fanior with a tap-in. Mbapp\u00e9 completed the hat-trick 10 minutes from time, chipping in after a through ball from Vin\u00edcius. Brahim D\u00edaz had a fifth ruled out by VAR in stoppage time.',
      'The treble took Mbapp\u00e9 to 89 goals in 105 Real Madrid appearances and secured a second straight LaLiga win for Mourinho, after an opening 2-1 victory at Espanyol. The fixture had been moved from the opening weekend because of international tournament scheduling.'
    ],
    source: 'ESPN',
    sourceUrl: 'https://www.espn.com/soccer/report/_/gameId/401882919',
    publishedAt: '2026-08-26', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'laliga-barca-athletic-2026-08-27',
    sport: 'football', league: 'laliga', category: 'match', status: 'confirmed',
    headline: 'Barcelona 2-0 Athletic Club as Rodri returns to LaLiga',
    dek: 'Hansi Flick called the midfielder the "perfect" signing after his debut.',
    summary: 'Raphinha and Ferm\u00edn L\u00f3pez scored at Camp Nou in the champions\u2019 rescheduled opener, with Rodri making his competitive return to Spanish football.',
    body: [],
    source: 'ESPN', sourceUrl: null,
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'laliga-alaves-villarreal-2026-08-28',
    sport: 'football', league: 'laliga', category: 'match', status: 'scheduled',
    headline: 'Matchday 3 opens with Alav\u00e9s against Villarreal at Mendizorroza',
    dek: 'Kick-off is 21:30 local time in Vitoria-Gasteiz.',
    summary: 'The first fixture of the round.',
    body: [],
    source: 'LALIGA (official)', sourceUrl: null,
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'laliga-window-deadline-2026-08-28',
    sport: 'football', league: 'laliga', category: 'transfer', status: 'scheduled',
    headline: 'Spanish window closes 1 September at 22:59',
    dek: 'A day later than the German and French deadlines.',
    summary: 'LaLiga clubs have until Tuesday night to register signings.',
    body: [],
    source: 'ESPN', sourceUrl: null,
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null
  },

  /* ------------------------------------------------------------ BUNDESLIGA */
  {
    id: 'bundesliga-bayern-stuttgart-2026-08-28',
    featured: true,
    sport: 'football', league: 'bundesliga', category: 'match', status: 'confirmed',
    headline: 'Bayern open the season with a 5-1 rout of Stuttgart',
    dek: 'Upamecano scored the first goal of the 2026-27 Bundesliga, and the champions pulled away after Stuttgart had briefly levelled.',
    summary: 'Dayot Upamecano headed in a Kimmich corner on 21 minutes at the Allianz Arena. Josha Vagnoman equalised, then scored an own goal as Bayern ran away with it.',
    body: [
      'Bayern Munich began the defence of their title with a 5-1 win over VfB Stuttgart at the Allianz Arena on Friday evening, opening the 64th Bundesliga season.',
      'Dayot Upamecano scored the first goal of the 2026-27 campaign on 21 minutes, heading in a Joshua Kimmich corner. Bayern took that single-goal lead into the interval.',
      'Josha Vagnoman levelled for Stuttgart on 52 minutes, but the equaliser lasted three minutes: Michael Olise restored the lead on 55. It then turned bitter for Vagnoman, who put through his own net on 58 to settle the match. Aleksandar Pavlovi\u0107 made it 4-1 on 84 minutes, and Luis D\u00edaz added a fifth in stoppage time.',
      'The result extends a long run in the season opener. This was the 25th edition of the Bundesliga\u2019s official opening fixture, and the defending champions have never lost it, with 19 wins and five draws. Bayern have now gone 14 consecutive season openers without defeat.',
      'Vincent Kompany\u2019s side arrived in form, having beaten Borussia Dortmund 2-1 in the Franz Beckenbauer Supercup on 22 August. "It comes down to staying hungry and resetting everything to zero," Kompany said afterwards, adding that his players simply enjoy winning and scoring goals.',
      'The 2026-27 season runs to 22 May 2027. Schalke 04, SV Elversberg and SC Paderborn come up from the 2. Bundesliga, replacing VfL Wolfsburg, 1. FC Heidenheim and FC St. Pauli.'
    ],
    source: 'Sportschau (ARD)',
    sourceUrl: 'https://www.sportschau.de/fussball/bundesliga/naechstes-schuetzenfest-zum-auftakt-bayern-schon-wieder-spitze,spielbericht-bayern-muenchen-vfb-stuttgart-106.html',
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'bundesliga-promoted-clubs-2026-08-28',
    sport: 'football', league: 'bundesliga', category: 'league', status: 'confirmed',
    headline: 'Schalke return to the top flight as Elversberg debut',
    dek: 'Three promoted clubs replace Wolfsburg, Heidenheim and St. Pauli.',
    summary: 'Schalke 04 come up as second-tier champions, SC Paderborn via the play-off, and SV Elversberg make their first-ever Bundesliga appearance.',
    body: [],
    source: 'Bundesliga.com / DFL', sourceUrl: null,
    publishedAt: '2026-08-28', updatedAt: null,
    image: null, video: null
  },
  {
    id: 'bundesliga-augsburg-seol-2026-08-27',
    sport: 'football', league: 'bundesliga', category: 'transfer', status: 'confirmed',
    headline: 'Augsburg sign South Korea international Young-woo Seol until 2030',
    dek: 'The full-back joins from Red Star Belgrade.',
    summary: 'The 27-year-old joins for a reported \u20ac4m fee including a 5% sell-on clause, the club announced.',
    body: [],
    source: 'FC Augsburg (official)', sourceUrl: null,
    publishedAt: '2026-08-27', updatedAt: null,
    image: null, video: null
  }
];
