# Body content for pages that are authored here rather than lifted from an
# existing standalone file. Each value is the inner HTML of <article>, minus the
# crumb/title/prev-next chrome, which build.py adds.
#
# These are deliberately focused pages, not flagship-length ones. Each covers
# its own topic completely and links out rather than restating neighbours.

BODIES = {

# ── Getting Started ──────────────────────────────────────────────────────────
"getting-started/install": """
<p class="docs__lead">Arble installs as a desktop app, a CLI, or both. They are two clients of the
same local daemon, so the choice is preference rather than capability.</p>

<h2 id="macos">macOS</h2>
<p>Homebrew is the supported path and installs the daemon alongside the CLI.</p>
<div class="docs__code"><pre><code id="c-brew">brew install arble/tap/arble</code></pre>
<button class="docs__copy" type="button" data-copy="c-brew" aria-label="Copy code">Copy</button></div>

<h2 id="linux">Linux</h2>
<p>The install script detects your architecture and places the binary in
<code>/usr/local/bin</code>.</p>
<div class="docs__code"><pre><code id="c-linux">curl -fsSL https://arble.ai/install.sh | sh</code></pre>
<button class="docs__copy" type="button" data-copy="c-linux" aria-label="Copy code">Copy</button></div>

<h2 id="windows">Windows</h2>
<p>winget, or the standalone <code>.exe</code> from the releases page. WSL2 is supported for
development; native Windows is supported for the desktop app.</p>
<div class="docs__code"><pre><code id="c-win">winget install Arble.CLI</code></pre>
<button class="docs__copy" type="button" data-copy="c-win" aria-label="Copy code">Copy</button></div>

<h2 id="verify">Verify the install</h2>
<p><code>arble version</code> prints both the CLI and daemon versions. They need not match exactly,
but the CLI warns when the gap is wide enough to matter.</p>

<h2 id="signatures">Verifying a release</h2>
<p>Every artifact is published with a checksum and a signature. In regulated environments, verify
before installing rather than after.</p>
<div class="docs__code"><pre><code id="c-verify">curl -fsSLO https://releases.arble.ai/v1.8.2/arble-linux-arm64
curl -fsSLO https://releases.arble.ai/v1.8.2/checksums.txt
sha256sum -c checksums.txt --ignore-missing</code></pre>
<button class="docs__copy" type="button" data-copy="c-verify" aria-label="Copy code">Copy</button></div>

<div class="docs__note"><p>Pin an exact patch version in any automated install.
<code>latest</code> is for local experiments &#8212; it will change under a script that
assumes otherwise.</p></div>
""",

"getting-started/pair-device": """
<p class="docs__lead">Pairing links a phone or a second machine to your Arble installation. It is what
makes desktop control, mobile notifications and cross-device sessions possible.</p>

<h2 id="what-pairing-grants">What pairing actually grants</h2>
<p>A pairing issues a device token scoped to that one device. The token is the only credential the
desktop and mobile endpoints accept, and it grants nothing on its own &#8212; each capability still
passes the permission gate.</p>

<h2 id="pair">Pair a device</h2>
<div class="docs__code"><pre><code id="c-pair">arble mobile pair</code></pre>
<button class="docs__copy" type="button" data-copy="c-pair" aria-label="Copy code">Copy</button></div>
<p>The command prints a code. Enter it in the Arble app on the device you are pairing. The exchange
happens over your local network; nothing transits a third party.</p>

<h2 id="verify">Confirm it worked</h2>
<div class="docs__code"><pre><code id="c-devices">$ arble devices ls
NAME              KIND     STATUS     LAST SEEN
lori-iphone       mobile   online     just now
lori-mbp          desktop  online     just now</code></pre>
<button class="docs__copy" type="button" data-copy="c-devices" aria-label="Copy code">Copy</button></div>

<h2 id="revoke">Revoking</h2>
<p>Revocation takes effect on the next call. Revoke immediately if a device is lost &#8212; the token
lives in that device's keychain, not in your account.</p>
<div class="docs__code"><pre><code id="c-revoke">arble devices revoke lori-iphone</code></pre>
<button class="docs__copy" type="button" data-copy="c-revoke" aria-label="Copy code">Copy</button></div>

<div class="docs__note"><p>Camera and microphone always prompt on the device itself, regardless of
pairing or granted permissions. There is no configuration that enables silent capture.</p></div>
""",

"getting-started/first-run": """
<p class="docs__lead">The first time you start Arble it makes three decisions with you: which model to
use, what it is allowed to touch, and where to keep state. Worth doing deliberately rather than
clicking through.</p>

<h2 id="model">Choosing a model</h2>
<p>Arble does not ship a model. It asks you to point it at one &#8212; a local runtime such as Ollama
or vLLM, or a hosted provider. Local means nothing leaves the machine; hosted means prompts and
completions do.</p>
<p>You can change this later, and route different task classes to different models. See
<strong>Models</strong> in the self-hosting guide.</p>

<h2 id="permissions">The first permission prompts</h2>
<p>The first run that needs to read a file, reach the network or run a command will stop and ask. This
is the permission gate, and it is the single most important thing to understand early.</p>
<p>Grant narrowly. <code>filesystem.read</code> scoped to one project directory is almost always the
right first answer; granting it unscoped is almost always the wrong one.</p>

<h2 id="state">Where state lives</h2>
<div class="docs__tablewrap"><table class="docs__table">
<thead><tr><th scope="col">Path</th><th scope="col">Contents</th></tr></thead>
<tbody>
<tr><th scope="row" class="mono">~/.arble/config.toml</th><td>Profiles and global defaults. No credentials.</td></tr>
<tr><th scope="row" class="mono">~/.arble/data</th><td>Sessions, runs, memory index.</td></tr>
<tr><th scope="row" class="mono">OS keychain</th><td>Every credential and token. Never a file.</td></tr>
</tbody></table></div>

<h2 id="first-run-checklist">A good first run</h2>
<p>Ask for something read-only and verifiable, so you can watch the loop without risk:</p>
<div class="docs__code"><pre><code id="c-first">arble run "List the files in this directory and tell me what this project does"</code></pre>
<button class="docs__copy" type="button" data-copy="c-first" aria-label="Copy code">Copy</button></div>
<p>You should see it plan, request <code>filesystem.read</code>, wait for you, then answer. That
sequence &#8212; plan, ask, act &#8212; is the whole product in miniature.</p>
""",

"getting-started/configuration": """
<p class="docs__lead">Configuration resolves in one order, most specific first: command-line flags,
environment variables, the project <code>arble.json</code>, then the user config file.</p>

<p>That precedence is what lets a project commit a sensible default that CI overrides without editing
anything.</p>

<h2 id="project">Project configuration</h2>
<p><code>arble.json</code> sits in the repository root and is meant to be committed. It is how a
teammate cloning the repo gets the same skills, connectors and permission scopes you have.</p>
<div class="docs__code"><pre><code id="c-proj">{
  "project": "api-gateway",
  "skills": ["@acme/release-checklist@2.1.0"],
  "connectors": ["github", "postgres"],
  "permissions": {
    "filesystem.write": ["./src", "./tests"],
    "network.http": ["api.github.com"]
  }
}</code></pre>
<button class="docs__copy" type="button" data-copy="c-proj" aria-label="Copy code">Copy</button></div>

<h2 id="user">User configuration</h2>
<p><code>~/.arble/config.toml</code> holds profiles and machine-level defaults. A profile bundles an
endpoint, an organization and a credential under one name.</p>
<div class="docs__code"><pre><code id="c-user">[profiles.local]
endpoint = "unix:///var/run/arble.sock"
org = "acme-eng"

[profiles.staging]
endpoint = "https://arble.staging.example.com"
org = "acme-eng"
log_level = "debug"</code></pre>
<button class="docs__copy" type="button" data-copy="c-user" aria-label="Copy code">Copy</button></div>

<h2 id="secrets">What never goes in either file</h2>
<p>Credentials. Both files are plain text and one of them is committed. Secrets resolve from the OS
keychain or a secret manager; reference them by name.</p>

<div class="docs__note"><p><code>arble server config --list</code> prints every setting with its
resolved value and which layer it came from. That is the fastest way to answer &#8220;why is this
setting not taking effect.&#8221;</p></div>
""",

"getting-started/system-requirements": """
<p class="docs__lead">Arble itself is a CPU workload. GPUs serve model inference and, optionally,
embeddings &#8212; if your models are remote, you need no GPU at all.</p>

<div class="docs__tablewrap"><table class="docs__table">
<thead><tr><th scope="col"></th><th scope="col">Minimum</th><th scope="col">Recommended</th></tr></thead>
<tbody>
<tr><th scope="row">CPU</th><td>4 vCPU</td><td>8 vCPU</td></tr>
<tr><th scope="row">RAM</th><td>8 GB</td><td>32 GB</td></tr>
<tr><th scope="row">Storage</th><td>40 GB SSD</td><td>250 GB NVMe</td></tr>
<tr><th scope="row">GPU</th><td>None</td><td>1 &#215; 24 GB, for local models</td></tr>
<tr><th scope="row">OS</th><td>Linux 5.15+, macOS 14+</td><td>Linux 5.15+</td></tr>
</tbody></table></div>

<h2 id="os">Operating systems</h2>
<p>Ubuntu 22.04 LTS and 24.04, Debian 12, RHEL 9 and derivatives are tested. macOS 14+ is supported
for desktop and workstation use. Windows is supported through WSL2 for development, not production.</p>

<h2 id="kernel">Kernel requirements</h2>
<p>Tool sandboxing uses cgroups v2, user namespaces and seccomp. On a kernel older than 5.15, or one
with user namespaces disabled, Arble falls back to weaker isolation and logs a warning at startup
&#8212; it degrades rather than failing, which is worth knowing before you rely on the sandbox.</p>

<div class="docs__code"><pre><code id="c-check">arble server verify-sandbox</code></pre>
<button class="docs__copy" type="button" data-copy="c-check" aria-label="Copy code">Copy</button></div>

<h2 id="storage">Storage characteristics</h2>
<p>The database is latency-sensitive on writes; put it on NVMe or provisioned IOPS. Object storage is
throughput-sensitive rather than latency-sensitive, so network storage is fine there.</p>
<p>Plan roughly 2 GB of database per 10,000 runs retained. Files and screenshots dominate total volume,
not run records.</p>
""",

"getting-started/updates": """
<p class="docs__lead">Arble uses semantic versioning. Patch and minor releases are backward
compatible; major releases may require documented migration steps.</p>

<h2 id="check">Updating</h2>
<div class="docs__code"><pre><code id="c-up">brew upgrade arble          # macOS
arble server migrate        # apply any schema changes first</code></pre>
<button class="docs__copy" type="button" data-copy="c-up" aria-label="Copy code">Copy</button></div>

<h2 id="pin">Pinning a version</h2>
<p>In production, pin the exact patch version and upgrade deliberately. An automated install that
resolves <code>latest</code> will eventually pick up a change you did not schedule.</p>

<h2 id="compat">What stays compatible</h2>
<div class="docs__tablewrap"><table class="docs__table">
<thead><tr><th scope="col">Change</th><th scope="col">Ships in</th></tr></thead>
<tbody>
<tr><th scope="row">New field, endpoint, event or enum value</th><td>Any release, without notice</td></tr>
<tr><th scope="row">New optional parameter</th><td>Patch or minor</td></tr>
<tr><th scope="row">Removed or retyped required field</th><td>Major only</td></tr>
<tr><th scope="row">Changed default behaviour</th><td>Major only</td></tr>
</tbody></table></div>
<p>Treat unknown fields and unrecognized enum values as forward-compatible. A client that rejects them
will break on a routine release.</p>

<h2 id="disable">Disabling update checks</h2>
<p>Air-gapped deployments should turn the check off rather than let it time out on every start.</p>
<div class="docs__code"><pre><code id="c-nocheck">updates:
  check: false</code></pre>
<button class="docs__copy" type="button" data-copy="c-nocheck" aria-label="Copy code">Copy</button></div>
""",

# ── Agent ────────────────────────────────────────────────────────────────────
"agent/sessions": """
<p class="docs__lead">A session is a conversation with accumulated context: the messages, the tool
calls, and the permission grants made along the way. Agents run inside sessions.</p>

<h2 id="lifecycle">Lifecycle</h2>
<div class="docs__tablewrap"><table class="docs__table">
<thead><tr><th scope="col">State</th><th scope="col">Meaning</th></tr></thead>
<tbody>
<tr><th scope="row" class="mono">active</th><td>Accepting runs</td></tr>
<tr><th scope="row" class="mono">paused</th><td>Runs cancelled, context kept. Costs nothing</td></tr>
<tr><th scope="row" class="mono">archived</th><td>Read-only. Context retained, no new runs</td></tr>
</tbody></table></div>

<div class="docs__code"><pre><code id="c-ses">arble sessions new --title "Payment retry audit"
arble sessions resume ses_3pLwRt9     # reattach, context intact
arble sessions pause ses_8kQ2mVx      # stop agents, keep context
arble sessions kill ses_8kQ2mVx       # end and release context</code></pre>
<button class="docs__copy" type="button" data-copy="c-ses" aria-label="Copy code">Copy</button></div>

<h2 id="fresh">When to start a fresh session</h2>
<p>This is the judgment call that most affects both cost and output quality. Continue a session when
the new request depends on what came before. Start fresh when it does not.</p>
<p>A long session carries its whole history into every run, so an unrelated question asked in a stale
session pays for context it cannot use &#8212; and is more likely to be answered as though it related
to the earlier work.</p>

<h2 id="export">Export</h2>
<p>Exports contain messages, tool calls with arguments and results, and every permission decision.
This is the artifact to attach to an incident review.</p>
<div class="docs__code"><pre><code id="c-exp">arble sessions export ses_7nBcYs4 --format json &gt; triage.json</code></pre>
<button class="docs__copy" type="button" data-copy="c-exp" aria-label="Copy code">Copy</button></div>

<div class="docs__note"><p>Deleting a session does <strong>not</strong> delete what it wrote to
memory. Memory is project-scoped and outlives sessions by design.</p></div>
""",

"agent/memory": """
<p class="docs__lead">Memory is what makes an agent useful on the second run. It is per-project,
persistent, and retrieved semantically rather than by keyword.</p>

<h2 id="kinds">Two kinds of memory</h2>
<p><strong>Short-term</strong> is session context: the messages and tool results of the current
conversation. Bounded by the model's context window, discarded when the session is deleted.</p>
<p><strong>Long-term</strong> is durable facts, deliberately written and semantically retrieved. It
outlives the session that produced it.</p>

<h2 id="what-belongs">What belongs in memory</h2>
<p>Facts that stay true: a constraint, a decision and its reason, a gotcha that cost someone an hour.
Not a log of what happened &#8212; use a session export for that.</p>
<div class="docs__code"><pre><code id="c-mem">arble memory add "Staging shares the production Redis. Never flush from staging."
arble memory search "why the postgres driver is pinned"
arble memory rm mem_2fQx8Lp</code></pre>
<button class="docs__copy" type="button" data-copy="c-mem" aria-label="Copy code">Copy</button></div>

<h2 id="summarize">Summarizing</h2>
<p>Memory is read at the start of every run, so its size is a recurring cost rather than a one-time
one. Summarizing collapses related entries into fewer, denser ones.</p>
<div class="docs__code"><pre><code id="c-sum">arble memory summarize --older-than 90d</code></pre>
<button class="docs__copy" type="button" data-copy="c-sum" aria-label="Copy code">Copy</button></div>

<h2 id="embeddings">Embeddings and reindexing</h2>
<p>Entries are embedded by the configured embedding model. Vectors from different models are not
comparable, so changing the model requires a full reindex.</p>
<div class="docs__code"><pre><code id="c-re">arble memory reindex --model local-embed-v2</code></pre>
<button class="docs__copy" type="button" data-copy="c-re" aria-label="Copy code">Copy</button></div>

<h2 id="encryption">Encryption</h2>
<p>Memory contents are encrypted with a project-scoped key before being written, so a database dump
does not yield readable memory without the key. Back that key up separately from the database
&#8212; encrypted memory with no key is not a backup.</p>
""",

"agent/skills": """
<p class="docs__lead">A skill is a packaged procedure: instructions, and optionally the tools and files
that go with it. Where a tool is one capability, a skill is a way of working.</p>

<h2 id="vs-tools">Skills versus tools</h2>
<p>A tool does one thing &#8212; open a pull request. A skill describes how your team does something
&#8212; review a diff against a checklist, then open a pull request with the checklist result in the
description. Skills call tools; the reverse is not true.</p>

<h2 id="manage">Installing and managing</h2>
<div class="docs__code"><pre><code id="c-sk">arble skills install @acme/release-checklist
arble skills install ./skills/incident-review   # local path, for development
arble skills disable @arble/pr-description      # installed, hidden from planner
arble skills update @acme/release-checklist
arble skills rm @arble/pr-description</code></pre>
<button class="docs__copy" type="button" data-copy="c-sk" aria-label="Copy code">Copy</button></div>

<div class="docs__code"><pre><code id="c-skls">$ arble skills ls
NAME                      VERSION  STATE     SCOPE
@acme/release-checklist   2.1.0    enabled   project
@acme/incident-review     0.4.2    enabled   project
@arble/pr-description     1.0.0    disabled  global</code></pre>
<button class="docs__copy" type="button" data-copy="c-skls" aria-label="Copy code">Copy</button></div>

<h2 id="disable">Disable rather than uninstall</h2>
<p>A disabled skill stays installed but is invisible to the planner. This is the right way to narrow
what an agent considers for a particular kind of work, and it is reversible without reinstalling.</p>

<h2 id="pin">Pinning</h2>
<p>Skills are pinned by default and belong in <code>arble.json</code>. A registry update that changes
how an agent behaves mid-sprint is a bad surprise; pinning prevents it.</p>
""",

"agent/permissions": """
<p class="docs__lead">Every tool call passes the permission gate, whether it came from the app, the
CLI, a scheduled job or the API. If a tool is running, it has already been allowed.</p>

<h2 id="levels">Grant levels</h2>
<div class="docs__tablewrap"><table class="docs__table">
<thead><tr><th scope="col">Level</th><th scope="col">Behaviour</th></tr></thead>
<tbody>
<tr><th scope="row">Always allow</th><td>Granted once, never prompts again</td></tr>
<tr><th scope="row">Ask every time</th><td>Prompts on every call, regardless of prior answers</td></tr>
<tr><th scope="row">Never allow</th><td>Fails immediately, no prompt shown</td></tr>
</tbody></table></div>

<h2 id="scope">Scope is the important part</h2>
<p>A capability without a scope is a blank cheque. Scope every filesystem and network grant to the
narrowest path or host that works.</p>
<div class="docs__code"><pre><code id="c-perm">arble permissions grant filesystem.write --scope "~/Projects/api-gateway"
arble permissions grant network.http --scope "api.github.com"
arble permissions revoke network.http --scope "api.github.com"</code></pre>
<button class="docs__copy" type="button" data-copy="c-perm" aria-label="Copy code">Copy</button></div>

<h2 id="inherit">Inheritance</h2>
<p>Grants are scoped per tool, per workflow or per session, and inherit down a call chain. A workflow
granted <code>network.http</code> does not make a called tool re-prompt &#8212; but a tighter scope on
that tool is still enforced on top. Inheritance never loosens a scope.</p>

<h2 id="unattended">Unattended runs</h2>
<p>In the foreground a call needing approval pauses and prompts. In a background or CI run there is
nobody to ask, so it fails closed. Declare what the job needs up front and pass
<code>--no-prompt</code> so it fails fast rather than hanging.</p>

<h2 id="audit">Audit</h2>
<div class="docs__code"><pre><code id="c-aud">$ arble permissions audit --since 24h
TIME      AGENT        TOOL                DECISION  SCOPE
14:02:11  agt_5wTn9Kd  filesystem.read     auto      ~/Projects/api-gateway
14:02:19  agt_5wTn9Kd  github.create_pr    approved  acme/api-gateway
14:03:40  agt_5wTn9Kd  postgres.query      denied    production</code></pre>
<button class="docs__copy" type="button" data-copy="c-aud" aria-label="Copy code">Copy</button></div>

<div class="docs__note"><p>When a run stops early, read the audit log before the trace. A denied
capability explains it more often than anything else.</p></div>
""",

"agent/automation": """
<p class="docs__lead">Anything you can run once, you can run on a schedule or in response to an event.
Automations are stored server-side, so they run whether or not your shell is open.</p>

<h2 id="schedules">Schedules</h2>
<p>Cron syntax, evaluated in the project's timezone.</p>
<div class="docs__code"><pre><code id="c-sched">arble schedule create nightly-triage \\
  --cron "0 7 * * 1-5" \\
  --task "Summarize failing CI runs from the last 24 hours and post to #eng-alerts"</code></pre>
<button class="docs__copy" type="button" data-copy="c-sched" aria-label="Copy code">Copy</button></div>

<h2 id="triggers">Triggers</h2>
<p>Event-driven rather than time-driven. A trigger fires on a webhook or a connector event.</p>
<div class="docs__code"><pre><code id="c-trig">arble triggers create pr-review \\
  --on github.pull_request.opened \\
  --max-retries 3 \\
  --task "Review the diff against @acme/release-checklist and comment"</code></pre>
<button class="docs__copy" type="button" data-copy="c-trig" aria-label="Copy code">Copy</button></div>

<h2 id="queues">Queues</h2>
<p>Jobs in the same queue run serially; different queues run in parallel. Use one queue per resource
that cannot tolerate concurrent writes &#8212; and a separate queue from interactive work, so a
nightly batch does not starve users.</p>

<h2 id="retries">Retries</h2>
<p>Failed jobs retry with exponential backoff, bounded by <code>--max-retries</code>. Only errors the
tool marked retryable are retried. A permission denial is never retried, because retrying cannot
change the outcome.</p>

<h2 id="jobs">Inspecting runs</h2>
<div class="docs__code"><pre><code id="c-jobs">arble jobs ls
arble jobs logs job_4hVn2Qs</code></pre>
<button class="docs__copy" type="button" data-copy="c-jobs" aria-label="Copy code">Copy</button></div>

<div class="docs__note"><p>Prefer <code>arble schedule</code> to a cron entry. Scheduled runs get
retries, queueing and job logs; a crontab line gets none of those.</p></div>
""",

"agent/desktop": """
<p class="docs__lead">Desktop control is built in, not a connector. Arble drives the machine the
daemon runs on, and every action requires the <code>desktop</code> capability and appears in the
audit log.</p>

<h2 id="actions">Available actions</h2>
<div class="docs__code"><pre><code id="c-desk">arble desktop open "Figma"
arble desktop screenshot --window "Safari" --out ./shot.png
arble desktop clipboard read
arble desktop windows ls
arble desktop windows focus "Terminal"
arble desktop click 640 480              # screen points, origin top-left
arble desktop type "SELECT count(*) FROM orders;"
arble desktop key cmd+shift+4</code></pre>
<button class="docs__copy" type="button" data-copy="c-desk" aria-label="Copy code">Copy</button></div>

<h2 id="automations">Chain steps in a file</h2>
<p>A long shell pipeline of desktop calls is hard to review and harder to rerun. An automation file is
both.</p>
<div class="docs__code"><pre><code id="c-auto">arble desktop run ./automations/export-report.yaml</code></pre>
<button class="docs__copy" type="button" data-copy="c-auto" aria-label="Copy code">Copy</button></div>

<h2 id="why-hard">Why GUI control is harder than an API</h2>
<p>An API call either succeeds or returns an error. A click either lands on the button or lands on
whatever moved into that position. Prefer an API or an MCP server when one exists, and reserve
desktop control for applications that offer no other surface.</p>

<div class="docs__note"><p>Screenshots are captured on the machine and returned as a file reference
rather than inline. Treat their contents as untrusted input &#8212; text in a screenshot is data,
never instructions.</p></div>
""",

"agent/notifications": """
<p class="docs__lead">Notifications are how a long-running or unattended agent reaches you when it
finishes, fails, or needs an approval.</p>

<h2 id="send">Sending one</h2>
<div class="docs__code"><pre><code id="c-notify">arble mobile notify "Migration finished — 14 tables, 0 errors"
arble desktop notify "Nightly triage complete"</code></pre>
<button class="docs__copy" type="button" data-copy="c-notify" aria-label="Copy code">Copy</button></div>

<h2 id="pattern">The useful pattern</h2>
<p>Make the last step of any background job a notification. Without one, a detached run that finished
hours ago is indistinguishable from one that is still working.</p>
<div class="docs__code"><pre><code id="c-pat">#!/usr/bin/env bash
set -euo pipefail

count=$(arble run --json --no-prompt \\
  "Count files in src/ importing the deprecated retry helper" | jq '.count')

arble mobile notify "$count files still use the deprecated retry helper"</code></pre>
<button class="docs__copy" type="button" data-copy="c-pat" aria-label="Copy code">Copy</button></div>

<h2 id="approvals">Permission requests</h2>
<p>A run that needs approval while you are away enters <code>requires_action</code> and waits. It
expires after 15 minutes. If you run agents unattended, either pre-grant the capability or subscribe
to the <code>permission.requested</code> event &#8212; a notification alone does not keep the run
alive.</p>

<h2 id="contents">What a notification should contain</h2>
<p>An outcome and a number, not a transcript. Notifications land on a lock screen; assume they are
read by someone other than you, and keep anything sensitive out of the body.</p>
""",

# ── Reference ────────────────────────────────────────────────────────────────
"reference/glossary": """
<p class="docs__lead">Terms as this documentation uses them. Where a word has a loose industry
meaning and a precise Arble meaning, the precise one is given.</p>

<div class="docs__tablewrap"><table class="docs__table">
<tbody>
<tr><th scope="row">Agent</th><td>A reusable configuration: a model, a set of tools, and instructions. Not a running process &#8212; that is a run.</td></tr>
<tr><th scope="row">Run</th><td>One execution of an agent. Has a status, a deadline, and usage.</td></tr>
<tr><th scope="row">Session</th><td>A conversation with accumulated context. Runs happen inside sessions.</td></tr>
<tr><th scope="row">Tool</th><td>One typed capability the agent can call, with an input and output schema.</td></tr>
<tr><th scope="row">Skill</th><td>A packaged procedure that calls tools. A way of working, not a capability.</td></tr>
<tr><th scope="row">Connector</th><td>An authenticated link to an external service, contributing tools.</td></tr>
<tr><th scope="row">MCP</th><td>Model Context Protocol. A standard for exposing tools to any compatible client.</td></tr>
<tr><th scope="row">Tool registry</th><td>The single index of every callable tool, regardless of source.</td></tr>
<tr><th scope="row">Planner</th><td>The component that picks which tool to call for a step.</td></tr>
<tr><th scope="row">Permission gate</th><td>The check every tool call passes before executing.</td></tr>
<tr><th scope="row">Capability</th><td>A permission subject, such as <code>filesystem.write</code>.</td></tr>
<tr><th scope="row">Scope</th><td>The narrowing on a capability &#8212; a path, a host, a repository.</td></tr>
<tr><th scope="row">Memory</th><td>Durable per-project facts, retrieved semantically. Outlives sessions.</td></tr>
<tr><th scope="row">Project</th><td>The unit that scopes memory, permissions and connectors.</td></tr>
<tr><th scope="row">Workspace</th><td>Several projects sharing memory and connectors.</td></tr>
<tr><th scope="row">Profile</th><td>An endpoint, organization and credential under one name.</td></tr>
<tr><th scope="row">Worker</th><td>The sandboxed process that executes tool code. Holds no database credentials.</td></tr>
<tr><th scope="row">Resource</th><td>A typed non-scalar tool input or output &#8212; a file, image, table or database handle.</td></tr>
<tr><th scope="row">Requires action</th><td>A run paused waiting on you, for an approval or a tool result.</td></tr>
<tr><th scope="row">Drain</th><td>Letting in-flight runs finish before a process shuts down.</td></tr>
</tbody></table></div>
""",

"reference/faq": """
<p class="docs__lead">Questions that come up repeatedly. Longer answers live on the page that owns the
topic; these are the short forms.</p>

<div class="docs__acc">
<details class="docs__item" open><summary>Do I need a GPU?</summary>
<p>Only for local inference or local embeddings. Arble itself is a CPU workload &#8212; point it at a
hosted provider and you need no GPU at all.</p></details>

<details class="docs__item"><summary>Does Arble send my data anywhere?</summary>
<p>Only where you configure it to. A local model means prompts never leave the machine. A hosted model
means prompts and completions go to that provider. Memory, audit logs and session history stay
local either way.</p></details>

<details class="docs__item"><summary>Can I use it fully offline?</summary>
<p>Yes, with a local model. Connectors and remote MCP servers need network access; sessions, memory,
permissions and desktop control do not.</p></details>

<details class="docs__item"><summary>How do I stop an agent mid-run?</summary>
<p>Ctrl-C in the foreground, or <code>arble agents kill &lt;id&gt;</code> for a background one. Both
cancel cooperatively &#8212; an in-flight tool call gets the chance to stop cleanly.</p></details>

<details class="docs__item"><summary>Why did my run stop early?</summary>
<p>Usually a denied permission rather than a bug. Check
<code>arble permissions audit</code> before reading the trace.</p></details>

<details class="docs__item"><summary>Does deleting a session delete its memory?</summary>
<p>No. Memory is project-scoped and outlives sessions deliberately. Delete memory entries
explicitly.</p></details>

<details class="docs__item"><summary>What is the difference between a tool and a skill?</summary>
<p>A tool is one capability. A skill is a procedure that calls tools. Skills describe how your team
works; tools describe what is possible.</p></details>

<details class="docs__item"><summary>Do I need MCP if I use the Tool SDK?</summary>
<p>No, and they solve different problems. MCP connects Arble to a server someone else runs; the Tool
SDK builds a tool that runs as part of Arble. Many setups use both.</p></details>

<details class="docs__item"><summary>Can two people share a project?</summary>
<p>Yes. Projects belong to the organization; memory and permission grants are shared. Sessions are
per-user unless explicitly shared.</p></details>

<details class="docs__item"><summary>Is the CLI output safe to parse?</summary>
<p>Parse <code>--json</code>, not the rendered tables. Table layout changes between releases; the JSON
shape is versioned.</p></details>
</div>
""",

"reference/troubleshooting": """
<p class="docs__lead">Organized by symptom, since that is what you have when you arrive. Start with
<code>arble server verify --all</code>, which checks database, model backends, storage and sandbox in
one pass.</p>

<div class="docs__acc">
<details class="docs__item" open><summary>A run stops early with no obvious error</summary>
<p>Almost always a denied capability. <code>arble permissions audit --agent &lt;id&gt; --since 1h</code>
shows the decision. Under a deny-by-default policy every capability must be granted explicitly.</p></details>

<details class="docs__item"><summary>The model is unavailable or runs queue forever</summary>
<p>Test the backend directly, bypassing Arble. If the backend answers and Arble disagrees, the
configured <code>base_url</code> is wrong or egress is blocked from the runtime.</p></details>

<details class="docs__item"><summary>A connector stopped working</summary>
<p><code>auth: expired</code> means re-authorize. <code>status: unreachable</code> means DNS or egress.
The two need different fixes, and <code>arble connectors status &lt;name&gt;</code> distinguishes
them.</p></details>

<details class="docs__item"><summary>A tool is reported as unavailable</summary>
<p>Run <code>arble mcp health</code> first. A server in <code>error</code> state contributes zero
tools, which the agent reports as the tool not existing.</p></details>

<details class="docs__item"><summary>Streams cut off at a fixed interval</summary>
<p>A proxy, not Arble. Turn off response buffering and raise the read timeout above your longest run.
This is the single most common self-hosted misconfiguration.</p></details>

<details class="docs__item"><summary>Everything is slow at once</summary>
<p>Check database connections before hardware. Pool exhaustion presents as uniform slowness across
unrelated operations.</p></details>

<details class="docs__item"><summary>Writes fail and runs break broadly</summary>
<p>Storage. <code>arble admin storage-usage</code> shows what grew &#8212; usually files and
screenshots. Confirm the retention job is actually running; a leader-election failure stops it
silently.</p></details>

<details class="docs__item"><summary>Memory search returns nothing useful</summary>
<p>If you changed embedding models, the index needs rebuilding &#8212; vectors from different models
are not comparable. Run <code>arble memory reindex</code>.</p></details>
</div>

<h2 id="report">Filing a report</h2>
<p>Include the <code>request_id</code>, the output of <code>arble version</code>, and the relevant
<code>arble trace &lt;agent&gt;</code> excerpt. Those three make most reports reproducible
immediately.</p>
""",

"reference/release-notes": """
<p class="docs__lead">What changed, what broke, and what to do about it. Read this before upgrading a
production deployment.</p>

<div class="docs__note"><p>Entries below describe the shape of a release note rather than a shipped
history. Replace with real release content before publishing.</p></div>

<h2 id="1-8">1.8</h2>
<p><strong>Added.</strong> Tool SDK support for Go and Rust, reaching parity with Python and
TypeScript. Resumable uploads for files above 100 MB. Per-tool permissions for MCP servers, replacing
the previous per-server grant.</p>
<p><strong>Changed.</strong> The runtime now reports unready rather than failing requests while the
database is unreachable, so load balancers drain it instead of returning errors.</p>
<p><strong>Deprecated.</strong> Per-server MCP permission grants. They continue to work and will be
removed in 2.0; migrate with <code>arble mcp permissions &lt;name&gt;</code>.</p>

<h2 id="1-7">1.7</h2>
<p><strong>Added.</strong> Memory encryption at rest with project-scoped keys. Workflow pause and
resume at step boundaries. <code>arble server drain</code> for graceful shutdown.</p>
<p><strong>Fixed.</strong> Streaming runs no longer terminate when a client disconnects; the run
continues server-side and must be cancelled explicitly.</p>

<h2 id="upgrading">Upgrading</h2>
<p>Migrations are additive within a minor release, so the previous version keeps running against the
new schema during a rollout. Run them as a discrete step before rolling the application:</p>
<div class="docs__code"><pre><code id="c-mig">arble server migrate
</code></pre>
<button class="docs__copy" type="button" data-copy="c-mig" aria-label="Copy code">Copy</button></div>
<p>Test any upgrade against staging restored from a production backup. Migration duration scales with
data volume, and that is not a number to discover in production.</p>
""",
}
