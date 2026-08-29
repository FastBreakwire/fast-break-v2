# Fast Break — Website (V2)

The Fast Break sports news site. This repo contains **only the website**.
The mobile app lives in its own repo and is not touched from here.

```
index.html              the site — markup, styles and app logic in one file
data/
  sports.js             sport / league / team configuration
  stories.js            central story data — THIS is where you publish news
server/
  api.js                Fast Break API layer (the only thing the browser calls)
  highlightlyProvider.js Highlightly adapter — the one file that knows their format
  models.js             normalized Game / Standing / Team / Player models
  .env.example          server configuration template
assets/                 editorial images
```

## Running it

Open `index.html` in a browser. The data files load as classic scripts, so this
works from the filesystem — no build step, no bundler.

For live scores you also need the API layer:

```bash
cp server/.env.example server/.env     # add HIGHLIGHTLY_API_KEY
node server/api.js                     # http://localhost:3000
```

Without a key the API answers with clearly-flagged demo data and the site
falls back to its own demo set. Nothing breaks, and no invented results appear.

## Publishing a story

Append one object to the array in `data/stories.js`. That is the whole
workflow — the site sorts it into the right league, newest first.

```js
{
  id:        'epl-example-2026-08-28',   // unique, include the date
  sport:     'football',                 // basketball | football | americanfootball
  league:    'epl',                      // nba | wnba | nfl | epl | laliga | bundesliga
  category:  'transfer',                 // transfer | signing | results | roster |
                                         // contract | legal | league | standings | fixtures
  status:    'confirmed',                // confirmed | report | scheduled
  headline:  '…',
  summary:   '…',
  source:    'Club (official)',
  publishedAt: '2026-08-28',             // YYYY-MM-DD
  image:     null,                       // URL, or null
  video:     null                        // local MP4 path, or null
}
```

**Status is not decoration.** `confirmed` means official or on the record.
Single-insider reporting is `report`. Anything that has not happened yet is
`scheduled`. Getting this wrong is how a wire loses its credibility.

**Leave `image` and `video` as `null` unless you have a rights-cleared asset.**
A card without an image looks fine. A card with a borrowed one is a problem.

Never invent a source or a timestamp.

## Architecture

```
Browser → /api/games → highlightlyProvider → Highlightly
```

The Highlightly key is read from `HIGHLIGHTLY_API_KEY` in the server process
and never reaches the browser. Everything above the adapter consumes the
normalized models in `server/models.js`, so changing provider means writing a
sibling adapter — the score UI does not change.

## Known gaps

- **Football club logos are missing.** ESPN keys soccer clubs by internal
  numeric ids that could not be verified, so those rows carry `logo: null` and
  render a lettermark instead of a guessed URL. Add verified asset URLs to
  `data/sports.js` to complete them.
- **NBA/WNBA/NFL logos hotlink ESPN's CDN.** Real and stable, but third-party.
  Replace with licensed, self-hosted files before production.
- **Highlightly endpoints are unverified.** The paths and field reads in
  `highlightlyProvider.js` are written against Highlightly's documented shape
  but have never run against a live account. Run one request per sport and
  correct the four `map*` functions; nothing outside that file needs to change.
- **Scores are demo data** for every league until a key is configured.
