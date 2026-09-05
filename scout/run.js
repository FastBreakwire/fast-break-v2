#!/usr/bin/env node
/**
 * Fast Break Editorial Scout — CLI entrypoint.
 *
 * Usage:
 *   node scout/run.js
 *   npm run scout
 *
 * Runs the full V1 pipeline once (Sources -> Fetch -> Normalize -> Dedupe
 * -> Published Check -> Verify -> Score -> Priority -> Video-source check
 * -> Funnel -> Enrich -> Report) and writes:
 *   scout/output/<date>.md    (read this one first)
 *   scout/output/<date>.json  (full candidate data, for tooling)
 *
 * Publishes nothing. Never writes to data/stories.js. Every "confirmed" or
 * "POST NOW" in the output is a suggestion for a human to check, not an
 * action the Scout has taken.
 */

const fs = require('fs');
const path = require('path');

const { loadSportsConfig, loadStories } = require('./lib/loadDataFiles');
const { feeds, DEAD_OR_UNAVAILABLE } = require('./sources');
const { fetchAllSources } = require('./lib/fetchSources');
const { normalizeItem } = require('./lib/normalize');
const { dedupeCandidates } = require('./lib/dedupe');
const { markPublishedAlready } = require('./lib/publishedCheck');
const { verifyCandidate } = require('./lib/verify');
const { scoreCandidate } = require('./lib/score');
const { prioritizeCandidate, WEBSITE_FLOOR } = require('./lib/priority');
const { checkVideoSource, deepVideoSearch } = require('./lib/videoSource');
const { buildFunnel } = require('./lib/funnel');
const { enrichCandidate } = require('./lib/enrich');
const { buildMarkdownReport } = require('./lib/report');

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function run() {
  const startedAt = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  console.log(`Fast Break Editorial Scout — run started ${new Date().toISOString()}`);

  console.log(`\n[1/9] Loading data/sports.js and data/stories.js (read-only)...`);
  const sportsConfig = loadSportsConfig();
  const publishedStories = loadStories();
  console.log(`  leagues: ${sportsConfig.LEAGUES_CFG.map(l => l.id).concat(sportsConfig.COMPETITIONS_CFG.map(c => c.id)).join(', ')}`);
  console.log(`  published stories on file: ${publishedStories.length}`);

  console.log(`\n[2/9] Fetching ${feeds.length} source feeds...`);
  const { results: fetchResults, rawItemCount } = await fetchAllSources(feeds);
  const sourceFailures = fetchResults.filter(r => !r.ok);
  fetchResults.forEach(r => {
    console.log(`  ${r.ok ? 'OK  ' : 'FAIL'} ${r.feed.outlet} (${r.feed.id}): ${r.ok ? r.items.length + ' items' : r.error}`);
  });
  console.log(`  total raw items: ${rawItemCount}`);

  console.log(`\n[3/9] Normalizing + league-tagging...`);
  let unmatchedCount = 0;
  const normalized = [];
  for (const r of fetchResults) {
    for (const item of r.items) {
      const cand = normalizeItem(item, r.feed, sportsConfig);
      if (cand) normalized.push(cand);
      else unmatchedCount++;
    }
  }
  console.log(`  normalized candidates: ${normalized.length}  (unmatched to any covered league: ${unmatchedCount})`);

  console.log(`\n[4/9] Deduping...`);
  const deduped = dedupeCandidates(normalized);
  console.log(`  ${normalized.length} -> ${deduped.length} after clustering`);

  console.log(`\n[5/9] Checking against data/stories.js...`);
  const afterPublishedCheck = markPublishedAlready(deduped, publishedStories);
  const alreadyPublishedCount = afterPublishedCheck.filter(c => c.publishedAlready).length;
  console.log(`  ${alreadyPublishedCount} already covered, excluded`);

  console.log(`\n[6/9] Verifying (opening primary sources)...`);
  const toVerify = afterPublishedCheck.filter(c => !c.publishedAlready);
  const verified = await mapWithConcurrency(toVerify, 6, verifyCandidate);
  const stillRejected = afterPublishedCheck.filter(c => c.publishedAlready);

  console.log(`\n[7/9] Scoring, prioritizing, checking video sources...`);
  let scored = verified.map(scoreCandidate).map(prioritizeCandidate).map(checkVideoSource);

  const eligibleForEnrichment = scored.filter(c => c.websiteRelevanceScore >= WEBSITE_FLOOR);
  const notEligible = scored.filter(c => c.websiteRelevanceScore < WEBSITE_FLOOR);

  // Deep (networked) video search — gated to candidates it's actually
  // worth a request for: already clears the website floor, doesn't
  // already have a source from the cheap article-signal check, and the
  // story itself has high video potential (big trade/transfer/signing).
  // Runs BEFORE enrichment so contentType (in enrichCandidate) sees the
  // final videoSourceFound, not a stale pre-search value.
  const deepSearchCandidates = eligibleForEnrichment.filter(c => !c.videoSourceFound && c.videoPotential === 'high');
  console.log(`  deep video search for ${deepSearchCandidates.length} high-video-potential candidate(s)...`);
  const deepSearched = await mapWithConcurrency(deepSearchCandidates, 3, deepVideoSearch);
  const deepSearchedIds = new Set(deepSearched.map(c => c.candidateId));
  const afterDeepVideoSearch = eligibleForEnrichment.map(c => deepSearchedIds.has(c.candidateId) ? deepSearched.find(d => d.candidateId === c.candidateId) : c);

  console.log(`  enriching ${afterDeepVideoSearch.length} candidate(s) that clear the website floor (${WEBSITE_FLOOR})...`);
  const enriched = await mapWithConcurrency(afterDeepVideoSearch, 4, enrichCandidate);
  const enrichmentMode = enriched.length && enriched[0].enrichmentMode === 'anthropic_api' ? 'anthropic_api' : 'template_fallback';

  const allScored = [...enriched, ...notEligible, ...stillRejected];

  console.log(`\n[8/9] Building funnel (no quotas — quality bars only)...`);
  const funnel = buildFunnel(allScored);
  console.log(`  website shortlist: ${funnel.websiteShortlist.length}`);
  console.log(`  social candidates: ${funnel.socialCandidates.length}`);
  console.log(`  social priorities: ${funnel.socialPriorities.length}`);

  console.log(`\n[9/9] Writing report...`);
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const counts = {
    raw: rawItemCount,
    deduped: afterPublishedCheck.length,
    website: funnel.websiteShortlist.length,
    social: funnel.socialCandidates.length
  };
  const markdown = buildMarkdownReport({ dateLabel, counts, funnel, sourceFailures });

  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const mdPath = path.join(outDir, `${today}.md`);
  const jsonPath = path.join(outDir, `${today}.json`);
  fs.writeFileSync(mdPath, markdown, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    counts,
    unmatchedCount,
    alreadyPublishedCount,
    enrichmentMode,
    sourceFailures: sourceFailures.map(f => ({ outlet: f.feed.outlet, id: f.feed.id, error: f.error })),
    deadOrUnavailableSources: DEAD_OR_UNAVAILABLE,
    funnel
  }, null, 2), 'utf8');

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsedSec}s.`);
  console.log(`  ${mdPath}`);
  console.log(`  ${jsonPath}`);
  console.log(`\n${'='.repeat(60)}\n`);
  console.log(markdown);
}

run().catch(err => {
  console.error('Scout run failed:', err);
  process.exit(1);
});
