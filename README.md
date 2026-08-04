<p align="center">
  <img src="assets/img/brand/logo-mark.png" alt="Arble" width="200">
</p>

<h3 align="center">The website, documentation and Playbook for Arble.</h3>

<p align="center">
  A hand-written static site — no framework, no bundler, no install step.
  Marketing page, 27 documentation pages, a 35-chapter Playbook, and a
  generated legal set, served straight from this repository.
</p>

<p align="center">
  <a href="https://arble.org"><img src="https://img.shields.io/badge/live-arble.org-0A0A0B" alt="live site"></a>
  <a href="https://github.com/Arble-org/Arble-Org-Web/deployments"><img src="https://img.shields.io/badge/deploy-GitHub%20Pages-222222" alt="deploy"></a>
  <a href="#project-layout"><img src="https://img.shields.io/badge/build-static%20%C2%B7%20no%20bundler-1F6FEB" alt="build"></a>
  <a href="#building-the-documentation"><img src="https://img.shields.io/badge/generator-Python%203-3776AB" alt="python"></a>
  <a href="#responsive-support"><img src="https://img.shields.io/badge/responsive-320%E2%80%931920px-16A34A" alt="responsive"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-Proprietary-red" alt="license"></a>
</p>

---

This repository is the public face of **Arble**, the on-device AI operating system. It holds the marketing page, the full documentation application, the Playbook, the blog and changelog, and the legal set — everything served at [arble.org](https://arble.org).

There is no framework and no build step to *view* the site. Open it with any static server and it runs. The only build in the repository is a Python generator that renders the documentation, legal pages and feeds from source content, so those pages stay consistent with each other instead of drifting by hand.

Split out of the [`arble-mobile-1.0`](https://github.com/Arble-org/arble-mobile-1.0) app repository. Nothing here imports app code at runtime — see [Regenerating the Mascot](#regenerating-the-mascot) for the single build-time link back to it.

## Table of Contents

- [Quickstart](#quickstart)
- [Project Layout](#project-layout)
- [Building the Documentation](#building-the-documentation)
- [Design](#design)
- [Responsive Support](#responsive-support)
- [Deployment](#deployment)
- [Regenerating the App Captures](#regenerating-the-app-captures)
- [Regenerating the Mascot](#regenerating-the-mascot)
- [Content Integrity](#content-integrity)
- [Known Gaps](#known-gaps)
- [Credits](#credits)
- [License](#license)

## Quickstart

**Prerequisites:** Python 3 (for the local server and the docs generator). Node 22+ only if you regenerate the mascot.

```bash
git clone https://github.com/Arble-org/Arble-Org-Web.git
cd Arble-Org-Web

python3 -m http.server 8080
```

Then open <http://localhost:8080>.

A server is required rather than opening `index.html` off the filesystem: the docs use directory URLs (`/docs/agent/memory/`) and the search index is fetched over HTTP.

## Project Layout

```
index.html            the marketing page
about.html            the About page
contact.html          the Contact page
playbook.html         the Playbook reader (35 chapters, rendered client-side)
blog.html             the Blog page
changelog.html        the Changelog page
404.html              404 page

assets/
  css/                site.css (136K), docs.css (44K), about.css, contact.css
  js/                 site.js, docs.js, docs-ui.js, docs-search.js, about.js, playbook/chapters.js
  img/                about/, app/, brand/, docs/, marketing/

docs/                 27 generated pages — DO NOT EDIT, see below
docs-source/          documentation sources, legacy pages, design specs, and archive
docs-build/           the generator (build.py, content.py, bodies.py, legal.py, feeds.py)

legal/                5 generated legal pages (privacy, terms, security, trust, cookies)
scripts/              regeneration helpers (screenshots, mascot, serve.sh)

CNAME                 custom domain for GitHub Pages
.nojekyll             serve the output verbatim, do not run Jekyll
```

## Building the Documentation

`docs/` is **generated**. Editing a file in there is lost on the next build.

```bash
python3 docs-build/build.py       # run from the repository root
```

Sources:

| File | Holds |
|---|---|
| `docs-build/content.py` | the navigation tree, page summaries, section leads |
| `docs-build/bodies.py` | page bodies written for the new structure |
| `docs-source/legacy-pages/*.html` | long-form pages lifted into the shared chrome |

The build writes 27 pages, 4 section indexes, a home page, `search-index.json` and `sitemap.xml` (38 URLs). Bump `CSS_V` in `build.py` when `docs.css` changes so browsers repaint.

Two further generators sit alongside it:

```bash
python3 docs-build/legal.py    # legal/{privacy,terms,security,trust,cookies}
python3 docs-build/feeds.py    # changelog.xml and blog.xml, read from the pages
```

`legal.py` holds the legal copy as content constants — edit it there, never the generated `legal/*/index.html`. Every fact only the organisation can supply is marked `[Organization-specific information required]` rather than guessed, and no compliance certification is claimed anywhere.

`BASE_URL` in `build.py` and `BASE` in `feeds.py` set the canonical host used by the sitemap and the feeds. Both are `https://arble.org`; change them together if the domain moves.

## Design

`docs-source/design/LINEAR-SPEC.md` is the specification the documentation application is built to: every sidebar, TOC, typography and layout value measured from Linear's own docs, with the deviations listed and justified. **Read it before changing `docs.css`** — the numbers are deliberate, not taste.

`docs-source/design/DESIGN-SYSTEM.md` covers the earlier audit and the reading-experience rules (measure, rhythm, callout discipline, figure cadence).

Both the docs and the Playbook are **light only**. There is no dark theme, no toggle and no `data-theme` branch.

## Responsive Support

The site is built desktop-first and made responsive through media queries only — there is no separate mobile markup and no duplicated components.

| Breakpoint | Behaviour |
|---|---|
| `≥ 1280px` | The approved desktop design. Treat it as frozen. |
| `≤ 1180px` | Docs TOC moves above the article; single-column body. |
| `≤ 940px` | Marketing nav links collapse into a burger + slide-down drawer. |
| `≤ 900px` | Docs sidebar becomes an off-canvas drawer; TOC becomes a disclosure. |
| `≤ 700px` | Carousel shows one phone; download fan tightens; hero scales down. |
| `≤ 620px` | Footer drops to two columns; touch targets grow to 44px. |

Two cascade rules the layout depends on, both learned the hard way:

- **A media query adds no specificity.** A plain rule written *after* an `@media` block beats it. Toggles such as `.dnavbtn` and `.nav__burger` must be declared **before** the responsive section, or they compute `display:none` at exactly the widths that need them.
- **`aspect-ratio` resolves against `min-height` when the width is auto**, which can make a box wider than its container. `.band--wide` drops its ratio below 620px for this reason.

When changing anything here, verify no element's right edge exceeds the viewport at 320 / 375 / 430 / 768 / 1024 **with `body { overflow-x: hidden }` temporarily disabled** — that rule otherwise hides the failure rather than fixing it.

## Deployment

The site deploys to **GitHub Pages** from `main` at the repository root. There is no CI workflow and no build step on GitHub's side: what is committed is what is served.

- `CNAME` holds the custom domain. Pages reads it on every build.
- `.nojekyll` stops Pages running the output through Jekyll.
- `404.html` at the root is picked up automatically as the custom 404.
- HTTPS is enforced; the certificate covers the apex and `www`.

Pushing to `main` publishes. Allow a minute or so for the build, then hard-refresh — the `?v=` query strings on `site.css` / `docs.css` exist so returning visitors do not have to.

## Regenerating the App Captures

Every phone on the site is a real iPhone 17 Pro simulator capture, not a mockup.

```bash
pip install pillow
python3 scripts/convert-screenshots.py ~/Desktop
```

Screens are matched by the timestamp in the simulator's filename — see the `SHOTS` map in that script. Output is 852px-wide WebP in `assets/img/app/`.

When you replace a capture that keeps its filename, add or bump a `?v=` query on its `src` in `index.html`, or browsers will keep serving the cached one.

## Regenerating the Mascot

`assets/img/brand/mascot-*.svg` are generated from the **app repository's** sprite data, so the mascot here and the mascot in the app are the same pixels rather than a redrawn copy. This is the one build-time dependency on the app:

```bash
node --experimental-strip-types scripts/render-mascot.mjs ../arble-mobile-1.0
```

Requires Node 22+. The committed SVGs are what the site serves, so this only needs running when the sprite itself changes.

## Content Integrity

Product claims are counted from the app codebase, not estimated:

- **579 typed tools across 61 toolsets** — `portTool()` definitions and `BUILTIN_TOOLSETS` in the app's `src/agent/tools/builtin/`.
- The logo wall carries only providers and connectors the app actually integrates with.
- The toolset rail names only toolsets that exist as files.

Re-count after adding or removing toolsets; the numbers appear in `index.html` (the stat block and the proof card) and in `assets/js/site.js` (the hero card).

## Known Gaps

- **`assets/img/marketing/ops-*.jpg` and `daily-hand.jpg`** are AI-generated illustrations depicting UI that does not exist in the app (invented counters and badges). Replace them with real captures.
- The Playbook chapter rows in `index.html` are not links; the 35 chapters they describe do not exist as separate pages — the reader renders them client-side from `assets/js/playbook/chapters.js`.
- The documentation quotes `api.arble.ai`, `releases.arble.ai` and regional API hosts in its example code. Those are product endpoints, not links to this site, and were left untouched when the site moved to `arble.org`. Reconcile them once the API's own domain is settled.

## Credits

`assets/img/marketing/hero-mountains.jpg` and `proof-mountain.jpg` are black-and-white mountain photography from **Pexels** (Pexels License, attribution appreciated). Brand marks in the ecosystem row are [simple-icons](https://simpleicons.org) paths (CC0-1.0).

## License

Proprietary. © 2026 Arble. All rights reserved.
