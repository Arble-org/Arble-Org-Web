# Linear Docs — measured component specification

Source of truth for the Arble documentation application shell.

Every value in §1–§9 was **measured**, not estimated, from `linear.app/docs/start-guide`
at 1440px and 1600px viewport width: `getComputedStyle` on the live DOM plus the
declarations fetched from Linear's own stylesheets (their CSS custom properties are
quoted verbatim where they exist).

**Scope rules for this spec**

- Copied from Linear: spacing, typography, sizing, hierarchy, sidebar proportions,
  icon sizing, navigation layout, hover/active mechanics, sticky behaviour, borders,
  radii, weights, tracking, transitions.
- **Not** copied from Linear: colour. No value in the Arble build is derived from a
  Linear screenshot or a Linear colour token. Arble keeps its own light monochrome ramp.
- **Light mode only.** Dark mode is removed from the documentation entirely — no dark
  tokens, no toggle, no `prefers-color-scheme` branch, no `data-theme` attribute.
- Arble changes only: logo, product name, item labels, figures.

---

## 1. Type tokens

Linear's raw tokens, and what Arble uses. Weight 510/590 exist only on Inter Variable;
Switzer ships 400/500/600/700, so 510→500 and 590→600.

| Linear token | Linear value | Arble token | Arble value |
|---|---|---|---|
| `--text-small-size` | 0.875rem = **14px** | `--t-sm` | 14px |
| `--text-small-line-height` | `calc(21/14)` = **1.5** | | 1.5 (21px) |
| `--text-small-letter-spacing` | **−0.013em** | | −0.013em |
| `--text-regular-size` | 0.9375rem = **15px** | `--t-body` | 15px |
| `--text-regular-line-height` | **1.6** | `--l-body` | 1.6 (24px) |
| `--text-regular-letter-spacing` | **−0.011em** | | −0.011em |
| `--text-large-size` | 1.0625rem = **17px** | `--t-lead` | 17px / 1.6 / 0 |
| `--title-1` | 17px / 1.4 / −0.012em | `h4` | same |
| `--title-2` | 20px / 1.33 / −0.012em | — | — |
| `--title-3` | 24px / 1.33 / −0.012em | `h2` | same |
| `--title-4` | 32px / 1.125 / −0.022em | `h1` | 32px / 36px / −0.022em |
| `--font-weight-medium` | **510** | | 500 |
| `--font-weight-semibold` | **590** | | 600 |

Measured on the rendered article: h1 `32px/36px/590/−0.704px`, h2
`24px/31.92px/590/−0.288px`, h3 `20px/32px/590/0`, p `15px/24px/400/−0.165px`.

**No uppercase and no positive letter-spacing anywhere in the sidebar.** This is the
single largest defect in the previous Arble build: it used 13px/600/+0.055em uppercase
section labels. Linear has no such element.

## 2. Heading rhythm

Measured margins plus Linear's own `--hN-bottom-margin` tokens.

| Element | Size / line | Weight | Tracking | Margin above | Margin below |
|---|---|---|---|---|---|
| h1 | 32 / 36 | 600 | −0.022em | 0 | 12px |
| h2 | 24 / 1.33 | 600 | −0.012em | **56px** | **12px** |
| h3 | 20 / 1.6 | 600 | 0 | **56px** | **6px** |
| h4 | 17 / 1.4 | 600 | −0.012em | 32px | **10px** |
| p → p | 15 / 1.6 | 400 | −0.011em | — | **16px** (`--block-spacing`) |
| tight stack | — | — | — | — | **8px** (`--block-spacing-small`) |
| list inset | — | — | — | — | **24px** (`--list-inset`) |

`--block-spacing: 20px` at large prose size, `16px` at regular, `14px` at small.
Arble uses regular → 16px.

## 3. Layout grid

| Property | Linear | Arble |
|---|---|---|
| `--page-max-width` | **1024px** | 1024px |
| `--page-padding-inline` | **24px** | 24px |
| Page padding block | **112px** top, **48px** bottom | **48px / 48px** — see note |
| `--content-gap` (article ↔ TOC) | **76px** | 76px |
| Sidebar width | **280px** | 280px |
| Article column | **650px** (1024 − 24·2 − 250 − 76) | 650px |
| `--prose-max-width` | **624px** | 624px |
| TOC column | **250px** min-width, 8px right padding | 250px |
| `--header-height` | **64px** (72px on one breakpoint) | 64px |

Article and TOC are centred as one 1024px box inside the space right of the sidebar.
Prose stops at 624px; code, tables and figures fill the 650px column.

**Note on the 112px.** Linear's content column starts at the very top of the
window — it has no bar above it — so its 112px of top padding puts the H1 about
112px down the viewport. Arble's column sits under a 64px sticky top bar (§9.2),
so copying 112px stacked to 176px of empty space above every title. Arble uses
**48px**, which lands the H1 at the same ~112px from the top of the window. The
value to reproduce is the optical distance, not the declaration.

## 4. Sidebar — shell

| Element | Spec |
|---|---|
| Container | 280px, page background (**not** a tinted panel), 1px right border, `position: sticky`, `height: 100vh`, flex column |
| Header | height **64px**, padding **0 16px 0 24px**, `gap: 12px`, `flex: none` |
| Logo mark | **20 × 20px** |
| Divider after logo | **1px × 20px**, `border-radius: 9999px` |
| Wordmark | **17px / 500**, line-height 1.6 |
| Scroll region | padding **20px 20px 64px**, independent overflow, `overscroll-behavior: contain` |
| Footer | pinned outside the scroll region, `border-top: 1px`, padding **20px**, `flex-shrink: 0` |

## 5. Sidebar — rows

Verbatim from Linear's stylesheet:

```
._X0uBq_button { --height:36px; padding-left:2px; padding-right:5px }   /* group row  */
._X0uBq_button { --height:32px; padding-left:2px; padding-right:5px }   /* leaf row   */
._X0uBq_button { height:var(--height); color:var(--color-text-tertiary);
                 font-size:var(--text-small-size); … border-radius:8px }
._X0uBq_button img            { opacity:.45 }
._X0uBq_button:hover          { color:var(--color-text-secondary) }
._X0uBq_button:hover img      { opacity:.68 }
._X0uBq_button[aria-current=page] { color:var(--color-text-primary) }
._X0uBq_ul                    { padding:8px 0 12px }
```

| Property | Group row | Leaf row |
|---|---|---|
| Height | **36px** | **32px** |
| Padding | 0 5px 0 2px | 0 5px 0 2px |
| Radius | 8px | 8px |
| Type | 14 / 21 / 500 / −0.013em | identical |
| Icon | chevron **14px**, trailing edge | **16px**, `margin-right: 12px` |
| Icon opacity | — | **0.45** rest, **0.68** hover, 1 current |
| Rest colour | tertiary (`--ink-3`) | tertiary |
| Hover | secondary (`--ink-2`) | secondary |
| Current | primary (`--ink`) | primary |
| **Background** | **none, in every state** | **none, in every state** |
| **Active indicator** | **none** | **none** |
| Vertical gap between rows | 0 (height is the rhythm) | 0 |
| Nested list padding | — | 8px top, 12px bottom |
| Row inset from sidebar edge | 20px (scroll padding) | 20px |

The active item is *text colour only*. No fill, no rounded rectangle, no left bar.
Text label origin sits at 20 + 2 + 16 + 12 = **50px** from the sidebar's left edge.

## 6. Sidebar — footer navigation

Linear's footer holds four **separate destinations**, not page shortcuts:
`Docs` · `Developers` · `Learn` · `Contact support`.

```
.eKExYq_footer       { border-top:1px solid …; flex-shrink:0; padding:20px }
.eKExYq_footerAnchor { min-height:36px; font-size:14px; line-height:1.5;
                       letter-spacing:-.013em; font-weight:510;
                       color:var(--color-text-tertiary) }
.eKExYq_footerAnchor:hover,
.eKExYq_footerAnchor[aria-current=page] { color:var(--color-text-primary) }
.eKExYq_footerAnchor svg { width:16px; height:16px; margin-right:12px }
```

Arble destinations for the same four slots:

| Slot | Arble target |
|---|---|
| Docs | `docs/` |
| Developers | `docs/developers/` |
| Learn | `playbook.html` |
| Contact support | `docs/reference/troubleshooting/` — placeholder for a real support channel |

## 7. Table of contents

```
.jjY06q_aside { --font-size:13px; --padding-left:12px;
                top:calc(var(--header-height) + 32px) }
.jjY06q_ul    { padding-left:12px; border-left:2px solid transparent }
.jjY06q_ul:before { width:2px; height:100%; left:-2px; border-radius:9999px }   /* rail   */
.jjY06q_ul:after  { width:2px; height:var(--height,24px); left:-2px;
                    transform:translateY(var(--top)); transition:transform,height } /* marker */
.jjY06q_ul li a   { padding:4px 0; color:tertiary }
.jjY06q_ul li a:hover        { color:primary }
.jjY06q_ul li.active a       { color:primary }
```

| Property | Value |
|---|---|
| Width | 250px, 8px right padding |
| Sticky | `top: calc(64px + 32px)`, `max-height: calc(100vh − 64px − 64px)` |
| Item | **13px / 1.5**, weight 400, padding **4px 0**, row box 28px |
| Indent | **12px** from the rail; H3 nests further |
| Rail | **2px**, pill radius, full list height |
| Active marker | **2px**, item height, slides with a transition |
| Colours | tertiary at rest, primary on hover and active. **No weight change** |
| Label | **none** — Linear ships no "On this page" heading on desktop |

## 8. Buttons and controls

| Element | Spec |
|---|---|
| Icon button | **32 × 32px**, `border-radius: 9999px`, icon **16px** |
| Text button | height 32px, `border-radius: 9999px`, padding **0 12px**, `gap: 8px`, **13px / 500**, icon 16px |
| Search field (Arble-only; Linear has none in the sidebar) | height **36px**, radius **8px**, **14px** text, 1px border |
| Hover transition | 120ms |
| Focus | 2px outline, 2px offset |

## 9. Deliberate deviations from Linear, and why

1. **Search field in the sidebar.** Linear uses a 32px circular icon button in the
   sidebar header instead. Arble keeps its existing field; sized to the numbers in §8.
2. **Split top bar with breadcrumb, theme-free.** Linear's content column has no top
   bar at all. Arble keeps its breadcrumb + "Copy page" bar at Linear's 64px header
   height and pill button metrics.
3. **Display face on `h1` only.** Linear uses one family throughout. Arble's display
   face is brand, so it stays on the page title and nowhere else; h2–h4 use the text
   family at Linear's metrics.
4. **Per-item icons retained.** Linear's leaf rows carry a 16px icon at 0.45 opacity —
   Arble matches that exactly rather than dropping icons.

Everything not listed in §9 follows §1–§8 without reinterpretation.
