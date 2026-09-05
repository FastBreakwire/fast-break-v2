/**
 * Scout-only supplemental team list — V1.2.
 *
 * This is deliberately NOT an extension of data/sports.js's TEAMS_CFG and
 * must never become one. TEAMS_CFG is the curated subset the real site's
 * mega menu ships to every visitor; it is off-limits to the Scout project
 * (protected architecture, "keine Änderungen an der öffentlichen Website").
 * TEAMS_CFG being small and curated is by design for the site — it is not
 * a bug the Scout gets to "fix" by adding to it.
 *
 * The problem this file solves is different: a team that isn't in TEAMS_CFG
 * (and has no TEAM_ALIASES entry, since that table only covers aliases of
 * teams already IN TEAMS_CFG) is invisible to normalize.js's team matcher.
 * Its bare nickname then looks exactly like a wire-copy surname to
 * guessPlayerNames() — confirmed in a real live run: "Sources: Rockets,
 * Thompson agree to $208M deal" produced entities.players: ["Rockets",
 * "Thompson"], because nothing told the Scout "Rockets" is a team, not a
 * person.
 *
 * Entries here exist ONLY to fix a confirmed real false positive from an
 * actual test run — never added speculatively to build toward a full
 * league roster. That would recreate the exact duplicated-data-source
 * anti-pattern this codebase avoids elsewhere (see normalize.js's
 * matchTeams() comment). If a new team causes the same bug in a future
 * live run, add it here the same way, with the same kind of comment.
 */
const SUPPLEMENTAL_TEAMS = [
  { name: 'Houston Rockets', league: 'nba', nicknames: ['Rockets'] },
  { name: 'Sacramento Kings', league: 'nba', nicknames: ['Kings'] }
];

module.exports = { SUPPLEMENTAL_TEAMS };
