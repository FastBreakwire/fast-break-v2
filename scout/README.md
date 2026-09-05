# Fast Break Editorial Scout (V1)

Decision-support tool, not a publisher. Every morning (or on demand) it
reads live RSS from the verified Source Matrix (`sources.js`), clusters and
scores what it finds, and writes a short, human-readable report telling you
what's worth checking today — it never touches `data/stories.js`, never
posts anything, and never runs on its own.

## Run it

```bash
npm run scout
# or
node scout/run.js
```

Output lands in `scout/output/<today's date>.md` (read this first) and
`scout/output/<today's date>.json` (full candidate data). Both are printed
to the terminal too. Neither file is committed to git by default (see
`.gitignore`) — they're daily working documents, not history.

## What it does NOT do (by design, V1 scope)

- Never writes to `data/stories.js` — every story is a human decision.
- Never posts to social media.
- Never generates images or video — only checks whether a plausible video
  source *exists* for a story (`videoSourceFound`), never whether it's
  legal to use one.
- Never touches `server/` or `highlightlyProvider.js` — this is a
  completely separate concern (editorial discovery, not live sports data).

## Optional: richer copy via the Anthropic API

By default, `whyFastBreak` and `hookSuggestion` are written by a
deterministic template (no key, no network call, always works). If you set
`ANTHROPIC_API_KEY` in `server/.env`, the enrichment stage will call the
Claude API for better-written drafts instead, falling back to the template
automatically on any failure. Check `enrichmentMode` in the JSON output
("template_fallback" or "anthropic_api") to see which one actually ran.

## Known V1 limitations (see the full spec conversation for detail)

- Only one of the 8 competitions (Bundesliga) has a real official RSS feed.
  NBA.com, NFL.com, WNBA.com, Premier League, La Liga and UEFA.com do not —
  see `DEAD_OR_UNAVAILABLE` in `sources.js`. Those competitions are only
  reachable through the general/combined tier-2 feeds (ESPN, Sky, CBS,
  Yahoo) plus keyword matching, which is structurally weaker.
- League/team tagging only recognizes the curated team list already in
  `data/sports.js` (`TEAMS_CFG`) — a team not in that list won't be tagged,
  even if a story about it is real and important.
- Player-name extraction is a plain capitalized-word-pair heuristic, not
  real name recognition — expect both misses and occasional wrong guesses.
- `videoSourceFound` only checks for an already-linked video signal on the
  primary source's own article — it does not search the wider web for
  clips. A `false` here means "none found in this article", not "no video
  exists anywhere".
- Individual insiders (Tier 3) are not polled directly (no public RSS, no
  paid X/Twitter API in scope) — their scoops reach the Scout only once a
  Tier-2 outlet reports them, typically within minutes to a few hours.
