/**
 * Stage 1 — FETCH.
 *
 * Pulls every feed in scout/sources.js in parallel, with a timeout per feed
 * so one slow/dead source never blocks the whole run. A feed that fails
 * fetches zero items and is reported as failed — it never silently drops
 * out of the run summary.
 */

const { parseRssItems } = require('./rssParser');

const FETCH_TIMEOUT_MS = 10000;

async function fetchOneFeed(feed) {
  const fetchedAt = new Date().toISOString();
  try {
    const res = await fetch(feed.url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) {
      return { feed, ok: false, error: `HTTP ${res.status}`, items: [], fetchedAt };
    }
    const xml = await res.text();
    const items = parseRssItems(xml);
    return { feed, ok: true, error: null, items, fetchedAt };
  } catch (err) {
    return { feed, ok: false, error: err.message || String(err), items: [], fetchedAt };
  }
}

/**
 * @param {Array} feeds from scout/sources.js
 * @returns {Promise<{results: Array, rawItemCount: number}>}
 */
async function fetchAllSources(feeds) {
  const results = await Promise.all(feeds.map(fetchOneFeed));
  const rawItemCount = results.reduce((sum, r) => sum + r.items.length, 0);
  return { results, rawItemCount };
}

module.exports = { fetchAllSources, fetchOneFeed };
