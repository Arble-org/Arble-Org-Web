# Documentation site content tree.
#
# This file is the single source of truth for the docs sidebar, the URL layout
# and the prev/next chain. build.py renders it; nothing else defines nav, so the
# sidebar cannot drift from what actually exists.
#
# Each leaf is (slug, title). The slug is the directory name; the URL is
# /docs/<section>/<slug>/ and the file is docs/<section>/<slug>/index.html.
# A section with slug "" is the docs home.
#
# `source` on a page means: take the <article> body from this existing top-level
# HTML file rather than from BODIES below. That preserves the long-form pages
# already written instead of re-authoring them.

NAV = [
    ("Getting Started", "getting-started", [
        ("install",             "Install"),
        ("pair-device",         "Pair Device"),
        ("first-run",           "First Run"),
        ("configuration",       "Configuration"),
        ("system-requirements", "System Requirements"),
        ("updates",             "Updates"),
    ]),
    ("Agent", "agent", [
        ("sessions",      "Sessions"),
        ("memory",        "Memory"),
        ("skills",        "Skills"),
        ("permissions",   "Permissions"),
        ("automation",    "Automation"),
        ("desktop",       "Desktop Control"),
        ("notifications", "Notifications"),
    ]),
    ("Developers", "developers", [
        ("mcp-servers",   "MCP Servers"),
        ("tool-sdk",      "Tool SDK"),
        ("cli",           "CLI"),
        ("api-reference", "API Reference"),
        ("self-hosting",  "Self-hosting"),
    ]),
    ("Reference", "reference", [
        ("glossary",        "Glossary"),
        ("faq",             "FAQ"),
        ("troubleshooting", "Troubleshooting"),
        ("release-notes",   "Release Notes"),
    ]),
]

# Pages whose body is lifted from an existing standalone file.
SOURCED = {
    "developers/mcp-servers":   "mcp-servers.html",
    "developers/tool-sdk":      "tool-sdk.html",
    "developers/cli":           "cli.html",
    "developers/api-reference": "api-reference.html",
    "developers/self-hosting":  "self-hosting.html",
}

# One-line summaries. Used on the hub cards, the section index pages and the
# search index, so a description is written once and reused everywhere.
SUMMARY = {
    "getting-started/install":             "Install the desktop app, the CLI, or both, on macOS, Linux or Windows.",
    "getting-started/pair-device":         "Link a phone or second machine so sessions and device control span both.",
    "getting-started/first-run":           "Model selection, the first permission prompts, and where state is written.",
    "getting-started/configuration":       "arble.json, the user config file, and which settings belong in version control.",
    "getting-started/system-requirements": "Supported systems, kernel features sandboxing needs, and realistic sizing.",
    "getting-started/updates":             "How Arble updates, how to pin a version, and what stays compatible.",
    "agent/sessions":      "Conversations with accumulated context: create, pause, resume, export.",
    "agent/memory":        "Durable per-project facts, retrieved semantically and outliving sessions.",
    "agent/skills":        "Packaged procedures — a review standard, a deploy checklist, a release process.",
    "agent/permissions":   "The gate every tool call passes, whatever initiated it.",
    "agent/automation":    "Schedules, event triggers, queues and retries.",
    "agent/desktop":       "Screenshots, clipboard, window focus and input on a paired machine.",
    "agent/notifications": "Getting told when a long run finishes, on the device you are holding.",
    "developers/mcp-servers":   "Connect any Model Context Protocol server; its tools join the same registry.",
    "developers/tool-sdk":      "Build native tools in Python, TypeScript, Go or Rust.",
    "developers/cli":           "Drive every part of Arble from the terminal.",
    "developers/api-reference": "REST and streaming API: sessions, runs, memory, tools, permissions.",
    "developers/self-hosting":  "Deploy on infrastructure you own — Docker, Kubernetes or bare metal.",
    "reference/glossary":        "Terms used across the documentation, defined once.",
    "reference/faq":             "Questions that come up repeatedly, answered directly.",
    "reference/troubleshooting": "Failures organized by symptom, since that is what you arrive with.",
    "reference/release-notes":   "What changed, what broke, and what to do about it.",
}

SECTION_LEAD = {
    "getting-started": "Setup and first contact. Nothing here assumes prior knowledge of agent "
                       "systems &#8212; read it once, then rarely again.",
    "agent":           "The parts of Arble you interact with daily. Each concept here has a direct "
                       "equivalent in the CLI and the API, so learning it once covers all three.",
    "developers":      "The extension surface. Five entry points, complementary rather than "
                       "alternative &#8212; most real integrations use two or three.",
    "reference":       "Lookup material. You arrive here from search, not from a table of contents.",
}
