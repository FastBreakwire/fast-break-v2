/**
 * Newsletter / roundup / opinion detection + the "sign up" false-positive
 * guard for the `signing` category.
 *
 * REAL REGRESSION CASE (2026-09-08): a Guardian "Football Daily" newsletter
 * item was ingested as a normal NEWS candidate, classified `signing`
 * (triggered by "Sign up now! Sign up now!" — its own newsletter-signup CTA
 * boilerplate, not any real transaction) and scored HIGH importance (its
 * rambling reader-mailbag prose happened to namecheck Arsenal/Chelsea/
 * Liverpool/Real Madrid). Neither is a real, single, factual news event.
 * Both are caught here, applied by normalize.js's normalizeItem to every
 * RSS item BEFORE classification/scoring ever runs — see that file's own
 * call site.
 */

// Known recurring named newsletter/column formats (Guardian's own family of
// these, confirmed live) — a "Name | Topic" headline is a structural signal
// that a single desk/writer produces this on a fixed schedule, never a
// one-off reported event.
const NAMED_NEWSLETTER_TITLES = new Set([
  'football daily', 'the fiver', 'the recap', 'the spin', 'the breakdown',
  'moving the goalposts', 'the guardian sport newsletter'
]);

// A headline opening "<Name> | <topic>" (or similar separators) where
// <Name> matches one of the known recurring newsletter/column titles above.
function hasNamedNewsletterPrefix(headline) {
  const m = /^\s*([^|:–—-]{2,40})\s*[|:–—-]\s*/.exec(headline || '');
  if (!m) return false;
  return NAMED_NEWSLETTER_TITLES.has(m[1].trim().toLowerCase());
}

// Phrases that, anywhere in the (already HTML-stripped) headline or body
// text, mark the item as a newsletter/roundup/opinion/promo piece rather
// than a discrete reported event. Deliberately checked against CLEAN text
// only — never raw HTML — so a legitimate story that happens to mention,
// say, a "podcast" once in passing isn't swept up by a single loose word;
// each phrase here is the kind of boilerplate a real news report would not
// contain in this shape.
const NEWSLETTER_SIGNAL_PATTERN = /\bsign[\s-]?up (?:now|today)?\s*(?:to|for)\b|\bsubscribe (?:now\s+)?to\b|\bnewsletter\b|\bemail edition\b|\bmailbag\b|\breader letters?\b|\bletters?:\s|\bpodcast\b.{0,20}\b(?:out now|new episode|listen now)\b|\bweekly (?:column|roundup|recap)\b|\bthis week'?s (?:round[- ]?up|recap)\b|\bcontinue reading\.\.\.\s*$/i;

/**
 * @param {string} headline raw or clean headline text
 * @param {string} cleanedBodyText HTML-ALREADY-STRIPPED body/description —
 *   never pass raw HTML in here, the signal phrases are matched as plain
 *   prose (e.g. "sign up to" spanning what would otherwise be inside an
 *   <a>/<strong> tag).
 */
function isNewsletterOrEditorial(headline, cleanedBodyText) {
  if (hasNamedNewsletterPrefix(headline)) return true;
  if (NEWSLETTER_SIGNAL_PATTERN.test(headline || '')) return true;
  if (NEWSLETTER_SIGNAL_PATTERN.test(cleanedBodyText || '')) return true;
  return false;
}

// Roundup / live-blog aggregation formats (item 6: BBC "Transfer rumours:
// ...", Sky "Transfer Centre LIVE..."). Real, individually-reportable news
// may exist WITHIN these pages, so they are NOT excluded outright the way a
// newsletter is — only the hard "this is one CONFIRMED transaction"
// categories (signing/trade) are guarded against them; every other
// category (transfer, league, ...) is untouched, since a rumour roundup
// genuinely still concerns transfers, just not one confirmed deal.
const ROUNDUP_LIVE_FORMAT_PATTERN = /\btransfer (?:rumou?rs?|centre|center|news)\s*:?\s*live\b|\btransfer rumou?rs?\s*:/i;

// "sign up"/"signup"/"subscribe" must NEVER, by themselves, imply a signing
// event — checked as a hard negative BEFORE any signing-context match, so
// it only ever suppresses this one false-positive pattern and never
// affects any other category.
const SIGNUP_CTA_PATTERN = /\bsign[\s-]?up\b|\bsubscribe\b/i;

module.exports = {
  isNewsletterOrEditorial, hasNamedNewsletterPrefix,
  NEWSLETTER_SIGNAL_PATTERN, ROUNDUP_LIVE_FORMAT_PATTERN, SIGNUP_CTA_PATTERN
};
