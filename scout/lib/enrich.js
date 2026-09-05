/**
 * Stage 9 — ENRICH (contentType, whyFastBreak, hookSuggestion).
 *
 * Only runs on candidates that already made the website shortlist —
 * cheap enough to run on all of those, not just the social tier, since
 * whyFastBreak matters for the Website section too (spec example:
 * "Routine Exhibit-10 Signing -> eventuell Website-relevant, aber kein
 * ausreichender Fast-Break-Social-Impact" is itself a whyFastBreak line).
 *
 * Two modes:
 *   - No ANTHROPIC_API_KEY configured (the case in this environment right
 *     now — checked, not assumed): a fully deterministic template writes
 *     whyFastBreak/hookSuggestion from the signals already computed
 *     (qualityFlags, entities, category, scores). No network call, no key
 *     needed, always works.
 *   - ANTHROPIC_API_KEY present: a real API call asks for both fields as
 *     short, human-editable drafts. On ANY failure (missing key, network,
 *     bad response) it silently falls back to the template — the run
 *     never fails because of this stage.
 *
 * Neither mode is ever allowed to write licensing/legal language about
 * video ("cleared", "licensed", "safe to publish", "legal to use") —
 * spec correction #5. The template mode structurally can't (no such
 * words exist in it); the API mode's system prompt explicitly forbids it
 * and the response is scanned for those words as a hard backstop.
 */

const FORBIDDEN_VIDEO_CLAIMS = /\b(cleared|licensed|legal to use|safe to publish)\b/i;

function decideContentType(cand) {
  const bigMoveCategories = new Set(['trade', 'transfer', 'signing', 'contract']);
  if (bigMoveCategories.has(cand.category)) {
    // The spec's named house format for big moves — but "+ video" is only
    // ever claimed when checkVideoSource() actually found something.
    return cand.videoSourceFound ? 'graphic + video' : 'graphic';
  }
  if (cand.videoSourceFound) return 'video';
  if (cand.socialRelevanceScore >= 65) return 'graphic';
  return 'text';
}

// ---- fact extraction — pulled from the actual story text, not guessed ----
function extractMoney(text) {
  const m = text.match(/\$[\d,.]+\s?(?:million|m\b|M\b)?/);
  return m ? m[0].trim() : null;
}
function extractDuration(text) {
  const m = text.match(/\b(one|two|three|four|five|six|\d+)[- ]year\b/i);
  return m ? m[0].toLowerCase().replace(/\s+/, '-') : null;
}
function extractAfterClause(text) {
  const m = text.match(/\bafter\s+([a-z][^.]{5,90})/i);
  if (!m) return null;
  return m[1].replace(/,?\s*(his|her|their) agents?.*/i, '').trim();
}

const COMEBACK_PATTERN = /\bcomeback\b|\bis back\b|\bback in the\b|\breturn(s|ing)?\b/i;
const CONTROVERSY_PATTERN = /\bcontrovers|\bsuspend|\bfine[sd]?\b|\bban(ned)?\b|\binvestigat/i;
const RECORD_PATTERN = /\brecord\b|\bhistoric\b|\bmilestone\b/i;

/**
 * V1.1: replaces the old label-joining version ("recognizable name (X) +
 * strong narrative") with a short, concrete sentence built from facts
 * actually present in the story text — the dollar figure, deal length,
 * an "after ..." clause when one exists, comeback/controversy framing
 * when the text itself signals it. Still not a real editor and still
 * limited by what the RSS text actually contains (a short wire blurb
 * won't carry career-accolade context an editor would know by hand — see
 * the final report's known limitations), but it no longer just names a
 * detected keyword.
 */
/**
 * Picks the entity to name as the story's subject, but only when there's
 * a reliable candidate — a confirmed curated team, or a multi-word player
 * name (both high-confidence). A lone single-word guess is used only when
 * it's the ONLY entity found; two or more single-word guesses with no
 * team to disambiguate them (e.g. entities.players: ["Rockets","Thompson"]
 * — found in real testing, "Houston Rockets" isn't in the curated team
 * list so nothing marks "Rockets" as the non-person one) means the Scout
 * genuinely can't tell which word is the player, so it names neither
 * rather than risk asserting the wrong one as the subject.
 */
function pickSubject(cand) {
  if (cand.entities.teams.length) return cand.entities.teams[0];
  const multiWord = cand.entities.players.find(p => p.includes(' '));
  if (multiWord) return multiWord;
  if (cand.entities.players.length === 1) return cand.entities.players[0];
  return null; // ambiguous — see comment above
}

function templateWhyFastBreak(cand) {
  const text = `${cand.headline} ${cand.summary}`;
  const team = cand.entities.teams[0] || null;
  const player = cand.entities.players.find(p => p !== team) || null;
  const subject = pickSubject(cand) || 'This story';
  const money = extractMoney(text);
  const duration = extractDuration(text);
  const isComeback = COMEBACK_PATTERN.test(text);
  const isControversy = CONTROVERSY_PATTERN.test(text);
  const isRecord = RECORD_PATTERN.test(text);

  if (cand.qualityFlags.includes('routine_low_social')) {
    return `${subject} — real for the website (${cand.category}), but a routine move without much social pull.`;
  }

  // Only mention "with/to the {team}" when the team is a DIFFERENT entity
  // from the subject already being named — prevents "Man United's
  // transfer to Manchester United" (a real bug found in testing: subject
  // and team resolved to the same club under different names/aliases).
  const teamClause = team && subject !== team ? team : null;

  if (cand.category === 'signing' || cand.category === 'contract') {
    let s = `${subject} ${isComeback ? 'returns' : 'signs'}`;
    if (teamClause) s += ` with the ${teamClause}`;
    if (duration) s += ` on a ${duration} deal`;
    if (money) s += ` worth ${money}`;
    return s + (isComeback ? ' after time away from the league.' : '.');
  }
  if (cand.category === 'trade') {
    let s = `${subject} is traded${teamClause ? ` to the ${teamClause}` : ''}`;
    return s + (isControversy ? ', with real controversy attached — not a routine move.' : ' — a real roster shakeup, not a minor transaction.');
  }
  if (cand.category === 'transfer') {
    let s = `${subject}'s transfer${teamClause ? ` to ${teamClause}` : ''} is done`;
    if (money) s += ` for ${money}`;
    return s + '.';
  }
  if (cand.category === 'investigation' || cand.category === 'legal') {
    return `${subject} faces real consequences here${money ? ` (${money} on the line)` : ''} — a genuine controversy story, not routine league business.`;
  }
  if (cand.category === 'injury') {
    const after = extractAfterClause(text);
    return `${subject} injury update${after ? ` — ${after}` : ''}, the kind of development fans are actively tracking.`;
  }
  if (isRecord) {
    return `${subject} is tied to a real record/milestone moment — built-in fan interest beyond the routine result.`;
  }
  return `${subject} — a ${cand.category} story with limited narrative beyond the basic fact, best suited for the website only.`;
}

// Uses the same pickSubject() as whyFastBreak — same reasoning: don't
// name a specific entity as the hook's subject unless it's a reliable one.
const HOOK_TEMPLATES = {
  trade: (cand, subject) => `${subject || 'The move'} is official — here's what it means.`,
  transfer: (cand, subject) => `${subject || 'The transfer'} is done. Here's the breakdown.`,
  signing: (cand, subject) => `${subject || 'The deal'} just got done.`,
  injury: (cand, subject) => (subject ? `An update fans have been waiting on: ${subject}.` : `An injury update fans have been waiting on.`),
  investigation: () => `The league just made a call — here's the fallout.`,
  default: cand => `${cand.headline}`
};

function templateHook(cand) {
  const fn = HOOK_TEMPLATES[cand.category] || HOOK_TEMPLATES.default;
  return fn(cand, pickSubject(cand));
}

async function tryAnthropicEnrich(cand) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const prompt = `Story: "${cand.headline}"\nSummary: "${cand.summary}"\nLeague: ${cand.league}\nCategory: ${cand.category}\n\nWrite exactly two things as JSON: {"whyFastBreak": "...", "hookSuggestion": "..."}\n- whyFastBreak: one short sentence, editorial voice, answering specifically why THIS story fits Fast Break (recognizable player, comeback, big trade, strong narrative, fan curiosity) — not just "why it's relevant" in general. If the story is routine (small roster move, standard preview), say so plainly instead of overselling it.\n- hookSuggestion: one short English social hook in Fast Break's existing headline voice (factual, specific detail/number, no clickbait).\nNever use the words "cleared", "licensed", "legal to use", or "safe to publish" — video usage rights are a separate human/legal review, not something you assess.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content && data.content[0] && data.content[0].text;
    if (!text) return null;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.whyFastBreak || !parsed.hookSuggestion) return null;
    if (FORBIDDEN_VIDEO_CLAIMS.test(parsed.whyFastBreak) || FORBIDDEN_VIDEO_CLAIMS.test(parsed.hookSuggestion)) {
      return null; // backstop — fall back to template rather than ship a forbidden claim
    }
    return parsed;
  } catch (_err) {
    return null; // any failure at all -> caller falls back to templates
  }
}

async function enrichCandidate(cand) {
  const contentType = decideContentType(cand);
  const apiResult = await tryAnthropicEnrich(cand);

  const whyFastBreak = (apiResult && apiResult.whyFastBreak) || templateWhyFastBreak(cand);
  const hookSuggestion = (apiResult && apiResult.hookSuggestion) || templateHook(cand);

  return {
    ...cand,
    contentType,
    whyFastBreak,
    hookSuggestion,
    enrichmentMode: apiResult ? 'anthropic_api' : 'template_fallback'
  };
}

module.exports = { enrichCandidate, decideContentType, templateWhyFastBreak, templateHook };
