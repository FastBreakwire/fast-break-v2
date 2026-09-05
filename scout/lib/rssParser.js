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
  const cdataRe = new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tagName}>`, 'i');
  const plainRe = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const cdataMatch = itemXml.match(cdataRe);
  if (cdataMatch) return decodeEntities(stripHtmlTags(cdataMatch[1]));
  const plainMatch = itemXml.match(plainRe);
  if (plainMatch) return decodeEntities(stripHtmlTags(plainMatch[1]));
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
