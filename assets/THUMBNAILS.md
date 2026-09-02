# Editorial thumbnail variants

Every editorial photo used by a story in `data/stories.js` has a matching
`<name>-thumb.webp` file next to it — a 184×184 WebP, center-cropped, quality
82. `thumbAssetUrl()` in `index.html` derives this filename automatically
from the story's own `image:` field (`assets/foo.jpg` → `assets/foo-thumb.webp`);
nothing per-story to configure.

184px = 2× the 92px News Card thumbnail width (the most common place a story
photo renders), so it stays sharp on Retina without being the 1024px
original. The same file is reused for the rail-item (64px) and search-result
(52px) thumbnails — all smaller than 184px, so one shared size covers all
three.

Big Story and the Article Hero are unaffected: they keep loading the
full-size original directly (`assetUrl(s.image)`, not this file) — that
context is large enough (~577–620px) for the 1024px source to still be the
right asset.

## Regenerating a thumbnail

When a new story image is added to `assets/`, generate its thumbnail the
same way:

```bash
convert "<name>.jpg" -resize 184x184^ -gravity center -extent 184x184 -strip -quality 82 "<name>-thumb.webp"
```

(`.png` sources work identically — `convert` picks the format from each
file's own extension automatically.) Without a matching `-thumb.webp` file,
`thumbAssetUrl()` still resolves to that (missing) path — the News Card
thumbnail 404s rather than silently falling back to the full-size image, so
a missing thumbnail is immediately visible instead of quietly costing
1024px again.
