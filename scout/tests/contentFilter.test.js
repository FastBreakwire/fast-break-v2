/**
 * Regression tests for the RSS cleanup / newsletter-detection / false-
 * "signing" fix (2026-09). Real regression case: a Guardian "Football
 * Daily" newsletter item was ingested as a normal NEWS candidate, showed
 * raw HTML in its summary, was classified `signing` (from its own "Sign up
 * now!" CTA boilerplate) and scored HIGH importance.
 *
 * Everything here is offline and free: pure string/regex functions and
 * normalizeItem() against an in-memory sportsConfig fixture — no network,
 * no file writes, no path to lib/enrich.js's Anthropic call.
 *
 * Run: node scout/tests/contentFilter.test.js
 */

const assert = require('assert/strict');
const path = require('path');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

const { parseRssItems } = require('../lib/rssParser');
const { normalizeItem, guessCategory } = require('../lib/normalize');
const { isNewsletterOrEditorial } = require('../lib/contentFilter');

// ---- Minimal sportsConfig fixture --------------------------------------
// Just enough for normalizeItem to resolve a league via team/competition
// matching, mirroring data/sports.js's real shape without depending on it
// (so this test never breaks from unrelated roster edits).
const sportsConfig = {
  TEAMS_CFG: [
    { id: 'epl-ars', league: 'epl', name: 'Arsenal', shortName: 'ARS' },
    { id: 'epl-che', league: 'epl', name: 'Chelsea', shortName: 'CHE' },
    { id: 'epl-mun', league: 'epl', name: 'Manchester United', shortName: 'MUN' }
  ],
  COMPETITIONS_CFG: [],
  LEAGUES_CFG: [
    { id: 'epl', sport: 'football', name: 'Premier League' }
  ]
};

const eplFeed = { id: 'test-epl', outlet: 'The Guardian', tier: 2, url: 'https://example.com/rss', leagueHint: null, scopedToSingleLeague: false };

// ---- A) "Sign up now to Football Daily" -> NOT signing -----------------
test('A) "Sign up now to Football Daily" is not classified as signing', () => {
  const cat = guessCategory('Sign up now to Football Daily', 'Sign up now to Football Daily');
  assert.notEqual(cat, 'signing');
});

// ---- B) Guardian Football Daily newsletter (real HTML) -> excluded -----
test('B) Guardian Football Daily newsletter (raw HTML) produces no NEWS candidate', () => {
  const xml = `<item>
    <title>Football Daily | Forget the hype machine – it's the minnows who offer European interest</title>
    <link>https://www.theguardian.com/football/2026/sep/08/football-daily-newsletter</link>
    <description>&lt;p&gt;&lt;a href="https://www.theguardian.com/info/2022/nov/14/football-daily-email-sign-up"&gt;&lt;strong&gt;Sign up now! Sign up now! Sign up now? Sign up now!&lt;/strong&gt;&lt;/a&gt;&lt;/p&gt;&lt;p&gt;Arsenal, Chelsea and Real Madrid all feature in today's Bigger Cup talk.&lt;/p&gt; &lt;a href="https://www.theguardian.com/football/2026/sep/08/football-daily-newsletter"&gt;Continue reading...&lt;/a&gt;</description>
    <pubDate>Tue, 08 Sep 2026 14:15:29 GMT</pubDate>
  </item>`;
  const [rawItem] = parseRssItems(xml);
  assert.ok(rawItem, 'the RSS item itself must still parse');
  const candidate = normalizeItem(rawItem, eplFeed, sportsConfig);
  assert.equal(candidate, null, 'a named newsletter item must be excluded, never become a NEWS candidate');
});

// ---- C) HTML-stripped signing headline retained -------------------------
test('C) "<p><strong>Manchester United sign Player X</strong></p>" strips HTML and stays a legitimate signing', () => {
  const xml = `<item>
    <title>Manchester United sign Player X</title>
    <link>https://example.com/story</link>
    <description>&lt;p&gt;&lt;strong&gt;Manchester United sign Player X&lt;/strong&gt;&lt;/p&gt;</description>
    <pubDate>Tue, 08 Sep 2026 10:00:00 GMT</pubDate>
  </item>`;
  const [rawItem] = parseRssItems(xml);
  assert.equal(rawItem.description, 'Manchester United sign Player X', 'HTML must be fully stripped, not just decoded');
  assert.ok(!/<[a-z]/i.test(rawItem.description), 'no raw HTML tag characters may remain');
  const candidate = normalizeItem(rawItem, eplFeed, sportsConfig);
  assert.ok(candidate, 'a real signing story must still produce a candidate');
  assert.equal(candidate.category, 'signing');
});

// ---- D) "Subscribe to our newsletter" -> NOT signing --------------------
test('D) "Subscribe to our newsletter" is not classified as signing', () => {
  const cat = guessCategory('Subscribe to our newsletter', 'Subscribe to our newsletter');
  assert.notEqual(cat, 'signing');
});

// ---- E) Legitimate signing language still works --------------------------
test('E) "Player signs five-year contract with Arsenal" is classified as signing', () => {
  const cat = guessCategory('Player signs five-year contract with Arsenal', '');
  assert.equal(cat, 'signing');
});

test('E2) "Club completes signing of Player" is classified as signing', () => {
  const cat = guessCategory('Club completes signing of Player', '');
  assert.equal(cat, 'signing');
});

// ---- F) Real factual news story still accepted ---------------------------
test('F) A real factual Guardian story (no newsletter signal) still produces a candidate', () => {
  const xml = `<item>
    <title>Arsenal confirm signing of new defender on five-year deal</title>
    <link>https://www.theguardian.com/football/2026/sep/08/arsenal-sign-defender</link>
    <description>&lt;p&gt;Arsenal have completed the signing of a new centre-back on a five-year contract, the club announced on Tuesday.&lt;/p&gt;</description>
    <pubDate>Tue, 08 Sep 2026 09:00:00 GMT</pubDate>
  </item>`;
  const [rawItem] = parseRssItems(xml);
  const candidate = normalizeItem(rawItem, eplFeed, sportsConfig);
  assert.ok(candidate, 'a real, non-newsletter story must still be accepted');
  assert.equal(candidate.category, 'signing');
  assert.equal(isNewsletterOrEditorial(rawItem.title, rawItem.description), false);
});

// ---- G) Raw HTML description is cleaned in the normalized candidate -----
test('G) Raw HTML description is fully cleaned in the normalized candidate', () => {
  const xml = `<item>
    <title>Chelsea sign winger from Serie A club</title>
    <link>https://example.com/story2</link>
    <description>&lt;p&gt;&lt;a href="https://example.com"&gt;&lt;strong&gt;Chelsea&lt;/strong&gt;&lt;/a&gt; have signed a winger from a Serie A club on a four-year deal.&lt;/p&gt;</description>
    <pubDate>Tue, 08 Sep 2026 08:00:00 GMT</pubDate>
  </item>`;
  const [rawItem] = parseRssItems(xml);
  const candidate = normalizeItem(rawItem, eplFeed, sportsConfig);
  assert.ok(candidate);
  assert.ok(!/<[a-z/][^>]*>/i.test(candidate.summary), 'candidate.summary must contain no HTML tags');
  assert.ok(candidate.summary.includes('signed a winger from a Serie A club'), 'the real text must survive cleaning');
});

// ---- Roundup/live-blog guard (item 6) ------------------------------------
test('BBC "Transfer rumours: ..." headline is never classified as a confirmed signing', () => {
  const cat = guessCategory('Transfer rumours: Club interested in signing striker', '');
  assert.notEqual(cat, 'signing');
});

test('Sky "Transfer Centre LIVE" headline is never classified as a confirmed signing', () => {
  const cat = guessCategory('Transfer Centre LIVE: All the latest deals as they happen', '');
  assert.notEqual(cat, 'signing');
});

// ---- Newsletter detection helper, direct unit coverage -------------------
test('hasNamedNewsletterPrefix / isNewsletterOrEditorial: named newsletter formats are detected', () => {
  assert.equal(isNewsletterOrEditorial('Football Daily | Some topic', ''), true);
  assert.equal(isNewsletterOrEditorial('The Fiver | Some topic', ''), true);
  assert.equal(isNewsletterOrEditorial('Arsenal sign new striker', 'Real transfer news here.'), false);
});

test('isNewsletterOrEditorial: "sign up to" boilerplate anywhere in the body triggers exclusion', () => {
  assert.equal(isNewsletterOrEditorial('Some headline', 'Sign up now to our free daily email.'), true);
});

// ---- Runner ----------------------------------------------------------------

(async () => {
  let passed = 0, failed = 0;
  for (const { name, fn } of tests) {
    try { await fn(); passed++; console.log(`  ok - ${name}`); }
    catch (err) { failed++; console.log(`  FAIL - ${name}`); console.log(`    ${err.message}`); }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed > 0 ? 1 : 0;
})();
