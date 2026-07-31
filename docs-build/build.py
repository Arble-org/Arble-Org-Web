#!/usr/bin/env python3
"""Render the Arble documentation site from content.py + bodies.py.

Output layout (clean URLs via directory/index.html):

    docs/index.html                        -> /docs/
    docs/<section>/index.html              -> /docs/<section>/
    docs/<section>/<page>/index.html       -> /docs/<section>/<page>/
    docs/search-index.json

Long-form pages already written as standalone files are not re-authored; their
<article> body is lifted out and re-wrapped in the shared chrome, with link
depth rewritten for their new location.

Run from the repository root:  python3 docs-build/build.py
"""
import json
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from content import NAV, SOURCED, SUMMARY, SECTION_LEAD  # noqa: E402
from bodies import BODIES  # noqa: E402

# Repository root: this file lives in docs-build/, so one level up.
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "docs")
CSS_V = "86"

# Absolute origin, used only for sitemap.xml. Every link inside the site stays
# relative, so this is the one place a domain is hard-coded — change it here and
# in robots.txt if the site moves.
BASE_URL = "https://arble.ai"

# ── helpers ───────────────────────────────────────────────────────────────────

def prefix(depth):
    """Relative path back to the site root from a page at the given depth."""
    return "../" * depth


def flatten():
    """Ordered [(key, title, section_title, section_slug)] for every leaf page."""
    out = []
    for sec_title, sec_slug, leaves in NAV:
        for slug, title in leaves:
            out.append((f"{sec_slug}/{slug}", title, sec_title, sec_slug))
    return out


FLAT = flatten()
ORDER = [k for k, _, _, _ in FLAT]
TITLES = {k: t for k, t, _, _ in FLAT}
SECOF = {k: (st, ss) for k, _, st, ss in FLAT}


# Lucide glyphs, 16px, 1.5 stroke. Inline so the sidebar needs no icon font
# and no extra request.
def _ico(d, extra=""):
    return (f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" '
            f'aria-hidden="true">{d}{extra}</svg>')


CHEVRON = _ico('<path d="m9 18 6-6-6-6"/>')

ICONS = {
    # Getting Started
    "install":             _ico('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/>'),
    "pair-device":         _ico('<rect x="14" y="3" width="7" height="12" rx="1.5"/><rect x="3" y="9" width="8" height="12" rx="1.5"/>'),
    "first-run":           _ico('<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>'),
    "configuration":       _ico('<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 2.6 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.8-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.6a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21.4 11a2 2 0 1 1 0 4"/>'),
    "system-requirements": _ico('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
    "updates":             _ico('<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>'),
    # Agent
    "sessions":      _ico('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    "memory":        _ico('<path d="M12 3a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 6 0v-1a3 3 0 0 0 0-6V6a3 3 0 0 0-3-3"/>'),
    "skills":        _ico('<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M3 15v4a2 2 0 0 0 2 2h4m12-6v4a2 2 0 0 1-2 2h-4"/><path d="M9 9h6v6H9z"/>'),
    "permissions":   _ico('<path d="M12 21s8-4 8-10V5l-8-3-8 3v6c0 6 8 10 8 10"/>'),
    "automation":    _ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    "desktop":       _ico('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8"/>'),
    "notifications": _ico('<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>'),
    # Developers
    "mcp-servers":   _ico('<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 8h.01M7 17h.01"/>'),
    "tool-sdk":      _ico('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>'),
    "cli":           _ico('<path d="m5 8 4 4-4 4M12 16h7"/><rect x="2" y="3" width="20" height="18" rx="2"/>'),
    "api-reference": _ico('<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>'),
    "self-hosting":  _ico('<path d="M12 2 2 7l10 5 10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>'),
    # Reference
    "glossary":        _ico('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2"/>'),
    "faq":             _ico('<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 4M12 17h.01"/>'),
    "troubleshooting": _ico('<circle cx="11" cy="11" r="7"/><path d="m20 20-4.4-4.4"/>'),
    "release-notes":   _ico('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/>'),
}

SECTION_ICON = {
    "getting-started": _ico('<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.9.7-2.2-.1-3a2.1 2.1 0 0 0-2.9 0"/><path d="M12 15l-3-3a20 20 0 0 1 10-10 10 10 0 0 1 0 6 20 20 0 0 1-7 7"/>'),
    "agent":           _ico('<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 2v4M8 14h.01M16 14h.01"/>'),
    "developers":      _ico('<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>'),
    "reference":       _ico('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2"/>'),
}


# Footer destinations. These are separate places to go, not shortcuts to pages
# already in the tree above — that distinction is the whole point of the footer.
# "Contact support" is a placeholder until there is a real support channel.
FOOTER_NAV = [
    ("Docs", "docs/", _ico('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>'
                           '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2"/>')),
    ("Developers", "docs/developers/", _ico('<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>')),
    ("Learn", "playbook.html", _ico('<path d="M22 10 12 5 2 10l10 5z"/>'
                                    '<path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>')),
    ("Contact support", "docs/reference/troubleshooting/",
     _ico('<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>')),
]


def sidefoot(current, depth):
    """The pinned footer: four separate destinations, 36px rows, 16px glyph at a
    12px gap. Never a shortcut back into the tree above it."""
    p = prefix(depth)
    rows = []
    for label, href, icon in FOOTER_NAV:
        target = f"{p}{href}"
        cur = ' aria-current="page"' if (href == "docs/" and current == "") else ""
        rows.append(f'          <a href="{target}"{cur}>{icon}<span>{label}</span></a>')
    return "\n".join(rows)


def sidebar(current, depth):
    """Linear-style sidebar: collapsible groups, an icon per item. Groups are
    native <details> so keyboard support and the open state come free — the
    group holding the current page ships open."""
    p = prefix(depth)
    out = []
    for i, (sec_title, sec_slug, leaves) in enumerate(NAV):
        in_here = current == f"{sec_slug}/" or current.startswith(f"{sec_slug}/")
        # On the documentation home there is no current section, so open the
        # first group rather than presenting a fully collapsed rail.
        if current == "" and i == 0:
            in_here = True
        out.append(f'        <details class="docs__grp"{" open" if in_here else ""}>')
        out.append(f'          <summary class="docs__grph">'
                   f'<span>{sec_title}</span>{CHEVRON}</summary>')
        out.append('          <ul class="docs__raillist">')
        for slug, title in leaves:
            key = f"{sec_slug}/{slug}"
            cur = " is-current" if key == current else ""
            aria = ' aria-current="page"' if key == current else ""
            out.append(
                f'            <li class="docs__railrow{cur}">'
                f'<a href="{p}docs/{key}/"{aria}>{ICONS.get(slug, "")}'
                f'<span>{title}</span></a></li>')
        out.append('          </ul>')
        out.append('        </details>')
    return "\n".join(out)


def toc_from(body):
    """Build an On-this-page list from the h2/h3 ids present in a body."""
    items = re.findall(r'<h([23])\s+id="([^"]+)"[^>]*>(.*?)</h\1>', body, re.S)
    if not items:
        return ""
    rows = []
    for level, hid, label in items:
        label = re.sub(r"<[^>]+>", "", label).strip()
        sub = " docs__tocrow--sub" if level == "3" else ""
        rows.append(f'          <li class="docs__tocrow{sub}">'
                    f'<a href="#{hid}">{label}</a></li>')
    return "\n".join(rows)


def infer_lang(code):
    """Best-effort language for the code-block badge. Heuristics beat nothing,
    and a wrong badge is cheap while a missing one costs the block its header."""
    c = code.strip()
    first = c.split("\n", 1)[0]
    if c.startswith("{") or c.startswith("["):
        return "JSON"
    if re.match(r"^(from|import|def |class |@tool|async def)", c) or "def " in c[:200]:
        return "PYTHON"
    if re.match(r"^(apiVersion:|services:|kind:|scrape_configs:|[a-z_]+:\s*$)", first):
        return "YAML"
    if first.startswith("[profiles") or re.match(r"^\[[a-z.]+\]", first):
        return "TOML"
    if "withCredentials(" in c or first.startswith("//"):
        return "GROOVY"
    if re.match(r"^\$?\s*(curl|arble|docker|brew|npm|pnpm|npx|kubectl|helm|winget|"
                r"xcrun|pg_dump|pg_restore|sha256sum|export|#!/)", first) or first.startswith("$ "):
        return "SHELL"
    if first.startswith("event:") or first.startswith("X-RateLimit"):
        return "HTTP"
    if "location /" in c or "proxy_pass" in c:
        return "NGINX"
    if "0 7 * * " in first:
        return "CRONTAB"
    if "$result" in c or "ConvertFrom-Json" in c:
        return "POWERSHELL"
    return "CODE"


def codebars(body):
    """Give every code block a header bar carrying the language badge and the
    copy control. This is what removes the old asymmetric 76px right padding
    and the content-slides-under-the-button collision."""
    pat = re.compile(
        r'<div class="docs__code">\s*<pre><code id="([^"]+)">(.*?)</code></pre>\s*'
        r'<button class="docs__copy"[^>]*>Copy</button>\s*</div>', re.S)

    def sub(m):
        cid, code = m.group(1), m.group(2)
        lang = infer_lang(re.sub(r"<[^>]+>", "", code))
        return (
            '<div class="docs__code">\n'
            f'          <div class="docs__codebar"><span class="docs__lang">{lang}</span>'
            f'<button class="docs__copy" type="button" data-copy="{cid}" '
            f'aria-label="Copy code">Copy</button></div>\n'
            f'          <pre><code id="{cid}">{code}</code></pre>\n'
            '        </div>')

    return pat.sub(sub, body)


def reading_time(body):
    words = len(re.sub(r"<[^>]+>", " ", body).split())
    return max(1, round(words / 220))


def shell(*, title, crumb, h1, body, current, depth, prev, nxt, desc):
    p = prefix(depth)
    body = codebars(body)
    mins = reading_time(body)
    toc = toc_from(body)
    toc_block = ""
    if toc:
        toc_block = f"""
      <aside class="docs__toc" aria-label="On this page">
        <p class="docs__tocH">On this page</p>
        <ul class="docs__toclist" id="docsToc">
{toc}
        </ul>
      </aside>"""

    nav_block = ""
    if prev or nxt:
        parts = ['        <nav class="pbp__nav" aria-label="Page navigation">']
        if prev:
            parts.append(
                f'          <a class="pbp__navcard pbp__navcard--prev" href="{p}docs/{prev}/">'
                f'<span class="pbp__navcard-l">Previous</span>'
                f'<span class="pbp__navcard-t">{TITLES[prev]}</span></a>')
        if nxt:
            parts.append(
                f'          <a class="pbp__navcard pbp__navcard--next" href="{p}docs/{nxt}/">'
                f'<span class="pbp__navcard-l">Next</span>'
                f'<span class="pbp__navcard-t">{TITLES[nxt]}</span></a>')
        parts.append("        </nav>")
        nav_block = "\n".join(parts)

    return f"""<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} &#8212; Arble Docs</title>
  <meta name="description" content="{desc}" />
  <link rel="icon"
    href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='3.4' fill='%230A0A0B'/%3E%3Ccircle cx='12' cy='12' r='7.2' fill='none' stroke='%230A0A0B' stroke-width='1.3' opacity='.45'/%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://cdn.fontshare.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&display=swap" />
  <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f%5B%5D=switzer@400,500,600,700&display=swap" />
  <link rel="stylesheet" href="{p}assets/css/docs.css?v={CSS_V}" />
</head>

<!-- Documentation is its own application, not a page on the marketing site:
     no floating nav, no CTA, no hero. The shell is a fixed sidebar plus a
     scrolling content column, with the header split so each half aligns to
     the column beneath it. -->
<body class="dapp">
  <a class="skip" href="#doc">Skip to content</a>

  <div class="dapp__grid">

    <aside class="dside" aria-label="Documentation navigation">
      <div class="dside__head">
        <a class="dside__brand" href="{p}index.html" aria-label="Arble home">
          <img src="{p}assets/img/brand/logo-mark.png" width="288" height="271" alt="" aria-hidden="true" />
        </a>
        <span class="dside__rule" aria-hidden="true"></span>
        <a class="dside__brand" href="{p}docs/"><span>Docs</span></a>
      </div>
      <div class="dside__scroll">
        <form class="docs__search" role="search" onsubmit="return false;">
          <input class="docs__searchi" id="docsSearch" type="search" autocomplete="off"
            placeholder="Search&#8230;" aria-label="Search documentation" />
          <ul class="docs__searchr" id="docsSearchResults" hidden></ul>
        </form>
        <nav aria-label="Sections">
{sidebar(current, depth)}
        </nav>
      </div>
      <nav class="dside__foot" aria-label="Arble">
{sidefoot(current, depth)}
      </nav>
    </aside>

    <div class="dmain">
      <header class="dtop">
        <button class="dnavbtn" type="button" id="navToggle" aria-label="Open navigation"
          aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
        <p class="docs__crumb">{crumb}</p>
        <div class="docs__acts">
          <button class="docs__act" type="button" id="copyPage" aria-label="Copy page as Markdown">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9"
              width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copy page</span>
          </button>
        </div>
      </header>

      <div class="dbody">
        <article class="docs__body" id="doc">
          <h1 class="docs__title">{h1}</h1>
          <p class="docs__meta"><b>{mins} min read</b><i>&#183;</i>Updated 30 Jul 2026</p>
{body}
{nav_block}
        </article>
{toc_block}
      </div>
    </div>
  </div>

  <script src="{p}assets/js/docs.js?v=7" defer></script>
  <script>window.ARBLE_DOCS_ROOT = "{p}docs/";</script>
  <script src="{p}assets/js/docs-search.js?v=2" defer></script>
  <script src="{p}assets/js/docs-ui.js?v=3" defer></script>
</body>

</html>
"""


def lift_article(path):
    """Pull the inner HTML of <article class="docs__body"> from an existing page,
    dropping the crumb, h1 and prev/next so the shell can supply its own.

    Must be nesting-aware: several of these pages use <article class="docs__card">
    for card grids, so a non-greedy match to the first </article> silently
    truncates the page at its first card. Walk the tags and balance them.
    """
    # These pages were written standalone before the docs became generated; they
    # now live in docs-source/legacy-pages/ and are lifted into the shared chrome.
    for cand in (os.path.join(ROOT, "docs-source", "legacy-pages", path),
                 os.path.join(ROOT, path)):
        if os.path.isfile(cand):
            src = open(cand, encoding="utf-8").read()
            break
    else:
        raise SystemExit(f"source page not found: {path}")
    open_tag = '<article class="docs__body" id="doc">'
    i = src.find(open_tag)
    if i == -1:
        raise SystemExit(f"could not find article body in {path}")
    start = i + len(open_tag)
    depth_ = 1
    pos = start
    for m in re.finditer(r"</?article\b", src[start:]):
        depth_ += 1 if m.group(0) == "<article" else -1
        if depth_ == 0:
            pos = start + m.start()
            break
    else:
        raise SystemExit(f"unbalanced <article> in {path}")
    body = src[start:pos]
    body = re.sub(r'\s*<p class="docs__crumb">.*?</p>', "", body, count=1, flags=re.S)
    body = re.sub(r'\s*<h1 class="docs__title">.*?</h1>', "", body, count=1, flags=re.S)
    body = re.sub(r'\s*<nav class="pbp__nav".*?</nav>', "", body, flags=re.S)
    return body.strip("\n")


def redepth(body, depth):
    """Rewrite sibling-page links in a lifted body for its new depth.

    A lifted page linked to `cli.html`; from docs/developers/x/ that must become
    ../cli/. Anything still pointing at a top-level file gets the ../ prefix.
    """
    p = prefix(depth)
    # Old flat docs pages -> new nested locations.
    remap = {
        "mcp-servers.html":   f"{p}docs/developers/mcp-servers/",
        "tool-sdk.html":      f"{p}docs/developers/tool-sdk/",
        "cli.html":           f"{p}docs/developers/cli/",
        "api-reference.html": f"{p}docs/developers/api-reference/",
        "self-hosting.html":  f"{p}docs/developers/self-hosting/",
        "documentation.html": f"{p}docs/",
    }
    for old, new in remap.items():
        body = body.replace(f'href="{old}"', f'href="{new}"')
        body = body.replace(f'href="{old}#', f'href="{new}#')
    # Remaining top-level targets (playbook, index) need to climb out of docs/.
    for f in ("playbook.html", "index.html"):
        body = body.replace(f'href="{f}"', f'href="{p}{f}"')
        body = body.replace(f'href="{f}#', f'href="{p}{f}#')
    body = body.replace('src="assets/', f'src="{p}assets/')
    return body


def strip_tags(html):
    html = re.sub(r"<(script|style)\b.*?</\1>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<[^>]+>", " ", html)
    html = (html.replace("&#8212;", "—").replace("&#8217;", "'")
                .replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
                .replace("&#8220;", '"').replace("&#8221;", '"'))
    return re.sub(r"\s+", " ", html).strip()


# ── build ─────────────────────────────────────────────────────────────────────

def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT, exist_ok=True)

    index = []

    # Leaf pages.
    for i, (key, title, sec_title, sec_slug) in enumerate(FLAT):
        depth = 3  # docs/<section>/<page>/
        if key in SOURCED:
            body = redepth(lift_article(SOURCED[key]), depth)
        elif key in BODIES:
            body = BODIES[key].strip("\n")
        else:
            raise SystemExit(f"no body for {key}")

        prev = ORDER[i - 1] if i > 0 else None
        nxt = ORDER[i + 1] if i + 1 < len(ORDER) else None
        desc = SUMMARY.get(key, f"{title} — Arble documentation.")

        html = shell(
            title=title,
            crumb=f'<a href="{prefix(depth)}docs/">Documentation</a> '
                  f'<span aria-hidden="true">/</span> '
                  f'<a href="{prefix(depth)}docs/{sec_slug}/">{sec_title}</a> '
                  f'<span aria-hidden="true">/</span> {title}',
            h1=title, body=body, current=key, depth=depth,
            prev=prev, nxt=nxt, desc=desc)

        d = os.path.join(OUT, sec_slug, key.split("/", 1)[1])
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(html)

        index.append({"t": title, "s": sec_title, "u": f"{key}/",
                      "d": strip_tags(desc), "x": strip_tags(body)[:1400]})

    # Section index pages.
    for sec_title, sec_slug, leaves in NAV:
        depth = 2
        cards = []
        for slug, title in leaves:
            key = f"{sec_slug}/{slug}"
            cards.append(
                f'          <a class="docs__card" href="{prefix(depth)}docs/{key}/">\n'
                f'            <span class="docs__card-t">{title}</span>\n'
                f'            <span class="docs__card-d">{SUMMARY.get(key, "")}</span>\n'
                f'          </a>')
        body = (f'        <p class="docs__lead">{SECTION_LEAD.get(sec_slug, "")}</p>\n\n'
                f'        <div class="docs__cards">\n' + "\n".join(cards) +
                "\n        </div>")
        html = shell(
            title=sec_title,
            crumb=f'<a href="{prefix(depth)}docs/">Documentation</a> '
                  f'<span aria-hidden="true">/</span> {sec_title}',
            h1=sec_title, body=body, current=f"{sec_slug}/", depth=depth,
            prev=None, nxt=None,
            desc=SECTION_LEAD.get(sec_slug, sec_title).replace("&#8212;", "-"))
        os.makedirs(os.path.join(OUT, sec_slug), exist_ok=True)
        open(os.path.join(OUT, sec_slug, "index.html"), "w",
             encoding="utf-8").write(html)

    # Home.
    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(home())

    with open(os.path.join(OUT, "search-index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, separators=(",", ":"))

    n_urls = sitemap()

    print(f"built {len(FLAT)} pages + {len(NAV)} section indexes + home")
    print(f"search index: {len(index)} entries")
    print(f"sitemap.xml: {n_urls} urls")


def sitemap():
    """Write sitemap.xml at the repository root.

    Generated here rather than hand-maintained because this module already knows
    every documentation URL; a hand-written sitemap goes stale the first time a
    page is added. Marketing pages are listed explicitly since they are not part
    of NAV.
    """
    urls = ["", "about.html", "contact.html", "playbook.html", "changelog.html", "blog.html", "docs/"]
    urls += [f"docs/{slug}/" for _, slug, _ in NAV]
    urls += [f"docs/{key}/" for key in ORDER]
    urls += [f"legal/{p}/" for p in
             ("privacy", "terms", "security", "trust", "cookies")]

    rows = "\n".join(
        f"  <url><loc>{BASE_URL}/{u}</loc></url>" for u in urls)
    doc = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           f"{rows}\n</urlset>\n")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(doc)
    return len(urls)


def home():
    depth = 1
    p = prefix(depth)
    qs = [("Install", "getting-started/install", "3 min"),
          ("Pair Device", "getting-started/pair-device", "4 min"),
          ("Run your first agent", "getting-started/first-run", "5 min"),
          ("Connect an MCP server", "developers/mcp-servers", "6 min")]
    qcards = "\n".join(
        f'          <a class="docs__card" href="{p}docs/{u}/">\n'
        f'            <span class="docs__card-t">{t}</span>\n'
        f'            <span class="docs__card-d">{SUMMARY.get(u, "")}</span>\n'
        f'            <span class="docs__card-m">{m} read</span>\n'
        f'          </a>' for t, u, m in qcards_src(qs))

    browse = "\n".join(
        f'          <a class="docs__card" href="{p}docs/{s}/">\n'
        f'            <span class="docs__card-t">{st}</span>\n'
        f'            <span class="docs__card-d">{SECTION_LEAD.get(s, "")}</span>\n'
        f'            <span class="docs__card-m">{len(l)} pages</span>\n'
        f'          </a>' for st, s, l in NAV)

    pop = [("getting-started/install", "Install"), ("agent/memory", "Memory"),
           ("developers/tool-sdk", "Tool SDK"), ("developers/cli", "CLI"),
           ("developers/api-reference", "API Reference"),
           ("agent/permissions", "Permissions")]
    poplist = "\n".join(
        f'          <li><a href="{p}docs/{u}/">{t}</a> &#8212; {SUMMARY.get(u, "")}</li>'
        for u, t in pop)

    latest = [("developers/tool-sdk", "Tool SDK", "New — decorators, schemas, streaming, publishing"),
              ("developers/cli", "CLI", "New — full command reference, scripting, CI"),
              ("developers/api-reference", "API Reference", "New — REST, SSE, webhooks, errors"),
              ("developers/self-hosting", "Self-hosting", "New — Docker, Kubernetes, HA, DR"),
              ("agent/memory", "Memory", "Expanded — encryption, reindexing, retention")]
    latrows = "\n".join(
        f'              <tr><th scope="row"><a href="{p}docs/{u}/">{t}</a></th>'
        f'<td>{c}</td></tr>' for u, t, c in latest)

    body = f"""        <p class="docs__lead">Everything you need to build with Arble. Installation,
          building, automation, deployment, and operating it in production.</p>

        <p>Every topic is its own page. Use the sidebar to browse by section, or search to jump
          straight to a command, an endpoint or an error code.</p>

        <h2 id="quick-start">Quick start</h2>
        <p>Four steps from nothing to a working agent. Do them in order &#8212; each assumes the
          previous one.</p>
        <div class="docs__cards">
{qcards}
        </div>

        <h2 id="browse">Browse documentation</h2>
        <div class="docs__cards">
{browse}
        </div>

        <h2 id="popular">Popular guides</h2>
        <ul class="docs__list">
{poplist}
        </ul>

        <h2 id="latest">Latest updates</h2>
        <div class="docs__tablewrap">
          <table class="docs__table">
            <thead><tr><th scope="col">Page</th><th scope="col">Change</th></tr></thead>
            <tbody>
{latrows}
            </tbody>
          </table>
        </div>

        <h2 id="playbook">Playbook</h2>
        <p>The <a href="{p}playbook.html">Playbook</a> is not product documentation. It teaches the
          concepts underneath AI systems &#8212; context windows, planning, tool calling &#8212; using
          Arble as an example rather than a subject. Read it to understand <em>why</em> an agent
          behaves as it does; read these guides to know what to type.</p>

        <h2 id="help">Need help</h2>
        <div class="docs__cards">
          <a class="docs__card" href="{p}docs/reference/faq/">
            <span class="docs__card-t">FAQ</span>
            <span class="docs__card-d">Questions that come up repeatedly, answered directly.</span>
          </a>
          <a class="docs__card" href="{p}docs/reference/troubleshooting/">
            <span class="docs__card-t">Troubleshooting</span>
            <span class="docs__card-d">Failures organized by symptom, since that is what you
              arrive with.</span>
          </a>
          <a class="docs__card" href="{p}docs/reference/glossary/">
            <span class="docs__card-t">Glossary</span>
            <span class="docs__card-d">Terms used across the documentation, defined once.</span>
          </a>
          <a class="docs__card" href="{p}docs/reference/release-notes/">
            <span class="docs__card-t">Release Notes</span>
            <span class="docs__card-d">What changed, what broke, and what to do about it.</span>
          </a>
        </div>"""

    return shell(title="Documentation", crumb="Resources <span aria-hidden=\"true\">/</span> Documentation",
                 h1="Documentation", body=body, current="", depth=depth,
                 prev=None, nxt=None,
                 desc="Arble documentation: install, agent guides, developer reference, "
                      "self-hosting and troubleshooting.")


def qcards_src(qs):
    return qs


if __name__ == "__main__":
    main()
