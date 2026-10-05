# Deploying Pulp Engine

The build is a **single self-contained `index.html`** (JS and CSS inlined by
`vite-plugin-singlefile`) plus the `public/` media folder. Its base is `./`, so
the output directory works unchanged at a domain root *or* in a subdirectory —
no rebuild needed to move it.

```bash
npm ci
npm run build      # -> dist/  (index.html + img/ + audio)
```

`dist/` is ~57 MB, almost all of it story artwork and soundtracks.

---

## Option 1 — GitHub Pages (free, public)

A workflow is ready at **`deploy/github-pages.yml`**. It is parked here rather
than in `.github/workflows/` because the agent's GitHub token lacks the
`workflows` permission and the push is rejected. Activate it yourself:

```bash
mkdir -p .github/workflows
git mv deploy/github-pages.yml .github/workflows/deploy.yml
git commit -m "Enable GitHub Pages deploy"
git push
```

Then in **Settings → Pages**, set *Source* to **GitHub Actions**. (The workflow
also passes `enablement: true`, which switches Pages on by itself the first
time it runs, so this is usually a no-op.)

It builds on every push to `main`, typechecks before publishing, and can also
be run by hand from the Actions tab via `workflow_dispatch` — handy for putting
a work-in-progress story in front of someone before it merges.

Result: `https://sigooding.github.io/pulpengine/`

> **Note on the branch.** The workflow triggers on `main`. This work is on
> `arena/01a02e4b-pulpengine`, so either merge it first or add the branch to
> the `on.push.branches` list.

### Pages caveats
- **1 GB soft limit** on a published site and a 100 MB per-file cap. At 57 MB
  there is room, but adding many more soundtracks will approach it.
- `public/.nojekyll` is committed so Pages doesn't run Jekyll over the output.

---

## Option 2 — Netlify / Vercel / Cloudflare Pages

No config file needed:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

Cloudflare Pages is the best fit if the media folder keeps growing — it has no
practical size ceiling for static assets and a faster global edge.

---

## Option 3 — Anywhere at all

Because the base is relative and there is no server-side routing, `dist/` is
just static files. Copy it onto any host:

```bash
rsync -av dist/ user@host:/var/www/pulpengine/
```

A single-page app with no client-side router needs no SPA rewrite rule.

---

## Why story media needs `assetUrl()`

Stories reference art as root-absolute paths (`/img/nw2/bg-diner-int.jpg`).
Vite rewrites the paths it can *see* — imports and `index.html` — but story
media lives in plain data strings inside `src/data/*.ts` that the bundler never
inspects. Served from a subdirectory, every one of those would resolve against
the domain root and 404.

`src/assetPath.ts` fixes this at runtime by prefixing root-absolute paths with
`import.meta.env.BASE_URL`. It deliberately passes through:

- `data:` URLs — the media library resolves IndexedDB assets to these
- `blob:` URLs
- `http(s):` and protocol-relative `//host/...` URLs
- relative paths, and anything already carrying the base (it is idempotent)

**If you add a new place that consumes a media URL, wrap it in `assetUrl()`.**
The existing call sites are `bgStyle`/`plateStyle`, the background `<video>`,
foreground animation frames, avatars, item icons, story covers, and every audio
element (menu theme, scene music, narration, per-beat voice lines).
