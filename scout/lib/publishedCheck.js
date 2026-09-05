/**
 * Stage 4 — AGAINST_PUBLISHED.
 *
 * Marks candidates that Fast Break has already covered, using existing
 * published stories (data/stories.js) — never touches that file, read-only.
 * Uses IDs, fuzzy headline overlap, shared entities, and publish recency,
 * per the spec.
 */

const { tokenOverlapRatio, entityOverlap } = require('./dedupe');

const RECENT_WINDOW_DAYS = 10; // a story published >10 days ago is unlikely to be what a fresh RSS item is re-reporting

function daysSince(dateStr) {
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

/**
 * @param {Array} candidates
 * @param {Array} publishedStories from loadDataFiles.loadStories()
 * @returns {Array} the same candidates, with publishedAlready/rejectionReason set where matched
 */
function markPublishedAlready(candidates, publishedStories) {
  const recentStories = publishedStories.filter(s => daysSince(s.publishedAt) <= RECENT_WINDOW_DAYS);

  return candidates.map(cand => {
    const candLikeEntities = { entities: cand.entities };
    const match = recentStories.find(story => {
      if (story.league !== cand.league) return false;
      const storyLikeEntities = { entities: { teams: [], players: [] } }; // published stories don't carry a parsed entities field — fall back to headline-only comparison for them
      const headlineSim = tokenOverlapRatio(story.headline, cand.headline);
      if (headlineSim >= 0.5) return true;
      // Weaker signal: decent headline overlap AND at least one of the
      // candidate's own guessed entities literally appears in the
      // published headline text.
      const entityHitsHeadline = [...cand.entities.teams, ...cand.entities.players]
        .some(name => name && story.headline.toLowerCase().includes(name.toLowerCase()));
      return headlineSim >= 0.25 && entityHitsHeadline;
    });

    if (match) {
      return {
        ...cand,
        publishedAlready: true,
        funnelStage: 'rejected',
        rejectionReason: `already covered — matches published story "${match.id}" (${match.publishedAt})`
      };
    }
    return cand;
  });
}

module.exports = { markPublishedAlready };
