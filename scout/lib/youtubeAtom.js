/**
 * Minimal Atom-feed entry extractor for YouTube's public per-channel feed
 * (https://www.youtube.com/feeds/videos.xml?channel_id=...). Same spirit
 * as rssParser.js — narrow, hand-verified against a real fetched feed,
 * not a general-purpose Atom parser, and not an npm dependency.
 */

function extractTag(entryXml, tagName) {
  const m = entryXml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return m ? m[1].trim() : null;
}

function extractLink(entryXml) {
  const m = entryXml.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) ||
            entryXml.match(/<link[^>]*href=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

/**
 * @param {string} xml raw Atom document text
 * @returns {Array<{title:string, link:string|null, published:string|null}>}
 */
function parseAtomEntries(xml) {
  if (!xml || typeof xml !== 'string') return [];
  const entryMatches = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return entryMatches.map(entryXml => ({
    title: extractTag(entryXml, 'title') || '',
    link: extractLink(entryXml),
    published: extractTag(entryXml, 'published')
  })).filter(e => e.title);
}

module.exports = { parseAtomEntries };
