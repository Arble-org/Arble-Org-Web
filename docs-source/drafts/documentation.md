# Documentation

*Resources / Documentation*

Image placeholder · 16:9
A premium Apple-style product illustration on a pure white background: a single frosted-glass desktop window floats at center in three-quarter perspective, its surface showing a faint abstract agent interface. Arranged around it in a loose ring at varying depths are eight smaller translucent glass cards, each embossed with a minimal monochrome glyph and a short label — Getting Started, Agent, Developers, Playbook, Connectors, CLI, API, Self-hosting. Thin grey connector lines run from the central window to each card. Industrial-design lighting, soft contact shadows, no color accents.

## Everything you need to build with Arble.

This documentation covers the full lifecycle: installing Arble, building on it, automating work with it, deploying it, and operating it in production.

It is organized by what you are trying to do rather than by feature. If you are new, start with [Quick Start](#quick-start). If you are integrating, go to [Developers](#developers). If you are deploying, go to [Self-hosting](self-hosting.md).

> **New to agent systems?** The [Playbook](playbook.md) teaches the concepts — models, context, planning, tool calling — independently of Arble's features. Read it alongside these guides, not instead of them.

---

## On this page

- [Choose your path](#choose-your-path)
- [Quick start](#quick-start)
- [Documentation overview](#documentation-overview)
- [Conventions](#conventions)
- [Getting started](#getting-started)
- [Agent](#agent)
- [Developers](#developers)
- [Playbook](#playbook)
- [Connectors](#connectors)
- [Featured guides](#featured-guides)
- [Popular pages](#popular-pages)
- [Latest documentation](#latest-documentation)
- [Search documentation](#search-documentation)
- [Need help](#need-help)
- [Contributing](#contributing)
- [Documentation principles](#documentation-principles)

---

## Choose your path

Three readers arrive at this page with different questions. Pick the row that describes you and skip the rest.

| You are | Start here | Then |
|---|---|---|
| Using Arble for the first time | [Quick start](#quick-start) | [Getting Started](#getting-started), then [Agent](#agent) |
| Building on Arble | [Developers](#developers) | [Tool SDK](tool-sdk.md) or [API Reference](api-reference.md) |
| Operating Arble in production | [Self-hosting](self-hosting.md) | [CLI](cli.md), then Monitoring and Backups |

**First-time users.** You need Arble installed, one device paired, and one successful agent run. Do not read the reference material yet — it will make more sense after you have watched a run approve a tool call. [Quick start](#quick-start) is 18 minutes end to end.

**Developers.** You are integrating Arble into something, or extending what it can do. The decision that shapes everything else is whether you are connecting a service that already exists (use [MCP](mcp-servers.md)) or building a capability that doesn't (use the [Tool SDK](tool-sdk.md)). Read [Permissions](#agent) early regardless — it is the constraint most integrations discover late.

**Power users.** You already understand the agent loop and want leverage: scheduled runs, multi-agent fan-out, scripted pipelines, memory you curate deliberately. The [CLI](cli.md) and [Automation](#agent) guides are where the depth is, and the [Playbook](playbook.md) explains the failure modes you will start hitting at volume.

---

## Quick start

Four steps from nothing to a working agent. Do them in order — each assumes the previous one.

**Install Arble** · 3 min
Install the desktop app or the CLI. Both talk to the same local daemon, so the choice is preference, not capability.

**Set up your first device** · 4 min
Pair a phone or a second machine. Pairing is what makes desktop control, mobile notifications and cross-device sessions work.

**Run your first agent** · 5 min
Give Arble a task, watch it plan, approve its first tool call. This is where the permission model stops being abstract.

**Connect your first tool** · 6 min
Add a connector or an MCP server and watch its tools appear in the same registry as the built-in ones.

Total: about 18 minutes to a system that can read your files, reach one external service, and remember what it learned.

---

## Documentation overview

Image placeholder · 16:9
A minimal hierarchy diagram on white: the Arble mark sits at the left edge, with four thin lines fanning rightward into four labeled glass panels stacked vertically — Getting Started, Agent, Developers, Reference. Each panel has three or four short unlabeled sub-lines extending further right, suggesting nested pages without spelling them out. Monochrome, generous whitespace, precise line weights.

The documentation has four parts. They map to four different questions.

| Section | Answers | For |
|---|---|---|
| [Getting Started](#getting-started) | How do I install and configure it? | First-time users |
| [Agent](#agent) | How do I use it day to day? | All users |
| [Developers](#developers) | How do I extend and integrate it? | Developers |
| Reference | What exactly does this command or endpoint do? | Everyone, eventually |

**Getting Started** is setup and first contact — installation, pairing, configuration, requirements, updates. Read it once, then rarely again.

**Agent** covers the things you interact with every day: sessions, skills, permissions, memory, automation. This is the section that rewards rereading as your usage deepens.

**Developers** is the extension surface — MCP servers, the Tool SDK, the CLI, the REST API, and self-hosting. Each assumes you write code.

**Reference** is lookup material: command signatures, endpoint schemas, environment variables, the glossary. You arrive here from a search box, not from a table of contents.

Sections are ordered by when you need them, not by importance. Every page carries a **Previous** and **Next** link following that order, so reading straight through is a coherent path if you prefer it.

---

## Conventions

A few things mean something specific throughout the documentation.

**Callouts** come in three kinds. A plain callout adds context you can skip. One marked with a caution flags something that causes data loss or an outage — those are rare and always earned. One marked as a note on defaults tells you the shown value is what we would deploy, not just what compiles.

**Code blocks** are complete and runnable. Where a value must be yours, it appears as a named placeholder in angle brackets — `<your-host>` — never as `foo` or an ellipsis. Shell examples showing output prefix the command with `$` and leave the output unprefixed; blocks without a `$` are pure input and safe to copy whole.

**Identifiers** in examples are stable across pages. `ses_8kQ2mVx` is the same session in the CLI guide and the API reference, so you can follow one object through both.

**Version markers.** Anything introduced after 1.0 carries the version it landed in. If a flag or field has no marker, it has always existed.

**Platform differences** are stated inline rather than split into separate pages. Where macOS, Linux and Windows genuinely diverge, all three appear together.

---

## Getting started

For anyone who has not yet run Arble, or who is setting it up on a new machine. Nothing here assumes prior knowledge of agent systems.

**Install**
Package managers for macOS, Linux and Windows, plus a standalone binary and a Docker image. Covers verifying a release signature, and why the CLI and desktop app can share one installation.

**Pairing a Device**
Link a phone or second machine so sessions, notifications and device control span both. Explains what a pairing actually grants, and how to revoke it.

**First Run**
What happens the first time you start Arble: model selection, the initial permission prompts, and where state is written on disk. Worth reading rather than clicking through — the choices here set defaults you will otherwise wonder about later.

**Configuration**
The `arble.json` project file and the user config file. Precedence rules, which settings belong in version control, and which must never be committed.

**System Requirements**
Supported operating systems, the kernel features tool sandboxing depends on, and realistic sizing with and without a local GPU. Includes what degrades — rather than fails — on an older kernel.

**Updates**
How Arble updates itself, how to pin a version, and what is guaranteed to stay compatible across a minor release. Read this before you automate an upgrade.

**Troubleshooting**
The failures people hit first: a model that won't load, a connector that won't authenticate, a permission that won't stick. Organized by symptom, since that is what you have when you arrive.

---

## Agent

Image placeholder · 16:9
A dark-on-white schematic: a central rounded node labeled Agent, with four thick short connectors radiating to four labeled satellite nodes — Memory, Skills, Permissions, Sessions. Each satellite carries a small distinguishing glyph (a layered stack, a checklist, a shield, a conversation bubble). A thin dashed arc encircles the whole group, labeled with a single word suggesting one run. Flat, monochrome, evenly weighted.

The agent is the part of Arble you talk to. These guides explain the machinery behind it — and each concept here has a direct equivalent in the CLI and the API, so learning it once covers all three surfaces.

**Sessions**
A conversation with accumulated context. Creating, pausing, resuming and exporting them — and the judgment call of when to continue one versus start fresh, which affects both cost and output quality.

**Skills**
Packaged procedures: a review standard, a deploy checklist, a release process. How to install, pin, enable and disable them, and the distinction that matters — a tool is one capability, a skill is a way of working.

**Permissions**
The gate every tool call passes, whatever initiated it. Grant levels, scoping, inheritance down a call chain, and how to configure unattended runs so a missing grant fails closed instead of hanging on a prompt nobody will answer.

**Memory**
Durable per-project facts, retrieved semantically. What belongs in memory versus a session export, why memory outlives the session that wrote it, and when to summarize so retrieval stays cheap.

**Automation**
Schedules, event triggers, queues and retries. How to turn a task you ran once into one that runs nightly, and how to keep a batch job from starving interactive work.

**Notifications**
Getting told when a long run finishes, on the device you are actually holding. Covers routing and what a notification can safely contain.

**Desktop Control**
Screenshots, clipboard, window focus and input simulation. What Arble can drive on a paired machine, the permission each action requires, and why chaining steps in a file beats a long shell pipeline.

---

## Developers

Image placeholder · 16:9
An illustration on white: a central matte slab labeled Arble Runtime, with four labeled input rails entering from the left and right — SDK, CLI, API, MCP. Each rail terminates in a small glass module bearing a distinguishing glyph (a function bracket, a terminal cursor, a REST path, a server stack). Below the slab, a single output line runs to a row of three small tool tiles. Precise, technical, monochrome.

Five entry points for building on Arble. They are complementary, not alternatives — most real integrations use two or three.

**[MCP Servers](mcp-servers.md)**
Connect Arble to any Model Context Protocol server; its tools join the same registry and pass the same permission gate as built-in ones.

**[Tool SDK](tool-sdk.md)**
Build native tools in Python, TypeScript, Go or Rust. One implementation becomes available on desktop, mobile, CLI, API and workflows.

**[CLI](cli.md)**
Drive every part of Arble from the terminal — the same client the app uses, so anything you can do by hand you can script.

**[API Reference](api-reference.md)**
The REST and streaming API. Sessions, runs, memory, tools and permissions as HTTP resources.

**[Self-hosting](self-hosting.md)**
Deploy Arble on infrastructure you own — Docker, Kubernetes or bare metal, including air-gapped environments.

> **Which one do I need?** Use **MCP** to connect something that already exists. Use the **Tool SDK** to build something that doesn't. Use the **CLI** to automate. Use the **API** to embed Arble in your own product.

---

## Playbook

The [Playbook](playbook.md) is not product documentation. It teaches the concepts underneath AI systems — what a context window is, why planning is hard, how tool calling actually works — using Arble as an example rather than a subject.

Read it if you want to understand *why* an agent behaves the way it does. The rest of this documentation tells you what to type.

| Chapter | Covers |
|---|---|
| Introduction to AI Operating Systems | Why an agent needs an OS rather than a chat window |
| Large Language Models | What the model does, and where its limits actually are |
| Transformers | Attention, tokens, and why sequence length costs what it does |
| Context Windows | The budget every run spends, and how to spend it well |
| Memory | Why context alone is insufficient, and what persistence buys |
| Agents | The loop: observe, plan, act, repeat |
| Planning | Decomposition, and why plans fail in predictable ways |
| Tool Calling | Schemas, validation, and the contract between model and system |
| MCP | A protocol for exposing capability, and what it deliberately omits |
| Automation | Moving from prompted work to triggered work |
| Computer Use | Driving a GUI, and why it is harder than driving an API |
| Production AI Systems | Reliability, cost, observability and failure modes |

Chapters are self-contained. Read the one you need; there is no required order.

---

## Connectors

Image placeholder · 16:9
A hub-and-spoke illustration on white: the Arble mark centered, with seven thin lines radiating to seven evenly spaced service tiles, each a small rounded glass square bearing a recognizable monochrome service glyph — a repository, a chat bubble, a document page, a cloud, an envelope, a design frame, a database cylinder. Two lines are solid and five dashed, indicating connected versus available. Restrained and even, no visual hierarchy between services.

A connector is an authenticated link to an external service. Installing one adds its tools to the registry; authenticating it makes them usable. Everything a connector contributes still passes the permission gate.

Two things follow from that design and are worth knowing up front. First, the agent cannot tell a connector's tools apart from built-in ones — they share one registry and one schema shape, so adding a connector never requires teaching the planner anything new. Second, a connector holds its own credential, scoped to its own service, so disabling one revokes exactly that access and nothing else.

| Category | Examples |
|---|---|
| Development | GitHub, GitLab, Docker, Kubernetes |
| Productivity | Notion, Linear, Jira, Google Drive |
| Communication | Gmail, Slack, Outlook, Teams |
| Cloud | AWS, Azure, GCP, Cloudflare, Vercel |
| Data | PostgreSQL, MySQL, MongoDB, Redis |
| Design | Figma, Canva, Framer |
| AI Providers | Anthropic, OpenAI, Gemini, Ollama, vLLM |

Connectors compose. One instruction can cross as many as the task needs — read a Figma frame, generate the component, open the pull request, post the link to Slack.

See the [MCP Servers](mcp-servers.md) guide for the full directory and for connecting a service that isn't listed.

---

## Featured guides

Task-shaped walkthroughs. Each ends with something running.

**Building your first Tool**
Write a typed tool with the [Tool SDK](tool-sdk.md), watch Arble generate its schema, permission prompt, CLI command and REST endpoint from the function signature alone.

**Installing an MCP Server**
Add a server, authenticate it, scope its permissions per tool rather than per server, and confirm it with a health check.

**Running Local Models**
Point Arble at Ollama or vLLM, configure routing by task class, and set a fallback chain that doesn't fire on malformed requests.

**Deploying with Docker**
Bring up a production-shaped stack on one host — real Postgres, real Redis, a separated worker — from the [Self-hosting](self-hosting.md) guide.

**Desktop Automation**
Chain screenshots, window focus and input into a reviewable automation file instead of a long shell pipeline.

**Memory Architecture**
How short-term context, long-term facts and embeddings fit together, and why deleting a session does not delete what it learned.

**Building Workflows**
Turn a one-off run into a scheduled or event-triggered workflow with queues, retries and per-step history.

---

## Popular pages

The pages people open most, in the order they usually need them.

1. Install — get Arble running
2. [CLI](cli.md) — the full command surface
3. [API Reference](api-reference.md) — endpoints, schemas, errors
4. Memory — what persists, and how to control it
5. Permissions — grants, scopes, unattended runs
6. [Tool SDK](tool-sdk.md) — build native tools
7. [MCP Servers](mcp-servers.md) — connect existing services
8. [Playbook](playbook.md) — the concepts underneath
9. [Self-hosting](self-hosting.md) — run it on your own infrastructure

---

## Latest documentation

Image placeholder · 16:9
A minimal vertical timeline on white: a single thin grey rule running top to bottom slightly left of center, with five small circular nodes on it. Each node has a short horizontal tick extending right to a two-line entry — a page name in medium weight above a brief change note in lighter grey. Dates sit to the left of the rule in small monospace. Extremely restrained, no color, generous line spacing.

Recently added or substantially revised.

| Page | Change |
|---|---|
| [Tool SDK](tool-sdk.md) | New page — decorators, schemas, streaming, publishing |
| [CLI](cli.md) | New page — full command reference, scripting, CI |
| [API Reference](api-reference.md) | New page — REST, SSE streaming, webhooks, errors |
| [Self-hosting](self-hosting.md) | New page — Docker, Kubernetes, HA, disaster recovery |
| Memory | Expanded — encryption at rest, reindexing, retention |
| [MCP Directory](mcp-servers.md) | Expanded — per-tool permissions, health checks |

Every page carries a last-reviewed date at the bottom. If a page contradicts the product, the page is wrong — please [tell us](#contributing).

---

## Search documentation

Search covers page text, command signatures, endpoint paths and schema field names in one index. It matches on meaning as well as exact strings, so a description of a problem finds the page that solves it.

| Search by | Example query | Lands on |
|---|---|---|
| Concept | why is my agent slow | Performance, Context Windows |
| Command | arble permissions grant | CLI |
| Guide | deploy behind a proxy | Self-hosting networking |
| API | POST /v1/runs | API Reference |
| Connector | postgres read only | MCP Servers |
| Playbook | how does tool calling work | Playbook |

Press `/` anywhere to focus the search field. Results are grouped by section, so you can tell a reference hit from a conceptual one before you click.

Exact-string queries are matched literally — searching `run_not_retryable` finds the error code, not pages that discuss retrying. Wrapping a phrase in quotes forces the same behavior for ordinary words.

Two habits make search noticeably better here. Search the error, not your theory about the error — error codes and messages are indexed verbatim, and the page that defines a code is almost always the page that explains the fix. And search the command you were about to guess at; every flag in the [CLI](cli.md) reference is indexed individually, so `--no-prompt` resolves directly rather than requiring you to find the CLI page first.

---

## Need help

Start with the documentation and the Playbook. If the answer isn't there, the remaining options are ordered by how quickly they typically resolve things.

**Documentation**
You are here. Use search before browsing — the hierarchy is for exploring, the index is for finding.

**[Playbook](playbook.md)**
For conceptual confusion rather than a specific error. If a behavior seems wrong, it is often working as designed for a reason explained here.

**Community**
Other operators, and the fastest route for "how do people usually do this." Not an official support channel.

**GitHub**
Bug reports and feature requests. Include the `request_id` from the error and the output of `arble version`.

**Status**
Current availability of hosted services. Check here before debugging a connector that stopped working an hour ago.

**Blog**
Deeper writeups on architecture decisions and new capabilities.

**Release Notes**
What changed, what broke, and what you need to do about it. Read before upgrading a production deployment.

> **Filing a good bug report.** Include the `request_id`, `arble version` output, and the relevant `arble trace <agent>` excerpt. Those three make most reports reproducible immediately.

---

## Contributing

This documentation is versioned alongside the product, and corrections from people using it in production are the most valuable input it gets.

**Reporting mistakes**
Every page has an edit link and an issue link. A one-line report that a command's flag is wrong is worth more than a long complaint that a page is unclear.

**Editing pages**
Open a pull request against the docs repository. Prose changes need no issue first; structural changes are worth discussing before you write.

**Examples**
The highest-leverage contribution. A realistic example that works beats three paragraphs describing what it would look like. Examples must run as written.

**Translations**
Community-maintained, tracked per page against the English source so a stale translation is visibly stale rather than quietly wrong.

---

## Documentation principles

What we optimize for, so you know what to expect and what to hold us to.

**Technical accuracy over approachability.** Where the two conflict, accuracy wins. A simplification that misleads costs more than a sentence that requires rereading.

**Minimal writing.** Every sentence earns its place. No preamble restating the heading, no summary restating the section.

**Real examples.** Examples use plausible values and run as written. No `foo`, no `your-thing-here`, no code that would fail if pasted.

**Production-ready guidance.** Defaults shown are defaults we would deploy. Where a shortcut is only appropriate for evaluation, the page says so explicitly.

**No unnecessary abstraction.** Concepts are introduced when they are needed, not in a glossary you must read first. If a page can be understood without a diagram, it has no diagram.

We also state what we don't know. Where behavior depends on your model, your hardware or your data volume, the page tells you to measure rather than guessing on your behalf.

---

**Previous:** [Playbook](playbook.md) · **Next:** [Changelog](#)
