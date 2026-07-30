#!/usr/bin/env python3
"""Generate changelog.xml and blog.xml from the pages themselves.

Both pages link an RSS button, and a feed that 404s is worse than no button.
Entries are read out of the rendered HTML rather than kept in a second list, so
a feed cannot drift from the page it describes.

    python3 docs-build/feeds.py
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://arble.ai"


def strip(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def rss(title, desc, link, items):
    body = "".join(
        f"    <item>\n"
        f"      <title>{html.escape(t)}</title>\n"
        f"      <link>{u}</link>\n"
        f"      <guid isPermaLink=\"true\">{u}</guid>\n"
        f"      <description>{html.escape(d)}</description>\n"
        f"    </item>\n" for t, u, d in items)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        f"    <title>{html.escape(title)}</title>\n"
        f"    <link>{link}</link>\n"
        f"    <description>{html.escape(desc)}</description>\n"
        "    <language>en</language>\n"
        f'    <atom:link href="{link.rsplit("/", 1)[0]}/'
        f'{"changelog.xml" if "changelog" in link else "blog.xml"}" '
        'rel="self" type="application/rss+xml"/>\n'
        f"{body}"
        "  </channel>\n"
        "</rss>\n")


def changelog_items():
    src = open(os.path.join(ROOT, "changelog.html"), encoding="utf-8").read()
    items = []
    for m in re.finditer(r'<h2 id="(v[0-9-]+)">(.*?)</h2>(.*?)(?=<h2 |</article>)',
                         src, re.S):
        anchor, title, block = m.group(1), strip(m.group(2)), m.group(3)
        para = re.search(r"<p>(.*?)</p>", block, re.S)
        summary = strip(para.group(1)) if para else ""
        items.append((title, f"{BASE}/changelog.html#{anchor}", summary))
    return items


def blog_items():
    src = open(os.path.join(ROOT, "blog.html"), encoding="utf-8").read()
    items = []
    for m in re.finditer(r'<span class="ed__t">(.*?)</span>\s*'
                         r'<span class="ed__d">(.*?)</span>', src, re.S):
        # Articles are not written yet, so every entry points at the index.
        items.append((strip(m.group(1)), f"{BASE}/blog.html#latest", strip(m.group(2))))
    return items


def main():
    c = changelog_items()
    b = blog_items()
    open(os.path.join(ROOT, "changelog.xml"), "w", encoding="utf-8").write(
        rss("Arble Changelog", "Every meaningful change to Arble.",
            f"{BASE}/changelog.html", c))
    open(os.path.join(ROOT, "blog.xml"), "w", encoding="utf-8").write(
        rss("Arble Blog", "Engineering, research and product writing from Arble.",
            f"{BASE}/blog.html", b))
    print(f"changelog.xml: {len(c)} items")
    print(f"blog.xml: {len(b)} items")


if __name__ == "__main__":
    main()
