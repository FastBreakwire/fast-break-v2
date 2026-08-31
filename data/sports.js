/**
 * Fast Break — sport / league / team configuration.
 *
 * Provider-independent. The Highlightly adapter (server/) maps provider ids
 * onto the ids used here, so swapping data provider never touches the UI.
 *
 *   sport  { id, name, type }
 *   league { id, sport, name, logo, country }
 *   team   { id, league, name, shortName, logo }
 *
 * Loaded as a classic script before the main bundle.
 */
(function () {
  // ===========================================================================
  // SPORT / LEAGUE / TEAM CONFIGURATION  (provider-independent)
  // ---------------------------------------------------------------------------
  //   sport  { id, name, logo, type }
  //   league { id, sport, name, logo, country }
  //   team   { id, league, name, shortName, logo }
  //
  // Nothing here is tied to a data provider's response shape. The Highlightly
  // adapter maps provider ids onto these ids server-side (see server/).
  //
  // LOGO ASSETS: league + team marks resolve to ESPN's public CDN
  // (a.espncdn.com/i/teamlogos/{sport}/500/{abbrev}.png). These are real,
  // stable, third-party assets — they are hotlinked here for prototyping and
  // must be replaced with licensed/self-hosted files before production.
  // Where no verified asset id exists (see FOOTBALL note below) the row falls
  // back to a lettermark rather than a fake URL.
  // ===========================================================================
  const ESPN = (sport, abbr) => `https://a.espncdn.com/i/teamlogos/${sport}/500/${abbr}.png`;

  const SUB_ITEMS = ["Latest", "Scores", "Standings", "Teams", "Players"];

  const SPORTS_CFG = [
    { id:"basketball",      name:"Basketball",        type:"basketball" },
    { id:"football",        name:"Football",          type:"football" },
    { id:"americanfootball",name:"American Football", type:"americanfootball" }
  ];

  // ---------------------------------------------------------------------------
  // COMPETITIONS — not national leagues
  // ---------------------------------------------------------------------------
  // A league has a fixed member set: the same clubs play every round of the
  // season, and TEAMS_CFG can list them. A continental cup does not — its field
  // is decided by qualification and changes every season, so its participants
  // are a PROVIDER concern, never a hardcoded list here.
  //
  // Modelling them as leagues would mean inventing a permanent membership that
  // does not exist. They therefore get their own kind, with:
  //   kind:"cup"        distinguishes them from kind:"league"
  //   organiser         the confederation that runs it (UEFA)
  //   participantsFrom  where the field comes from, so the data layer knows it
  //                     must be fetched per season rather than read from here
  //
  // Highlightly (or any provider) maps its own competition ids onto these ids
  // server-side, exactly as it already does for leagues. Nothing here is tied
  // to a provider's response shape, and no fixtures are implemented in this
  // file — this is configuration only.
  const COMPETITIONS_CFG = [
    { id:"ucl", sport:"football", kind:"cup", name:"Champions League",
      organiser:"UEFA", country:null, logo:null, participantsFrom:"qualification" },
    { id:"uel", sport:"football", kind:"cup", name:"Europa League",
      organiser:"UEFA", country:null, logo:null, participantsFrom:"qualification" }
  ];

  const LEAGUES_CFG = [
    { id:"nba",        sport:"basketball",      name:"NBA",             country:"US", logo:ESPN("nba","nba") },
    { id:"wnba",       sport:"basketball",      name:"WNBA",            country:"US", logo:ESPN("wnba","wnba") },
    { id:"epl",        sport:"football",        name:"Premier League",  country:"EN", logo:null },
    { id:"laliga",     sport:"football",        name:"La Liga",         country:"ES", logo:null },
    { id:"bundesliga", sport:"football",        name:"Bundesliga",      country:"DE", logo:null },
    { id:"nfl",        sport:"americanfootball",name:"NFL",             country:"US", logo:ESPN("nfl","nfl") }
  ];

  // Teams. NBA/WNBA/NFL use ESPN's verified abbreviation-based logo path.
  // FOOTBALL: ESPN keys soccer clubs by numeric internal id, which I could not
  // verify here — rather than invent URLs, those clubs carry logo:null and
  // render a lettermark. Drop verified asset URLs in to complete them.
  const TEAMS_CFG = [
    // --- NBA ---
    { id:"nba-bos", league:"nba", name:"Boston Celtics",       shortName:"BOS", logo:ESPN("nba","bos") },
    { id:"nba-cle", league:"nba", name:"Cleveland Cavaliers",  shortName:"CLE", logo:ESPN("nba","cle") },
    { id:"nba-den", league:"nba", name:"Denver Nuggets",       shortName:"DEN", logo:ESPN("nba","den") },
    { id:"nba-gs",  league:"nba", name:"Golden State Warriors",shortName:"GSW", logo:ESPN("nba","gs")  },
    { id:"nba-lal", league:"nba", name:"Los Angeles Lakers",   shortName:"LAL", logo:ESPN("nba","lal") },
    { id:"nba-lac", league:"nba", name:"LA Clippers",          shortName:"LAC", logo:ESPN("nba","lac") },
    { id:"nba-mia", league:"nba", name:"Miami Heat",           shortName:"MIA", logo:ESPN("nba","mia") },
    { id:"nba-nyk", league:"nba", name:"New York Knicks",      shortName:"NYK", logo:ESPN("nba","ny")  },
    { id:"nba-okc", league:"nba", name:"Oklahoma City Thunder",shortName:"OKC", logo:ESPN("nba","okc") },
    { id:"nba-phi", league:"nba", name:"Philadelphia 76ers",   shortName:"PHI", logo:ESPN("nba","phi") },
    // --- WNBA ---
    { id:"wnba-ind", league:"wnba", name:"Indiana Fever",      shortName:"IND", logo:ESPN("wnba","ind") },
    { id:"wnba-lv",  league:"wnba", name:"Las Vegas Aces",     shortName:"LVA", logo:ESPN("wnba","lv")  },
    { id:"wnba-min", league:"wnba", name:"Minnesota Lynx",     shortName:"MIN", logo:ESPN("wnba","min") },
    { id:"wnba-ny",  league:"wnba", name:"New York Liberty",   shortName:"NYL", logo:ESPN("wnba","ny")  },
    { id:"wnba-sea", league:"wnba", name:"Seattle Storm",      shortName:"SEA", logo:ESPN("wnba","sea") },
    // --- NFL ---
    { id:"nfl-buf", league:"nfl", name:"Buffalo Bills",        shortName:"BUF", logo:ESPN("nfl","buf") },
    { id:"nfl-dal", league:"nfl", name:"Dallas Cowboys",       shortName:"DAL", logo:ESPN("nfl","dal") },
    { id:"nfl-kc",  league:"nfl", name:"Kansas City Chiefs",   shortName:"KC",  logo:ESPN("nfl","kc")  },
    { id:"nfl-phi", league:"nfl", name:"Philadelphia Eagles",  shortName:"PHI", logo:ESPN("nfl","phi") },
    { id:"nfl-sf",  league:"nfl", name:"San Francisco 49ers",  shortName:"SF",  logo:ESPN("nfl","sf")  },
    // --- Premier League (logo ids unverified -> lettermark) ---
    { id:"epl-ars", league:"epl", name:"Arsenal",              shortName:"ARS", logo:null },
    { id:"epl-che", league:"epl", name:"Chelsea",              shortName:"CHE", logo:null },
    { id:"epl-liv", league:"epl", name:"Liverpool",            shortName:"LIV", logo:null },
    { id:"epl-mci", league:"epl", name:"Manchester City",      shortName:"MCI", logo:null },
    { id:"epl-mun", league:"epl", name:"Manchester United",    shortName:"MUN", logo:null },
    // --- La Liga ---
    { id:"laliga-ath", league:"laliga", name:"Athletic Club",  shortName:"ATH", logo:null },
    { id:"laliga-atm", league:"laliga", name:"Atlético Madrid",shortName:"ATM", logo:null },
    { id:"laliga-bar", league:"laliga", name:"FC Barcelona",   shortName:"BAR", logo:null },
    { id:"laliga-rma", league:"laliga", name:"Real Madrid",    shortName:"RMA", logo:null },
    { id:"laliga-sev", league:"laliga", name:"Sevilla FC",     shortName:"SEV", logo:null },
    // --- Bundesliga ---
    { id:"bundesliga-b04", league:"bundesliga", name:"Bayer Leverkusen",   shortName:"B04", logo:null },
    { id:"bundesliga-bmg", league:"bundesliga", name:"Bor. Mönchengladbach", shortName:"BMG", logo:null },
    { id:"bundesliga-bvb", league:"bundesliga", name:"Borussia Dortmund",  shortName:"BVB", logo:null },
    { id:"bundesliga-fcb", league:"bundesliga", name:"Bayern München",     shortName:"FCB", logo:null },
    { id:"bundesliga-rbl", league:"bundesliga", name:"RB Leipzig",         shortName:"RBL", logo:null }
  ];
  // Leagues carry kind:"league" so callers can treat leagues and cups through
  // one uniform shape without inspecting which array they came from.
  LEAGUES_CFG.forEach(l => { l.kind = "league"; });

  // ---------------------------------------------------------------------------
  // COMPETITION TIMEZONES — fixed editorial zones (IANA names, so DST is
  // handled automatically), NOT the visitor's own browser timezone. Game
  // dates/times in the rail and full schedule are always shown in the
  // competition's own market. Mirrored in server/highlightlyProvider.js
  // (that file can't be imported by this classic <script>) — keep in sync.
  // ---------------------------------------------------------------------------
  const COMPETITION_TIMEZONES = {
    nba: "America/New_York", wnba: "America/New_York", nfl: "America/New_York",
    epl: "Europe/London", laliga: "Europe/Madrid", bundesliga: "Europe/Berlin",
    ucl: "Europe/Berlin", uel: "Europe/Berlin"
  };

  window.FB_SPORTS_CONFIG = { SPORTS_CFG, LEAGUES_CFG, COMPETITIONS_CFG, TEAMS_CFG, COMPETITION_TIMEZONES };
})();
