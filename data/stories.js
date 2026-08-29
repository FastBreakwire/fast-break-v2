/**
 * Fast Break — central story data.
 *
 * THIS IS THE FILE YOU EDIT TO PUBLISH NEWS. Nothing else needs to change:
 * index.html renders whatever is in here into the right league section.
 *
 * To add a story, append an object to the array below:
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
 *     summary,
 *     source,      // outlet, plus "(official)" when it is a club/league release
 *     publishedAt, // YYYY-MM-DD
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
 *   - image/video stay null unless a rights-cleared asset exists.
 *   - never invent a source or a timestamp.
 *
 * Loaded as a classic script before the main bundle, so it works over file://
 * as well as from a server.
 */

// ===========================================================================
// CENTRAL STORY DATA  — single source of truth for every rendered story
// ---------------------------------------------------------------------------
//   { id, sport, league, category, status, headline, summary,
//     source, publishedAt, image, video }
//
// status:  confirmed  — official / court record / club or league announcement
//          report     — single-insider reporting, agreed but not announced
//          scheduled  — fixture or deadline that has not happened yet
//
// Researched and verified 28 Aug 2026 against the 48-hour window
// (26–28 Aug 2026). `image` and `video` are null wherever no rights-cleared
// asset was verified — nothing is filled with a stand-in.
// ===========================================================================
window.FB_STORIES = [

  /* ---------------------------------------------------------------- WNBA */
  {
    id: 'wnba-bonner-dream-2026-08-27',
    featured: true,
    sport: 'basketball', league: 'wnba', category: 'signing', status: 'confirmed',
    headline: 'Atlanta Dream sign DeWanna Bonner for the rest of the season',
    summary: 'The Dream added the two-time WNBA champion and six-time All-Star on a rest-of-season contract, the club announced.',
    source: 'WNBA.com (club announcement)', publishedAt: '2026-08-27',
    image: null, video: null
  },
  {
    id: 'wnba-playoff-race-2026-08-27',
    sport: 'basketball', league: 'wnba', category: 'standings', status: 'confirmed',
    headline: 'Playoff seeding still open as Valkyries visit the Liberty',
    summary: 'Golden State sit second at 27-11, New York hold the sixth seed at 23-15, and Phoenix are already eliminated at 13-25.',
    source: 'The Big Lead', publishedAt: '2026-08-27',
    image: null, video: null
  },
  {
    id: 'wnba-aug26-results-2026-08-26',
    sport: 'basketball', league: 'wnba', category: 'results', status: 'confirmed',
    headline: 'Mystics beat Mercury 94-84; Valkyries see off the Sun 80-66',
    summary: 'Washington took a second straight win behind 19 points from Sonia Citron, while Golden State also made it two in a row against Connecticut.',
    source: 'The Big Lead', publishedAt: '2026-08-26',
    image: null, video: null
  },

  /* ----------------------------------------------------------------- NFL */
  {
    id: 'nfl-jacobs-charges-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'legal', status: 'confirmed',
    headline: 'Packers running back Josh Jacobs charged with two misdemeanours',
    summary: 'The Brown County District Attorney filed misdemeanour battery and criminal damage to property charges over a May arrest; the earlier felony count was not pursued. The Packers said they will cooperate with the NFL.',
    source: 'ESPN / NFL.com (Wisconsin court records)', publishedAt: '2026-08-27',
    image: null, video: null
  },
  {
    id: 'nfl-watson-starter-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'roster', status: 'confirmed',
    headline: 'Browns name Deshaun Watson their 2026 starting quarterback',
    summary: 'Cleveland confirmed the decision despite a modest preseason; Watson sat out Thursday\u2019s game against New England, as did backup Shedeur Sanders.',
    source: 'Pro Football Rumors / Yahoo Sports', publishedAt: '2026-08-27',
    image: null, video: null
  },
  {
    id: 'nfl-leonard-williams-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'contract', status: 'report',
    headline: 'Seahawks and Leonard Williams agree three-year, $90M extension',
    summary: 'Reported by NFL Network insider Ian Rapoport: $56M guaranteed, keeping the defensive tackle in Seattle through 2029. Not yet formally announced by the club.',
    source: 'NFL Network (Ian Rapoport)', publishedAt: '2026-08-27',
    image: null, video: null
  },
  {
    id: 'nfl-cutdown-deadline-2026-08-27',
    sport: 'americanfootball', league: 'nfl', category: 'roster', status: 'scheduled',
    headline: 'All 32 teams must reach the 53-man limit by Sunday',
    summary: 'Preseason Week 3 closes on 29 August; rosters drop from 90 to 53 on 30 August, after which waived players hit the wire in reverse order of last season\u2019s records.',
    source: 'NFL.com / NBC Sports', publishedAt: '2026-08-27',
    image: null, video: null
  },
  {
    id: 'nfl-seahawks-sale-2026-08-26',
    featured: true,
    sport: 'americanfootball', league: 'nfl', category: 'league', status: 'confirmed',
    headline: 'NFL owners unanimously approve sale of the Seahawks to the Khosla family',
    summary: 'Commissioner Roger Goodell announced the unanimous vote approving the transfer of the franchise to a group led by Vinod and Neeru Khosla.',
    source: 'NFL.com', publishedAt: '2026-08-26',
    image: null, video: null
  },

  /* -------------------------------------------------------- PREMIER LEAGUE */
  {
    id: 'epl-riad-acl-2026-08-28',
    sport: 'football', league: 'epl', category: 'injury', status: 'confirmed',
    headline: 'Crystal Palace confirm Chadi Riad has ruptured his ACL',
    summary: 'The defender faces a long spell out. Palace announced it in Friday\u2019s press conference, hours before hosting Manchester City.',
    source: 'Crystal Palace press conference, via RotoWire', publishedAt: '2026-08-28',
    image: null, video: null
  },
  {
    id: 'epl-martinez-chelsea-2026-08-28',
    sport: 'football', league: 'epl', category: 'transfer', status: 'report',
    headline: 'Emiliano Martinez in London for a Chelsea medical',
    summary: 'The Aston Villa goalkeeper is reported to be close to completing a move to Stamford Bridge. Neither club has announced anything.',
    source: 'CaughtOffside', publishedAt: '2026-08-28',
    image: null, video: null
  },
  {
    id: 'epl-mw2-palace-city-2026-08-28',
    sport: 'football', league: 'epl', category: 'match', status: 'scheduled',
    headline: 'Matchweek 2 opens with Crystal Palace against Manchester City',
    summary: 'Palace host City on Friday evening after losing 2-0 at Everton in the opening round. The round runs through Monday.',
    source: 'PremierLeague.com / NBC Sports', publishedAt: '2026-08-28',
    image: null, video: null
  },
  {
    id: 'epl-window-deadline-2026-08-28',
    sport: 'football', league: 'epl', category: 'transfer', status: 'scheduled',
    headline: 'Transfer window shuts on 1 September at 23:00 BST',
    summary: 'Clubs have a handful of days left to finalise squads in a window shaped by the summer World Cup.',
    source: 'PremierLeague.com', publishedAt: '2026-08-28',
    image: null, video: null
  },
  {
    id: 'epl-delap-forest-2026-08-27',
    featured: true,
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Nottingham Forest sign Liam Delap from Chelsea',
    summary: 'The striker moves to the City Ground in a deal reported at roughly \u20ac52m, one of several completed English deals on 27 August.',
    source: 'FootballTransfers (club announcements)', publishedAt: '2026-08-27',
    image: null, video: null
  },
  {
    id: 'epl-marmoush-spurs-2026-08-27',
    sport: 'football', league: 'epl', category: 'transfer', status: 'confirmed',
    headline: 'Tottenham take Omar Marmoush on a season-long loan from Manchester City',
    summary: 'Spurs announced the Egypt international on loan for the 2026-27 campaign.',
    source: 'Tottenham Hotspur (official)', publishedAt: '2026-08-27',
    image: null, video: null
  },

  /* --------------------------------------------------------------- LA LIGA */
  {
    id: 'laliga-alaves-villarreal-2026-08-28',
    sport: 'football', league: 'laliga', category: 'match', status: 'scheduled',
    headline: 'Matchday 3 opens with Alav\u00e9s against Villarreal at Mendizorroza',
    summary: 'Kick-off is 21:30 local time in Vitoria-Gasteiz, the first of the round.',
    source: 'LALIGA (official)', publishedAt: '2026-08-28',
    image: null, video: null
  },
  {
    id: 'laliga-window-deadline-2026-08-28',
    sport: 'football', league: 'laliga', category: 'transfer', status: 'scheduled',
    headline: 'Spanish window closes 1 September at 22:59',
    summary: 'LaLiga clubs have until Tuesday night to register signings, a day later than the German and French deadlines.',
    source: 'ESPN', publishedAt: '2026-08-28',
    image: null, video: null
  },
  {
    id: 'laliga-barca-athletic-2026-08-27',
    sport: 'football', league: 'laliga', category: 'match', status: 'confirmed',
    headline: 'Barcelona 2-0 Athletic Club as Rodri returns to LaLiga',
    summary: 'Raphinha and Ferm\u00edn L\u00f3pez scored at Camp Nou in the champions\u2019 rescheduled opener, with Rodri making his competitive return to Spanish football.',
    source: 'FC Barcelona (official) / ESPN', publishedAt: '2026-08-27',
    image: null, video: null
  },
  {
    id: 'laliga-madrid-sociedad-2026-08-26',
    featured: true,
    sport: 'football', league: 'laliga', category: 'match', status: 'confirmed',
    headline: 'Real Madrid 4-1 Real Sociedad in Mourinho\u2019s first home game back',
    summary: 'Vin\u00edcius J\u00fanior scored twice from the penalty spot as Madrid pulled away after the break in a rescheduled Matchday 1 fixture at the Bernab\u00e9u. Kylian Mbapp\u00e9 did not feature.',
    source: 'ESPN / beIN Sports', publishedAt: '2026-08-26',
    image: null, video: null
  },

  /* ------------------------------------------------------------ BUNDESLIGA */
  {
    id: 'bundesliga-bayern-stuttgart-2026-08-28',
    featured: true,
    sport: 'football', league: 'bundesliga', category: 'match', status: 'confirmed',
    headline: 'Bayern open the season with a 5-1 win over Stuttgart',
    summary: 'Upamecano headed in Kimmich\u2019s corner on 21 minutes for the first goal of the 2026-27 Bundesliga. Stuttgart started brightly and hit the woodwork twice before Bayern pulled clear after the break.',
    source: 'weltfussball.de / Sportschau (live ticker)', publishedAt: '2026-08-28',
    image: null, video: null
  },
  {
    id: 'bundesliga-promoted-clubs-2026-08-28',
    sport: 'football', league: 'bundesliga', category: 'league', status: 'confirmed',
    headline: 'Schalke return to the top flight as Elversberg debut',
    summary: 'Schalke 04 come up as second-tier champions, SC Paderborn via the play-off, and SV Elversberg make their first-ever Bundesliga appearance.',
    source: 'Bundesliga.com / DFL', publishedAt: '2026-08-28',
    image: null, video: null
  },
  {
    id: 'bundesliga-augsburg-seol-2026-08-27',
    sport: 'football', league: 'bundesliga', category: 'transfer', status: 'confirmed',
    headline: 'Augsburg sign South Korea international Young-woo Seol until 2030',
    summary: 'The 27-year-old full-back joins from Red Star Belgrade for a reported \u20ac4m fee including a 5% sell-on clause, the club announced.',
    source: 'FC Augsburg (official)', publishedAt: '2026-08-27',
    image: null, video: null
  }
];
