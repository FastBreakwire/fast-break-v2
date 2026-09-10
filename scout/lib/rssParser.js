/**
 * Minimal, dependency-free RSS 2.0 item extractor.
 *
 * Deliberately not a full XML parser and not an npm dependency — every feed
 * in scout/sources.js was hand-verified as RSS 2.0 with a flat <item> list,
 * which is a narrow, well-understood shape. This handles that shape well
 * and nothing more; it is not meant to survive an arbitrary/unknown feed.
 */

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function stripHtmlTags(str) {
  return (str || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractTag(itemXml, tagName) {
  // Prefer a CDATA payload if present, else plain text content.
  //
  // ORDER BUG FIX (2026-09): decodeEntities must run BEFORE stripHtmlTags,
  // not after. A plain (non-CDATA) <description> — confirmed live against
  // The Guardian's own football feed — carries its HTML entity-ENCODED
  // ("&lt;p&gt;&lt;a href=...&gt;"), not literal. Stripping tags first finds
  // nothing to strip (there are no literal '<'/'>' characters yet), and
  // decoding entities afterwards then RECONSTRUCTS the very tags stripping
  // was supposed to remove — which is exactly how raw "<p><a href=...>
  // <strong>" markup was reaching NEWS cards. Decoding first is safe for a
  // CDATA payload too (CDATA already contains literal HTML; decoding other
  // entities like &amp;/&#8217; inside it is correct either way), so this
  // single order swap fixes both branches uniformly.
  const cdataRe = new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, 'i');
  const plainRe = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const cdataMatch = itemXml.match(cdataRe);
  if (cdataMatch) return stripHtmlTags(decodeEntities(cdataMatch[1]));
  const plainMatch = itemXml.match(plainRe);
  if (plainMatch) return stripHtmlTags(decodeEntities(plainMatch[1]));
  return null;
}

function extractLink(itemXml) {
  // <link>https://...</link>, <link><![CDATA[https://...]]></link> (ESPN's
  // feeds do this), or <link href="https://..." /> (Atom-ish stragglers).
  const cdata = itemXml.match(/<link[^>]*>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/link>/i);
  if (cdata) return decodeEntities(cdata[1].trim());
  const plain = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (plain && plain[1] && plain[1].trim()) return decodeEntities(plain[1].trim());
  const attr = itemXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (attr) return decodeEntities(attr[1]);
  return null;
}

/**
 * @param {string} xml raw RSS 2.0 document text
 * @returns {Array<{title:string, link:string|null, pubDate:string|null, description:string|null}>}
 */
function parseRssItems(xml) {
  if (!xml || typeof xml !== 'string') return [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return itemMatches.map(itemXml => ({
    title: extractTag(itemXml, 'title') || '',
    link: extractLink(itemXml),
    pubDate: extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'dc:date') || null,
    description: extractTag(itemXml, 'description')
  })).filter(item => item.title);
}

module.exports = { parseRssItems, decodeEntities, stripHtmlTags };
