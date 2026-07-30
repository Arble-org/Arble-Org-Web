# Arble Documentation — Design System

Design specification for the documentation reading experience.
Brand and information architecture are out of scope and unchanged.

---

## 1. Design audit

This is an audit of the current build, not a generic critique. Every number below was measured from the live pages.

### 1.1 The measurements

| Property | Current value | Target | Verdict |
|---|---|---|---|
| Prose measure | **83 characters/line** | 66–72 | Fails |
| Content column | 658px at 15.5px | 640–680px at 16px | Font too small for the width |
| Body size / leading | 15.5px / 27.125px (1.75) | 16px / 28px | Half-pixel size, no grid |
| Body colour | `#4B5563` | token `--ink-2` | **Not using the palette** |
| H1 / H2 / body | 38.4 / 21.76 / 15.5px | coherent ratio | Ratios 1.76, 1.40 — arbitrary |
| Distinct spacing values | **62** | 9 | Fails badly |
| Prose max-width | 720px (set) | — | Set, but too wide for 15.5px |
| Sidebar / TOC | 210px / 190px | 240px / 220px | Cramped |
| Gutters | `clamp(28px, 4vw, 64px)` | fixed 48px | Fluid gutters break rhythm |

### 1.2 Why it reads as amateur

**The measure is wrong, and it is the single biggest defect.** 83 characters per line is roughly a third longer than the readable range. The eye loses its return point on every line, so reading feels effortful in a way the reader attributes to the writing rather than the layout. Stripe, Anthropic and Apple all sit between 62 and 75. This one number explains most of the "feels like a webpage with text" complaint.

**Body text is not using the design tokens.** The palette defines `--ink-2: #6C7075`, a true neutral. Prose is hardcoded to `#4B5563`, which is Tailwind's `gray-600` — a *blue*-tinted grey imported from a different system. On a pure-white page next to genuinely neutral UI chrome, that cool cast is subtly visible and reads as inconsistency even to someone who cannot name it. It also means the palette is not the source of truth, which is the deeper problem.

**There is no type scale, only a list of sizes.** 39, 23, 19, 16.5, 15.5, 14.5, 13, 12.5. The half-pixel values are the tell: they were nudged until each looked right in isolation, rather than derived. The consequence is that no two levels feel *related* — hierarchy is asserted by size difference alone, with no ratio the eye can learn. Apple's documentation is legible at a glance precisely because its scale is memorable.

**Spacing is 62 arbitrary values, so there is no rhythm to perceive.** Rhythm is repetition. When `h2` sits at `46px`, `h3` at `30px`, and paragraphs at `18px`, none of which are multiples of a common unit, the vertical pacing is noise. The reader cannot subconsciously predict where the next section begins, which is what makes professional documentation feel calm.

**Heading space is symmetric, so headings float.** A heading needs far more space above than below — it must attach visually to the content it introduces and detach from what precedes it. Currently `h2` has `46px` above and `14px` below (3.3:1, close to right by accident), but `h3` has `30px`/`10px` and paragraphs `0`/`18px`, so the relationship is inconsistent across levels.

**Every element is the same width, so the page has no texture.** Prose, code, tables and callouts all occupy one 658px column. The page becomes a single grey ribbon. Stripe's most copied move is the opposite: narrow prose, wider code and tables. That contrast alone creates rhythm without any decoration.

**Code blocks are styled as containers, not as code.** No language badge, no terminal treatment, no line highlighting, and an always-visible copy button that content slides under when a line is long. The `76px` right padding is a workaround for that collision rather than a solution.

**Tables have no typographic hierarchy.** Header cells are not visually distinct enough from body cells, so scanning a table requires reading it.

**Fluid gutters fight the grid.** `clamp(28px, 4vw, 64px)` means column relationships change continuously as the window resizes. A documentation grid should snap between defined layouts, not drift.

### 1.3 What each benchmark actually does better

| Product | Excels at | The specific lesson |
|---|---|---|
| **Stripe** | Two-width layout | Prose narrow, code and tables wider. Creates rhythm with zero ornament. |
| **Apple Developer** | Type scale discipline | A small, memorable scale applied without exception; deep hierarchy stays legible. |
| **Linear** | Craft of small states | Sidebar hover, active markers, restraint. Nothing is decorated; everything is precise. |
| **Anthropic** | Reading comfort | Generous measure and leading; callouts used sparingly enough to still mean something. |
| **Vercel** | Information density | Tables and reference material that stay scannable at high density. |
| **Cloudflare** | Navigable scale | Thousands of pages that never feel lost — breadcrumbs and sidebar do real work. |
| **Cursor** | Code-first pages | Chrome recedes; the example is the content. |
| **Arc** | Motion timing | Short, eased, purposeful. Motion confirms actions rather than performing. |

---

## 2. Design philosophy

Five principles. Every later decision derives from these.

**The page is a reading instrument.** Its job is to disappear. Any element that draws attention to itself rather than to the content is a defect, however attractive.

**Rhythm over decoration.** Perceived quality in documentation comes from predictable vertical pacing and consistent measure — not from colour, shadow or illustration. Fix the rhythm and the page reads as premium with almost no visual styling.

**Monochrome by default; hue is a signal.** The brand is neutral. Colour must therefore *mean* something: reserve it exclusively for semantic state (warning, danger, success). Seven differently coloured callouts would destroy the value of all seven.

**Two widths, not one.** Prose is constrained for readability (measured against Switzer: 8.16px average glyph at 16px). Code, tables and figures are allowed to be wider because they are scanned, not read linearly. This is the highest-leverage change available.

**Density is a feature for the second read.** A first-time reader wants air. A returning reader wants everything visible at once. Resolve this with hierarchy and scannability, not by removing content.

---

## 3. Typography system

### 3.1 Families

| Role | Stack |
|---|---|
| Display | `Stack Sans Headline`, `Switzer`, `-apple-system`, `BlinkMacSystemFont`, `system-ui`, sans-serif |
| Text | `Switzer`, `-apple-system`, `BlinkMacSystemFont`, `system-ui`, `Segoe UI`, sans-serif |
| Mono | `ui-monospace`, `SF Mono`, `SFMono-Regular`, `JetBrains Mono`, `Menlo`, `Consolas`, monospace |

Display is for H1 and H2 only. Below that, the text family carries better at small sizes. The current build uses display down to H3, which is why H3 reads slightly mannered.

Enable `font-variant-numeric: tabular-nums` on all tables, code, and version strings.

### 3.2 The scale

Anchored at 16px body on a **4px baseline**. Every line-height is a multiple of 4. No half-pixel sizes anywhere.

| Token | Size | Line | Ratio to body | Weight | Tracking | Use |
|---|---|---|---|---|---|---|
| `display` | 40px | 44px | 2.50 | 600 | −0.030em | Page H1 |
| `h2` | 26px | 32px | 1.63 | 600 | −0.020em | Section |
| `h3` | 19px | 28px | 1.19 | 600 | −0.012em | Subsection |
| `h4` | 16px | 24px | 1.00 | 650 | −0.006em | Minor heading |
| `body` | 16px | 28px | 1.00 | 400 | 0 | Prose |
| `body-sm` | 14px | 22px | 0.88 | 400 | 0 | Captions, table cells, meta |
| `micro` | 12px | 16px | 0.75 | 600 | +0.060em | Eyebrows, badges, labels (uppercase) |
| `code-inline` | 0.875em | inherit | — | 450 | 0 | Inline code |
| `code-block` | 13.5px | 22px | — | 400 | 0 | Code blocks |

Rationale for the jumps: `display → h2` is a large, deliberate break because H1 appears once. `h2 → h3 → h4` tightens (1.37, 1.19) so nested structure stays calm. `h4` matches body size and separates by weight alone — the Apple move, and it prevents deep hierarchy from inflating.

### 3.3 Component typography

| Component | Size / Line | Weight | Tracking | Colour |
|---|---|---|---|---|
| Page title | 40/44 | 600 | −0.030em | `--ink` |
| Page description | 18/28 | 400 | −0.005em | `--ink-2` |
| Paragraph | 16/28 | 400 | 0 | `--ink-body` (new token, see 3.4) |
| Lead paragraph | 18/30 | 400 | −0.005em | `--ink-2` |
| Breadcrumb | 13/20 | 450 | 0 | `--ink-3`, last crumb `--ink-2` |
| Sidebar section label | 12/16 | 600 | +0.060em, uppercase | `--ink-3` |
| Sidebar item | 13.5/20 | 450 | 0 | `--ink-2`; active `--ink` at 550 |
| TOC item | 13/20 | 450 | 0 | `--ink-3`; active `--ink` at 550 |
| Table header | 12/16 | 600 | +0.060em, uppercase | `--ink-3` |
| Table cell | 14/22 | 400 | 0 | `--ink-body` |
| Table first column | 14/22 | 550 | 0 | `--ink` |
| Caption | 13/20 | 400 | 0 | `--ink-3` |
| Callout title | 14/20 | 600 | 0 | `--ink` |
| Callout body | 15/24 | 400 | 0 | `--ink-body` |
| Blockquote | 18/30 | 400 | −0.005em | `--ink-2`, italic off |
| Badge / tag | 12/16 | 600 | +0.040em | contextual |
| Button | 14/20 | 550 | 0 | contextual |
| Code language badge | 11/16 | 600 | +0.080em, uppercase | `--ink-3` |

### 3.4 One new colour token

Add `--ink-body: #3F4247`.

This replaces the hardcoded `#4B5563`. It is a true neutral consistent with the existing ramp, and at **9.1:1** on white it exceeds AAA with headroom. `--ink-2` (`#6C7075`, 4.86:1) stays for secondary text but is too light for sustained body copy.

### 3.5 Measure and reading width

| Element class | Max width | Measure at 16px |
|---|---|---|
| **Prose** (p, list, blockquote, h3, h4) | **580px** | ~71 characters |
| **Wide** (code, table, figure, callout, card grid) | **880px** | — |
| H1, H2, page description | 880px | — |

This is the structural change. Prose is optically centred within the wide column — left-aligned to the same origin, simply stopping earlier. Code and tables extend 216px further right. The resulting silhouette *is* the rhythm.

---

## 4. Spacing system

### 4.1 Scale

4px base. **Nine steps.** These nine replace all 62 current values.

| Token | Value | Primary use |
|---|---|---|
| `s1` | 4px | Icon-to-label, badge padding |
| `s2` | 8px | Tight stacks, list item gaps |
| `s3` | 12px | Table cell vertical, sidebar item vertical |
| `s4` | 16px | Paragraph gap, callout padding |
| `s5` | 24px | Code/table block separation |
| `s6` | 32px | H3 above, figure separation |
| `s7` | 48px | H2 above, section separation |
| `s8` | 64px | Page header to body |
| `s9` | 96px | Page top/bottom, major breaks |

### 4.2 Vertical rhythm rules

**The asymmetry rule: space above a heading is 3× the space below it.** This is the mechanism that binds a heading to its content. Apply without exception.

| Relationship | Above | Below | Ratio |
|---|---|---|---|
| H2 | 48px (`s7`) | 16px (`s4`) | 3.0 |
| H3 | 32px (`s6`) | 12px (`s3`) | 2.7 |
| H4 | 24px (`s5`) | 8px (`s2`) | 3.0 |
| Paragraph → paragraph | — | 16px (`s4`) | — |
| Code block | 24px | 24px | 1.0 |
| Table | 24px | 24px | 1.0 |
| Callout | 24px | 24px | 1.0 |
| Figure | 32px | 32px (caption 8px) | 1.0 |
| Blockquote | 32px | 32px | 1.0 |
| List | 16px | 16px (items 8px) | 1.0 |
| Nested list | 8px | 8px (indent 20px) | — |
| Page header → first section | 64px (`s8`) | — | — |
| Prev/Next footer | 96px (`s9`) above | — | — |

Non-prose blocks are symmetric because they interrupt rather than introduce. Headings are asymmetric because they introduce.

**Two consecutive headings** (H2 immediately followed by H3) collapse to 20px between them — never the full 32px, which would leave a hole.

---

## 5. Layout grid

### 5.1 Desktop, ≥1280px

```
│← 48 →│ sidebar 240 │← 48 →│ content 880 │← 48 →│ TOC 220 │← 48 →│
                                ↳ prose constrained to 664
```

Total content box 1280px, centred, with 48px page padding. Gutters are **fixed at 48px** — no `clamp()`. Layouts snap; they do not drift.

### 5.2 Breakpoints

| Range | Layout |
|---|---|
| ≥1440px | Three columns; page padding grows to 64px, columns unchanged |
| 1280–1439px | Three columns as specified |
| 1024–1279px | Two columns: sidebar 240 + content. TOC moves inline under the page header, collapsed |
| 768–1023px | One column. Sidebar becomes a drawer behind a menu control. Prose max-width 664px |
| <768px | One column, 20px page padding. Prose fills width. See §13 |

### 5.3 Vertical structure

Page top padding 96px (`s9`) on desktop, 48px on mobile. Bottom padding 96px before the footer. Sidebar and TOC are sticky at `top: 88px` (nav height 64px + 24px breathing room), each with independent overflow.

---

## 6. Sidebar specification

Width **240px** (from 210px — the current width forces two-line wraps on items like "System Requirements").

**Structure.** Search field, then section groups. Each group: an uppercase micro label, then items.

| Element | Spec |
|---|---|
| Search field | Height 34px, radius 8px, 13.5px text, `--surface-2` fill, 1px `--line` border. On focus: `--paper` fill, `--ink-3` border, no glow |
| Section label | 12/16, 600, +0.060em, uppercase, `--ink-3`. 32px above, 8px below. First label 0 above |
| Item | 13.5/20, 450, `--ink-2`. Padding 6px 10px. Radius 6px |
| Item hover | Background `--surface-2`. Text `--ink`. 120ms |
| Item active | Text `--ink` at 550. Background `--surface-2`. 2px `--ink` bar at inset-inline-start, full item height, radius 1px |
| Nested item | Indent 12px, 13/20. Nesting stops at depth 2 |
| Item vertical gap | 2px |
| Group gap | 32px |

**Collapse.** Groups are expandable, chevron 14px at the trailing edge, rotating 90° over 160ms. The group containing the current page is always expanded and cannot be collapsed shut. State persists per visitor. Default: current section expanded, others collapsed once the tree exceeds ~40 items.

**Scroll.** Independent overflow with `overscroll-behavior: contain`. Scrollbar 4px wide, thumb `--ink-4`, track transparent, visible only on hover of the sidebar. On load, scroll the active item into view if outside the viewport — without animation.

**Sticky.** `top: 88px`, `max-height: calc(100vh - 112px)`.

**What the sidebar must never do:** show a hierarchy where items are not links. That was the defect fixed in the current build and it is worth restating as a rule — a non-navigable tree item is worse than an absent one.

---

## 7. Table of contents specification

Width **220px**. Sticky at `top: 88px`, `max-height: calc(100vh - 112px)`, independent scroll.

| Element | Spec |
|---|---|
| Label | "On this page" — 12/16, 600, +0.060em, uppercase, `--ink-3`. 12px below |
| H2 item | 13/20, 450, `--ink-3`. Padding 5px 0 5px 12px |
| H3 item | 13/20, 450, `--ink-4`. Padding 5px 0 5px 24px |
| Active | `--ink` at 550 |
| Rail | 1px `--line` on the inline-start edge, full list height |
| Active marker | 2px `--ink`, item height, overlaying the rail |
| Depth | H2 and H3 only. Never H4 |

**Scroll spy.** IntersectionObserver with `rootMargin: -88px 0px -66% 0px`. The topmost heading inside that band is active; if none is intersecting, the last one scrolled past stays active so the marker never disappears between headings. Marker position transitions 160ms; text colour 120ms.

Hide the TOC entirely when a page has fewer than three H2s — a two-item TOC is furniture, not navigation.

---

## 8. Content rhythm guide

The most important section, and the hardest to enforce because it constrains writing, not styling.

### 8.1 The cadence rule

**Never more than three consecutive paragraphs.** After three, insert a non-prose element. In practice this means **a visual or structural interruption every 150–250 words**.

Target composition for a documentation page: roughly **60% prose, 40% non-prose** by vertical space.

### 8.2 Element vocabulary, in order of preference

1. **Code block** — the strongest interruption. Prefer it wherever an instruction can be shown rather than described.
2. **Table** — for anything with two or more parallel dimensions. Converting a bulleted list of "X does Y" into a two-column table is almost always an upgrade.
3. **Callout** — for the one thing on the page that will otherwise be missed. One or two per page maximum.
4. **Figure** — for spatial or architectural relationships that prose describes poorly.
5. **Checklist** — for sequences the reader will perform while reading.
6. **Card grid** — for navigation, never for content.
7. **Bulleted list** — the weakest interruption; it is still prose in a hat. Use when items are genuinely unordered and short.

### 8.3 A model page shape

```
Page header (title, description, meta)
Lead paragraph                          ← 1 paragraph, sets scope
H2  Concept
    2 paragraphs
    Figure                              ← spatial model
    1 paragraph
H2  Doing it
    1 paragraph
    Code block                          ← the canonical example
    1 paragraph explaining the non-obvious line
    Callout (warning)                   ← the failure mode
H2  Options
    1 paragraph
    Comparison table
    2 paragraphs
    Code block                          ← the variant
H2  Reference
    Table
H2  FAQ
    Accordion
Prev / Next
```

### 8.4 Anti-patterns to remove

- Six consecutive paragraphs under one heading — split with a table or code.
- A bulleted list where every item is `**Term.** Sentence.` — that is a two-column table.
- Two callouts adjacent — merge, or demote one to prose.
- A code block with no sentence after it — always explain the non-obvious line.
- A heading with a single paragraph beneath it — the heading is doing no work; merge upward.

---

## 9. Code block specification

### 9.1 Base

| Property | Value |
|---|---|
| Max width | 880px (wide class) |
| Radius | 10px |
| Border | 1px `--line-2` |
| Background | `#FCFCFD` (light) — barely off-white, so the block reads as inset without becoming a grey slab |
| Padding | 16px 20px; **20px 20px 20px** when a header bar is present |
| Font | 13.5px / 22px mono, weight 400 |
| Tab size | 2 |
| Max height | 480px, then vertical scroll with a 24px bottom fade mask |
| Selection | `--ink` at 12% |

### 9.2 Header bar

Present whenever the block has a language, a filename, or a copy affordance. Height 36px, 1px bottom border `--line`, background `--surface-2` at 50%.

- **Language badge** — leading edge, 11/16, 600, +0.080em, uppercase, `--ink-3`.
- **Filename** — replaces the badge when supplied. 12.5px mono, `--ink-2`.
- **Copy button** — trailing edge. 28×28px, radius 6px, icon 14px. Opacity 0 by default, 1 on block hover or keyboard focus; **always 1 on touch devices**. On success, swap to a check icon for 1200ms; do not change width (reserve it) or the block will shift.

The header bar solves the current collision: with a bar, the code area needs no asymmetric 76px right padding.

### 9.3 Variants

**Terminal.** `$` prompt in `--ink-4`, `user-select: none` so copying yields only the command. Output lines in `--ink-2`. No syntax highlighting on output.

**Diff.** 20px gutter column. Added lines: `+` in a green at 10% background tint. Removed: `−` at 10% red. Unchanged lines carry no tint. Tint only — never colour the text itself, which destroys legibility.

**Line highlight.** 2px `--ink` bar at the inline-start edge plus `--ink` at 4% background on highlighted lines. No border, no outline.

**Line numbers.** Off by default. On only when the surrounding prose refers to line numbers. `--ink-4`, `user-select: none`, 32px right margin.

### 9.4 Practices

- **Wrap policy.** Keep every line ≤ 84 characters so no block scrolls horizontally at desktop width. Break long shell commands with `\` continuations — a horizontally scrolling code block hides content the reader does not know is there.
- Syntax highlighting: **four roles maximum** — keyword, string, comment, everything else. A twelve-colour theme fights a monochrome brand. Comments at `--ink-3`, strings at one restrained hue, keywords by weight (550) rather than colour where possible.
- Never put two code blocks adjacent without prose between them.
- Multi-language examples use tabs in the header bar, not stacked blocks.

---

## 10. Table specification

| Property | Value |
|---|---|
| Max width | 880px |
| Header cell | 12/16, 600, +0.060em, uppercase, `--ink-3`. Padding 0 16px 10px. No fill |
| Header border | 1px `--line-2` bottom only |
| Body cell | 14/22, `--ink-body`. Padding 12px 16px |
| First column | 550 weight, `--ink` |
| Row separator | 1px `--line`, bottom. Last row none |
| Vertical borders | **None** |
| Zebra striping | **None** — hairlines are cleaner and read as more modern |
| Row hover | Background `--surface` , 120ms. Only on tables with 4+ rows |
| Numeric columns | Right-aligned, `tabular-nums` |
| First/last cell | Zero outer inline padding, so the table aligns to the text column |

**Responsive.** Wrap in a horizontally scrollable container. When scrollable, apply a 32px fade mask on the overflowing edge and set `tabindex="0"` with an accessible name so keyboard users can scroll it. Never restructure a table into stacked cards — it destroys the comparison the table exists to enable.

**When not to use a table.** Two columns where the second is a full sentence per row is usually a definition list. Tables are for comparison; if there is nothing to compare across rows, prose or a list is better.

---

## 11. Callout specification

### 11.1 Structural base, shared by all types

| Property | Value |
|---|---|
| Max width | 880px |
| Radius | 10px |
| Padding | 14px 16px 14px 44px |
| Icon | 16px, positioned 16px from the inline start, 16px from top, 1.5 stroke |
| Title | 14/20, 600, `--ink`. Optional; omit for single-sentence callouts |
| Body | 15/24, `--ink-body`. First child no top margin, last child no bottom margin |
| Border | 1px full border in the type's line colour |
| Background | Type's tint |
| Margin | 24px above and below |

### 11.2 The seven types

The critical decision: **four are neutral, three carry hue.** In a monochrome system, colour must remain a signal. Neutral callouts differ by icon and label only — which is sufficient, because the label states the type in words.

| Type | Icon (Lucide) | Border | Background | Accent |
|---|---|---|---|---|
| **Note** | `info` | `--line-2` | `--surface` | `--ink-3` icon |
| **Info** | `circle-help` | `--line-2` | `--surface` | `--ink-3` icon |
| **Tip** | `lightbulb` | `--line-2` | `--surface` | `--ink-2` icon |
| **Best practice** | `check-check` | `--ink` at 14% | `--surface-2` | `--ink` icon, 2px inline-start bar |
| **Success** | `circle-check` | `#1A7F4B` at 22% | `#1A7F4B` at 5% | `#1A7F4B` icon |
| **Warning** | `triangle-alert` | `#9A6400` at 24% | `#9A6400` at 6% | `#9A6400` icon |
| **Danger** | `octagon-alert` | `#B4232A` at 24% | `#B4232A` at 5% | `#B4232A` icon |

Hues are desaturated deliberately so they sit inside a monochrome page without shouting. Text inside a coloured callout stays `--ink-body` — never the accent hue, which would reduce contrast for no benefit.

### 11.3 Usage discipline

- **One or two per page.** A page with six callouts has taught the reader to skip them.
- **Danger** is for irreversible data loss or an outage. Nothing else.
- **Warning** is for a real trap with a real cost.
- Never open a page with a callout — it displaces the lead paragraph that establishes scope.
- Never nest a callout inside a callout, a table cell, or a list item.

---

## 12. Figure placement guide

### 12.1 Cadence

**One figure every 2–3 H2 sections**, or roughly every 500–700 words. A page with no figure feels like a wall; a page with a figure per section feels like a brochure.

### 12.2 Where figures earn their place

| Insert a figure when explaining | Because prose is weak at |
|---|---|
| System architecture, component relationships | Simultaneity — showing four things that coexist |
| A lifecycle or state machine | Ordered transitions and their branches |
| A layout, grid, or spatial arrangement | Position |
| A before/after transformation | Direct comparison |
| A hierarchy or containment relationship | Nesting depth |

**Do not** illustrate: a list of features, a sequence of commands, anything already a table, or a concept purely to break up text. A decorative figure costs the reader trust in every other figure.

### 12.3 Style

Aspect ratio **16:9**, always. Max width 880px. Radius 12px, 1px `--line` border. Caption 13/20 `--ink-3`, 8px below, left-aligned to the figure.

Rendering direction:

- Apple keynote product-render language: matte surfaces, frosted translucent glass planes, layered depth.
- **Strictly monochrome** — white, greys, near-black. No brand hue, no gradient washes, no colour accents.
- Editorial lighting: single soft source upper-left, long soft contact shadows, subtle rim light on glass edges.
- Industrial-design precision: real materials, physically plausible thickness, no flat-vector illustration.
- Labels in a light monospace at small size, sparse.
- Generous negative space; the subject occupies roughly 60% of the frame.
- Never: colourful marketing illustration, isometric cartoons, gradient blobs, 3D character mascots, stock photography.

Dark-mode variants required for any figure with a light background — a white figure on a dark page is a hole.

---

## 13. Responsive system

### 13.1 Desktop ≥1280px

Three columns as §5.1. Both rails sticky and independently scrollable.

### 13.2 Tablet 1024–1279px

Two columns: sidebar 240px + content. **TOC relocates** to a collapsed disclosure directly under the page header, labelled "On this page", closed by default. Prose 580px, wide elements fill the remaining column.

### 13.3 Tablet 768–1023px

Single column. Sidebar becomes an off-canvas drawer, 300px wide, sliding from the inline start over 200ms with a scrim at `--ink` 32%. Triggered by a menu control in the sticky header. Closes on: selection, scrim click, Escape. Focus is trapped while open and returns to the trigger on close.

### 13.4 Mobile <768px

| Adjustment | Value |
|---|---|
| Page padding | 20px |
| Prose | Full width |
| H1 | 32/36 |
| H2 | 22/28 |
| Body | 16/28 — **do not reduce**; 16px is the minimum comfortable reading size and prevents iOS input zoom |
| Section spacing (`s7`) | 40px |
| Page top/bottom | 48px |
| Code block padding | 14px 16px |
| Code font | 13px / 21px |
| Code header bar | Copy button always visible |
| Tables | Horizontal scroll with fade mask; never restructured |
| TOC | Collapsed disclosure under the header |
| Prev/Next | Stacked full-width cards |

Tap targets minimum 44×44px throughout.

---

## 14. Accessibility checklist

### 14.1 Contrast, measured on `--paper` (#FFFFFF)

| Token | Hex | Ratio | Rating | Permitted use |
|---|---|---|---|---|
| `--ink` | `#121212` | 18.9:1 | AAA | Headings, active states |
| `--ink-body` | `#3F4247` | 9.1:1 | AAA | Body prose |
| `--ink-2` | `#6C7075` | 4.86:1 | AA | Secondary text ≥14px |
| `--ink-3` | `#A2A5AB` | 2.62:1 | **Fails** | **Decorative only** — labels ≥12px bold, icons, rails. Never prose |
| `--ink-4` | `#C9CBCF` | 1.72:1 | Fails | Borders and rails only. Never text |

`--ink-3` at 2.62:1 does not meet AA for text. It is acceptable for uppercase micro labels only because those are supplementary and duplicated by structure — but any sentence a reader must read requires `--ink-2` or darker. Audit existing captions against this.

### 14.2 Keyboard

- Visible focus on every interactive element: 2px `--ink` outline, 2px offset, 4px radius. Never remove without an equivalent replacement.
- Skip-to-content link, first in tab order, visible on focus.
- Sidebar drawer traps focus while open; returns focus to the trigger on close.
- Scrollable code blocks and tables are focusable with an accessible name.
- `/` focuses search; Escape closes results and returns focus to the input.
- Search results navigable with arrow keys, selectable with Enter.
- Heading anchor links reachable by keyboard, not hover-only.

### 14.3 Structure

- One H1 per page. No skipped levels (never H2 → H4).
- Headings describe content; they are not styling hooks.
- `<nav>` landmarks with distinct accessible names for sidebar, TOC, and prev/next.
- Tables use `<th>` with `scope`. Layout tables never.
- Code blocks in `<pre><code>` with a language class.
- Figures use `<figure>`/`<figcaption>`; the caption is not a substitute for alt text.
- Every figure has alt text describing what it *shows*, not that it is a diagram.

### 14.4 Motion

Under `prefers-reduced-motion: reduce`: remove all transform and opacity transitions, disable smooth scrolling, make the TOC marker jump rather than slide, open the drawer without sliding. Retain instant state changes — reduced motion means no animation, not no feedback.

### 14.5 Other

- Text scales to 200% without loss of content or function.
- Nothing conveyed by colour alone — callout types carry an icon and a word.
- Copy button announces success via `aria-live="polite"`.
- Dark mode meets the same ratios against its own background.

---

## 15. Motion specification

| Interaction | Duration | Easing | Property |
|---|---|---|---|
| Hover (text, background) | 120ms | `ease-out` | colour, background |
| Card hover lift | 160ms | `cubic-bezier(.22,.61,.36,1)` | transform 2px, border-colour |
| Fade in (search results) | 160ms | `ease-out` | opacity, translateY 4px |
| TOC active marker | 160ms | `cubic-bezier(.22,.61,.36,1)` | transform |
| Sidebar chevron | 160ms | `ease-out` | rotate 90° |
| Drawer open/close | 200ms | `cubic-bezier(.32,.72,0,1)` | transform |
| Anchor scroll | 300ms | `ease-in-out` | scroll position |
| Copy confirmation | 1200ms hold | — | icon swap |
| Accordion | 200ms | `ease-out` | height, opacity |

Nothing exceeds 300ms except the copy confirmation hold. No spring overshoot, no bounce, no staggered entrances, no scroll-triggered reveals in documentation — a reader scrolling back to re-read must not re-watch an animation.

---

## 16. Final recommendations

Ordered by impact per unit of effort. The first three deliver most of the perceived change.

**1. Constrain prose to 580px and raise body to 16/28.** Fixes the 83-character measure. Single highest-impact change available; touches two declarations.

**2. Introduce the two-width layout — prose 580px, wide elements 880px.** Requires widening the docs container to 1520px; the 1240px marketing shell cannot fit it. Creates rhythm structurally, with no new visual styling. This is what will make it read as Stripe.

**3. Replace 62 spacing values with the nine-step scale, and apply the 3:1 heading asymmetry.** Converts vertical pacing from noise into rhythm.

**4. Add `--ink-body: #3F4247` and remove the hardcoded `#4B5563`.** Restores the palette as the single source of truth and removes the imported blue cast.

**5. Rebuild the type scale on the 4px baseline.** Eliminate every half-pixel size. Restrict the display family to H1 and H2.

**6. Add code block header bars** with language badge and hover-revealed copy. Removes the asymmetric-padding workaround and the content/button collision.

**7. Re-typeset tables** — uppercase micro headers, hairline separators, no zebra, medium first column.

**8. Rationalise callouts to seven types, four neutral.** Reserve hue for semantic state only.

**9. Widen sidebar to 240px and TOC to 220px**, fix gutters at 48px, and add the active-item bar treatment.

**10. Audit content against the cadence rule.** Any run of four or more consecutive paragraphs becomes a table, code block, or figure. This is editorial work, not design work, and it is where the remaining gap to Stripe lives.

### What deliberately does not change

Brand, logo, colour palette (one addition), navigation structure, URL layout, and the content itself. The audit found the architecture sound — the defects are typographic and rhythmic, which is why the fix is a design system rather than a rebuild.
