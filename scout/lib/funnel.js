/**
 * Stage 8 — FUNNEL.
 *
 * Spec correction #3: the 50-100 / 15-25 / 5-10 / 2-4 numbers are target
 * ranges, never quotas. Every threshold below is a fixed quality bar —
 * nothing here ever pads a list to hit a target count, and nothing here
 * ever trims a genuinely strong list down to fit one either. If only 9
 * candidates clear the website bar, 9 come out. If none clear the social
 * priority bar, zero come out (report.js turns that into an explicit
 * "None strong enough today", never a silently empty section).
 */

const { WEBSITE_FLOOR } = require('./priority');
const { tokenOverlapRatio, TIME_WINDOW_MS } = require('./dedupe');

const SOCIAL_CANDIDATE_THRESHOLD = 55;
const SOCIAL_PRIORITY_THRESHOLD = 75;
const SOCIAL_PRIORITY_SOFT_MAX = 4; // per spec's "~2-4" — a ceiling on how many can be promoted, never a floor
const NEAR_DUPLICATE_OVERLAP = 0.35;

// Categories treated as "this candidate IS its own news event", as opposed
// to commentary/analysis/roundup pieces (which fall through CATEGORY_RULES
// to 'league'/'results'/'match' because they don't repeat the original
// report's own verb). Used by clusterEvents() below to tell "five articles
// about one event" apart from "two different events, same team, same day".
const HARD_NEWS_CATEGORIES = new Set(['trade', 'transfer', 'signing', 'investigation', 'legal', 'injury', 'contract']);

function candidateTimestamp(c) {
  const primary = c.sources.find(s => s.isPrimary) || c.sources[0];
  const t = Date.parse((primary && primary.publishedAt) || c.discoveredAt);
  return Number.isNaN(t) ? Date.now() : t;
}

// Teams + high-confidence (multi-word, e.g. "Ben Simmons") player names —
// never a bare single-word player guess, which is exactly the unreliable
// category videoSource.js already refuses to trust as a search needle for
// the same reason (see its comment on `trustedNeedles`).
function dominantEntities(c) {
  return [...c.entities.teams, ...c.entities.players.filter(p => p.includes(' '))];
}

// Returns the shared entity name, or null — callers need to know WHICH
// entity matched, not just whether one did (see entityMentionedInHeadline).
function sharedDominantEntity(a, b) {
  const da = dominantEntities(a);
  return dominantEntities(b).find(e => da.includes(e)) || null;
}

// A roundup/preview piece can mention many clubs in its body while only
// ONE of them happens to be in the curated TEAMS_CFG — which then looks
// exactly like a "single-focus" piece to dominantEntities()'s count, even
// though the piece isn't actually a report ON that team. Found in real
// testing: "Bundesliga Matchday 2 probable teams" (lists every club that
// weekend, RB Leipzig is just one line in the body) merged with an actual
// RB Leipzig contract story; "Who are the key new signings in the 2026/27
// Bundesliga?" (a league-wide roundup) merged with an unrelated Bayern DFB
// Cup result, for the same reason. Requiring the shared entity's own name
// to actually appear in the CANDIDATE'S OWN HEADLINE (not just its body,
// and not just its resolved entities list) is a cheap, generalizable proxy
// for "this piece is actually about that team", not perfect but a real
// improvement — checked on significant (>3 letter) words so an alias form
// like "Man United" still matches "Manchester United" via the shared word
// "United", without needing a second alias lookup here.
function entityMentionedInHeadline(entityName, c) {
  const words = entityName.split(/\s+/).filter(w => w.length > 3);
  if (!words.length) return true;
  const headlineLower = c.headline.toLowerCase();
  return words.some(w => headlineLower.includes(w.toLowerCase()));
}

// A club's men's and women's sides share the same TEAMS_CFG entry (there is
// no separate curated entity for each) but are not remotely the same
// event: found in real testing — "Carrick: Man United 'made the most' of
// transfers" (the men's team) shared the "Manchester United" entity with
// "Women's transfer grades: Man United get an A- for Bernal" and "...WSL
// transfer window; Man United among losers", and all three would otherwise
// cluster as if they were one story. A cheap, generalizable text signal
// (not Man-United-specific — applies to any club with both a men's and a
// women's side) catches this: if exactly one side of a candidate pair
// mentions the women's game, they aren't the same event.
const WOMENS_CONTEXT_PATTERN = /\bwsl\b|\bwomen'?s\b|\bnwsl\b|\bwomens super league\b/i;
function isWomensContext(c) {
  return WOMENS_CONTEXT_PATTERN.test(`${c.headline} ${c.summary}`);
}

/**
 * V1.2 — event-level clustering across the FULL website shortlist, not
 * just the social top picks (spec: "5 verschiedene Artikel über dasselbe
 * Clippers-Strafereignis landen gleichzeitig in der Website-Shortlist").
 *
 * dedupeCandidates() (stage 3) already merges near-identical ARTICLES —
 * same headline wording, multiple outlets reporting the same wire copy.
 * This is a separate, coarser pass for DIFFERENT articles about the SAME
 * real event (a wire report + a reaction column + a "what this means"
 * piece), which legitimately have very different headlines and would
 * never clear dedupe's headline-similarity bar.
 *
 * Explicitly NOT implemented as "lower the headline-overlap threshold":
 * tested against the real 04.09.2026 Clippers example and rejected. Once
 * two candidates share a team, the team's own name is already a "shared
 * word" in any headline-overlap check, so a lower bar just re-catches the
 * same team on stories that aren't the same event — a tangential Celtics-
 * ownership piece that merely mentioned the Clippers scored the same
 * overlap range as the genuine follow-up pieces once the team name was
 * counted. So headline text is not the signal used here at all. Instead:
 *
 *   a HARD_NEWS_CATEGORIES candidate seeds the cluster (never two soft
 *   pieces alone — found necessary via real false merges: a live-match
 *   blog + an unrelated transfer retrospective, and a Rams quote piece
 *   that only mentioned the 49ers as their season-opener opponent, both
 *   merged with nothing actually anchoring them to one event) + same
 *   league + a shared TEAM or high-confidence player, published within
 *   dedupeCandidates()'s own time window, where the candidate being folded
 *   in names exactly ONE such entity (a piece naming two+ teams is a
 *   comparison/roundup, not a report on one event — found necessary by a
 *   real Celtics-ownership piece that merely mentioned the Clippers) and
 *   matches the seed's men's/women's-game context (see isWomensContext
 *   above), AND at most one candidate in the resulting group carries a
 *   distinct hard-news category.
 *
 * Reaction pieces and retrospectives almost always fall through
 * CATEGORY_RULES to a generic bucket, because they don't repeat the
 * original report's own verb — that's the tell used here to recognize
 * them as coverage OF an event rather than a second, independent one. If a
 * second candidate carries its OWN distinct hard-news category (e.g. the
 * same team also completes an unrelated signing the same day), the group
 * is split instead of merged.
 *
 * Known, disclosed limitations (not fixed, on purpose — see the V1.2
 * report for the reasoning):
 *   - A piece that discusses the event without ever being resolved to the
 *     seed's team/player at all (paraphrased, no name in the text) will
 *     not cluster — this is a mechanical, not a semantic, match, same as
 *     the rest of the Scout.
 *   - A dramatic game result with several reaction pieces will NOT
 *     cluster: 'results'/'match' aren't in HARD_NEWS_CATEGORIES, so
 *     nothing in that group can seed a cluster. Only trade/transfer/
 *     signing/investigation/legal/injury/contract events do — exactly the
 *     categories named in the spec's own examples.
 */
function buildCluster(group) {
  // Primary = the group's own best-scored member. Deliberately not a new
  // "best source" ranking — websiteRelevanceScore already reflects
  // recency/confirmation/corroboration, and constraint #5 is explicit
  // about not touching scoring for this pass.
  const [primary, ...supporting] = [...group].sort((a, b) => b.websiteRelevanceScore - a.websiteRelevanceScore);
  const primarySrc = primary.sources.find(s => s.isPrimary) || primary.sources[0];
  return {
    ...primary,
    primarySource: primarySrc,
    supportingSources: supporting.map(c => {
      const src = c.sources.find(s => s.isPrimary) || c.sources[0];
      return {
        candidateId: c.candidateId,
        headline: c.headline,
        outlet: src.outlet,
        url: src.url,
        publishedAt: src.publishedAt
      };
    }),
    clusterSize: group.reduce((sum, c) => sum + (c.clusterSize || 1), 0)
  };
}

function clusterEvents(candidates) {
  const used = new Set();
  const clustered = [];
  const sorted = [...candidates].sort((a, b) => b.websiteRelevanceScore - a.websiteRelevanceScore);

  // Only a HARD_NEWS_CATEGORIES candidate may seed a cluster — a cluster
  // must anchor on a confirmed event, never form purely from two soft/
  // analysis pieces that happen to share a team. Found necessary via real
  // false merges in testing: a live-match blog merged with an unrelated
  // transfer-window retrospective, and a Rams roster-availability quote
  // merged with two actual 49ers-Australia-trip stories, purely because
  // the Rams piece mentioned the 49ers in passing as their season-opener
  // opponent. Both sides of those pairs were 'league'-category (neither is
  // "the event"), so there was nothing real to anchor a cluster on.
  for (const seed of sorted) {
    if (used.has(seed.candidateId)) continue;
    if (!HARD_NEWS_CATEGORIES.has(seed.category)) continue;
    // The single-focus requirement below is applied to `other` on every
    // iteration, but a SEED can just as easily be a hidden multi-club
    // roundup with a hard-news category — found in real testing: "Who are
    // the key new signings in the 2026/27 Bundesliga?" resolves to
    // 'transfer' (its summary discusses several clubs' transfer business)
    // and matched BOTH Bayern München and RB Leipzig, so it wrongly seeded
    // a cluster with an unrelated Bayern DFB Cup result — the shared-entity
    // check alone can't tell "the story is about this team" from "this
    // team is one of several the story happens to mention". Applying the
    // same single-entity requirement to the seed closes that gap.
    if (dominantEntities(seed).length !== 1) continue;
    const group = [seed];
    used.add(seed.candidateId);

    for (const other of sorted) {
      if (used.has(other.candidateId)) continue;
      if (other.league !== seed.league) continue;
      if (dominantEntities(other).length !== 1) continue;
      const shared = sharedDominantEntity(seed, other);
      if (!shared) continue;
      if (!entityMentionedInHeadline(shared, other)) continue;
      if (isWomensContext(seed) !== isWomensContext(other)) continue;
      if (Math.abs(candidateTimestamp(other) - candidateTimestamp(seed)) > TIME_WINDOW_MS) continue;

      const hardNewsInGroup = new Set(
        [...group, other].filter(c => HARD_NEWS_CATEGORIES.has(c.category)).map(c => c.category)
      );
      if (hardNewsInGroup.size > 1) continue; // two distinct hard-news categories = two real events, not one told twice

      group.push(other);
      used.add(other.candidateId);
    }

    clustered.push(group.length === 1 ? seed : buildCluster(group));
  }

  // Anything left (every soft/analysis-category candidate, and any
  // hard-news seed that found no supporting pieces) passes through
  // unclustered — never used to seed a new cluster on its own.
  sorted.forEach(c => { if (!used.has(c.candidateId)) clustered.push(c); });

  return clustered;
}

function buildFunnel(candidates) {
  const active = candidates.filter(c => c.funnelStage !== 'rejected'); // already-published items stay excluded
  const rejected = candidates.filter(c => c.funnelStage === 'rejected');

  const belowWebsiteBar = active.filter(c => c.websiteRelevanceScore < WEBSITE_FLOOR)
    .map(c => ({ ...c, funnelStage: 'rejected', rejectionReason: c.rejectionReason || `websiteRelevanceScore ${c.websiteRelevanceScore} below floor (${WEBSITE_FLOOR})` }));

  const websiteShortlistRaw = active
    .filter(c => c.websiteRelevanceScore >= WEBSITE_FLOOR)
    .sort((a, b) => b.websiteRelevanceScore - a.websiteRelevanceScore)
    .map(c => ({ ...c, funnelStage: 'website_shortlist' }));

  // V1.2: event-level clustering — see clusterEvents() above.
  const websiteShortlist = clusterEvents(websiteShortlistRaw)
    .sort((a, b) => b.websiteRelevanceScore - a.websiteRelevanceScore);

  const socialCandidates = websiteShortlist
    .filter(c => c.socialRelevanceScore >= SOCIAL_CANDIDATE_THRESHOLD)
    .sort((a, b) => b.socialRelevanceScore - a.socialRelevanceScore)
    .map(c => ({ ...c, funnelStage: 'social_shortlist' }));

  // Editorial curation, not "top N by score": walk the ranked social
  // candidates and only promote ones that clear the higher priority bar
  // AND aren't a near-duplicate theme of something already promoted
  // (spec: "nicht vier fast identische Routine-News gleichzeitig").
  const socialPriorities = [];
  for (const cand of socialCandidates) {
    if (cand.socialRelevanceScore < SOCIAL_PRIORITY_THRESHOLD) continue;
    if (socialPriorities.length >= SOCIAL_PRIORITY_SOFT_MAX) break;
    const nearDup = socialPriorities.some(picked =>
      picked.league === cand.league &&
      picked.category === cand.category &&
      tokenOverlapRatio(picked.headline, cand.headline) >= NEAR_DUPLICATE_OVERLAP
    );
    if (nearDup) {
      cand.qualityFlags = [...cand.qualityFlags, 'suppressed_near_duplicate_of_priority'];
      continue; // stays in socialCandidates output, just not promoted
    }
    socialPriorities.push({ ...cand, funnelStage: 'social_priority' });
  }

  const websiteOnly = websiteShortlist.filter(c => !socialCandidates.some(sc => sc.candidateId === c.candidateId));

  return {
    websiteShortlist,
    websiteOnly,
    socialCandidates,
    socialPriorities,
    rejected: [...rejected, ...belowWebsiteBar]
  };
}

module.exports = { buildFunnel, SOCIAL_CANDIDATE_THRESHOLD, SOCIAL_PRIORITY_THRESHOLD, SOCIAL_PRIORITY_SOFT_MAX };
