# Arble — website

The marketing site, the documentation and the Playbook for Arble, the on-device
AI operating system. Static output: no framework, no bundler, no install step to
view it. The only build in the repository generates the documentation pages.

Split out of the `arble-mobile-1.0` app repository. Nothing here imports app
code at runtime — see [Regenerating the mascot](#regenerating-the-mascot) for the
single build-time link back to it.

## Layout

```
index.html            the marketing page
playbook.html         the Playbook reader (36 chapters, rendered client-side)
styles.css            marketing styles
main.js               marketing interactions

docs.css              the documentation application (light only)
docs.js               code copy buttons + on-this-page scroll spy
docs-ui.js            drawer, reading progress, Copy page
docs-search.js        client-side search over docs/search-index.json
docs/                 27 generated pages — DO NOT EDIT, see below
docs-src/             documentation sources and design specs
_build/               the docs generator (build.py + content.py + bodies.py)

playbook-data.js              chapters 1–13 and the glossary
expanded-chapters.js          expanded chapter bodies
playbook-chapters-14-20.js    chapters 14–20
playbook-expanded-agents.js   agent chapters

assets/               images: app captures, photography, mascot, phone frame
scripts/              regeneration helpers (screenshots, mascot)
```

## Run it

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>. A server is required rather than opening
`index.html` off the filesystem: the docs use directory URLs (`/docs/agent/memory/`)
and the search index is fetched.

## Building the documentation

`docs/` is **generated**. Editing a file in there is lost on the next build.

```bash
python3 docs-build/build.py       # run from the repository root
```

Sources:

| File | Holds |
|---|---|
| `_build/content.py` | the navigation tree, page summaries, section leads |
| `_build/bodies.py` | page bodies written for the new structure |
| `docs-build/legacy-pages/*.html` | long-form pages lifted into the shared chrome |

The build writes 27 pages, 4 section indexes, a home page, `search-index.json`
and `sitemap.xml`. Bump `CSS_V` in `build.py` when `docs.css` changes so browsers
repaint.

Two further generators sit alongside it:

```bash
python3 docs-build/legal.py    # legal/{privacy,terms,security,trust,cookies}
python3 docs-build/feeds.py    # changelog.xml and blog.xml, read from the pages
```

`legal.py` holds the legal copy as content constants — edit it there, never the
generated `legal/*/index.html`. Every fact only the organisation can supply is
marked `[Organization-specific information required]` rather than guessed, and no
compliance certification is claimed anywhere.

## Design

`docs-source/design/LINEAR-SPEC.md` is the specification the documentation application is
built to: every sidebar, TOC, typography and layout value measured from Linear's
own docs, with the deviations listed and justified. Read it before changing
`docs.css` — the numbers are deliberate, not taste.

`docs-source/design/DESIGN-SYSTEM.md` covers the earlier audit and the reading-experience
rules (measure, rhythm, callout discipline, figure cadence).

Both the docs and the Playbook are **light only**. There is no dark theme, no
toggle and no `data-theme` branch.

## Regenerating the app captures

Every phone on the site is a real iPhone 17 Pro simulator capture, not a mockup.

```bash
pip install pillow
python3 scripts/convert-screenshots.py ~/Desktop
```

Screens are matched by the timestamp in the simulator's filename — see the
`SHOTS` map in that script. Output is 852px-wide WebP in `assets/`.

When you replace a capture that keeps its filename, add or bump a `?v=` query on
its `src` in `index.html`, or browsers will keep serving the cached one.

## Regenerating the mascot

`assets/mascot-*.svg` are generated from the **app repository's** sprite data, so
the mascot here and the mascot in the app are the same pixels rather than a
redrawn copy. This is the one build-time dependency on the app:

```bash
node --experimental-strip-types scripts/render-mascot.mjs ../arble-mobile-1.0
```

Requires Node 22+. The committed SVGs are what the site serves, so this only
needs running when the sprite itself changes.

## Content integrity

Product claims are counted from the app codebase, not estimated:

- **579 typed tools across 61 toolsets** — `portTool()` definitions and
  `BUILTIN_TOOLSETS` in `src/agent/tools/builtin/`.
- The logo wall carries only providers and connectors the app actually
  integrates with.
- The toolset rail names only toolsets that exist as files.

Re-count after adding or removing toolsets; the numbers appear in `index.html`
(the stat block and the proof card) and in `main.js` (the hero card).

## Known gaps

- **Contact, Privacy, Terms and Cookies** in the footer are `href="#"`. They are
  expected pages for a product site, so they were left in place rather than
  deleted — point them at real pages before launch.
- **`assets/ops-*.jpg` and `assets/daily-hand.jpg`** are AI-generated
  illustrations depicting UI that does not exist in the app (invented counters
  and badges). Replace them with real captures.
- The Playbook chapter rows in `index.html` are not links; the 35 chapter pages
  they describe do not exist as separate pages.

## Credits

`assets/hero-mountains.jpg` and `assets/proof-mountain.jpg` are black-and-white
mountain photography from **Pexels** (Pexels License, attribution appreciated).
Brand marks in the ecosystem row are [simple-icons](https://simpleicons.org)
paths (CC0-1.0).
