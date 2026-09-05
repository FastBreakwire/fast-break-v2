/**
 * Read-only loader for the existing Fast Break data files.
 *
 * data/sports.js and data/stories.js are classic browser scripts — they
 * assign to `window.*`, they are not CommonJS modules and export nothing.
 * This file never edits them and never duplicates their content into a
 * second, drift-prone copy (see the Editorial Scout spec, section 11: read
 * only). Instead it executes each file's real source once, in an isolated
 * scope with a fake `window`, and reads the result back off that fake
 * window. If either file's shape ever changes, this loader sees the same
 * change the real site does — there is exactly one source of truth.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function loadWindowAssignedScript(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const fakeWindow = {};
  // new Function keeps this out of the current scope entirely — the script
  // only ever sees the `window` object we hand it, nothing else in this
  // process. That's isolation enough for a same-repo config file that the
  // site itself ships to every visitor's browser unmodified; it is not a
  // sandbox against untrusted code, which this file is not.
  const runner = new Function('window', source);
  runner(fakeWindow);
  return fakeWindow;
}

function loadSportsConfig() {
  const fakeWindow = loadWindowAssignedScript('data/sports.js');
  const cfg = fakeWindow.FB_SPORTS_CONFIG;
  if (!cfg) throw new Error('data/sports.js did not assign window.FB_SPORTS_CONFIG — cannot continue');
  return cfg;
}

function loadStories() {
  const fakeWindow = loadWindowAssignedScript('data/stories.js');
  const stories = fakeWindow.FB_STORIES;
  if (!Array.isArray(stories)) throw new Error('data/stories.js did not assign window.FB_STORIES — cannot continue');
  return stories;
}

module.exports = { loadSportsConfig, loadStories };
