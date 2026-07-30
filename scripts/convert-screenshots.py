#!/usr/bin/env python3
"""Convert iPhone simulator screenshots into the site's app captures.

    python3 scripts/convert-screenshots.py [source-dir]     # default: ~/Desktop

Output is 852px-wide WebP, ~2.7x the 316px the .device screen renders at, so it
stays crisp on 2x and 3x displays without shipping the 1206px original.

The SHOTS keys are timestamp fragments of the simulator's own filenames
("Simulator Screenshot - iPhone 17 Pro - 2026-07-30 at 19.01.26.png"). Recapture
a screen, drop it in the source directory and re-run: only the names listed here
are picked up, so unrelated screenshots in that folder are ignored.

Requires Pillow:  pip install pillow
"""
import os
import sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
DESK = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/Desktop")
OUT = os.path.join(os.path.dirname(HERE), "assets")
W = 852

# time-stamp fragment -> asset name
SHOTS = {
    "19.01.26": "app-chat",                 # chat home, mascot + composer
    "19.01.50": "app-drawer",               # sessions drawer + section nav
    "19.02.00": "app-memory",               # memory entries
    "19.02.25": "app-tools",                # built-in tool sets
    "19.02.49": "app-toolset-json",         # add custom tool set
    "19.02.59": "app-notes",                # notes + reminders
    "19.03.09": "app-documents",            # documents
    "19.03.24": "app-status",               # tokens, heartbeat, activity log
    "19.03.34": "app-nodes",                # gateway + sync domains
    "19.03.42": "app-appearance",           # theme, accent, density, font
    "19.04.07": "app-providers",            # provider + model picker
    "19.04.15": "app-integrations",         # gateway + integration keys
    "19.04.28": "app-permissions-default",  # agent mode, permissions, voice
    "19.04.45": "app-connectors",           # Gmail, Microsoft, Notion
    "19.04.54": "app-skills",               # skills catalogue
    "19.04.57": "app-mcp-directory",        # MCP connector catalogue
    "19.05.11": "app-connectors-apps",      # Todoist, Spotify, Home Assistant
    "19.05.23": "app-connectors-advanced",  # MCP, Claude Code, Live View, SSH
    "19.05.29": "app-mcp-consent",          # third-party data disclosure
    "19.05.44": "app-liveview",             # live view, unpaired
    "19.05.58": "app-pairing",              # pair a computer
    "19.06.05": "app-ssh",                  # SSH connections
    "19.06.33": "app-permissions",          # permission mode sheet
}

files = [f for f in os.listdir(DESK) if f.startswith("Simulator Screenshot") and f.endswith(".png")]
done, missing = [], []

for stamp, name in sorted(SHOTS.items()):
    match = [f for f in files if stamp in f]
    if not match:
        missing.append(stamp)
        continue
    src = os.path.join(DESK, match[0])
    im = Image.open(src).convert("RGB")
    h = round(im.height * W / im.width)
    im = im.resize((W, h), Image.LANCZOS)
    dst = os.path.join(OUT, name + ".webp")
    im.save(dst, "WEBP", quality=80, method=6)
    done.append((name, W, h, os.path.getsize(dst) // 1024))

for name, w, h, kb in done:
    print(f"{name}.webp  {w}x{h}  {kb}KB")
print(f"\n{len(done)} written, {len(missing)} missing {missing}")
