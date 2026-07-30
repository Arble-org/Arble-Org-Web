# CLI

*Developers / CLI*

Image placeholder · 16:9
A premium Apple-keynote render on a near-black background: a floating matte-black terminal window, slightly rotated in three-quarter perspective, hovering above three translucent glass planes that catch a soft rim light from the upper left. Two typed commands lift off the terminal surface and become small floating execution cards — one showing a progress bar, one showing a green checkmark — connected back to the prompt by thin luminous threads. Monochrome throughout, no color accents, deep shadow beneath the window.

## Everything. One command away.

The Arble CLI is a complete client, not a companion to the desktop app. Every capability the UI exposes — sessions, agents, memory, permissions, connectors, desktop and mobile control — is reachable from the terminal, with the same permission gate and the same audit log behind it.

This makes Arble scriptable. An agent run you'd normally start by typing into a window can instead be a line in a Makefile, a cron entry, or a step in CI. The CLI is the same client the app uses, talking to the same local daemon, so there's no drift between what you can automate and what you can do by hand.

---

## On this page

- [Installation](#installation)
- [Authentication](#authentication)
- [Projects](#projects)
- [Sessions](#sessions)
- [Running agents](#running-agents)
- [Memory](#memory)
- [Skills](#skills)
- [Connectors](#connectors)
- [MCP](#mcp)
- [Permissions](#permissions)
- [Desktop](#desktop)
- [Mobile](#mobile)
- [Automation](#automation)
- [Logs](#logs)
- [Observability](#observability)
- [Configuration](#configuration)
- [Debugging](#debugging)
- [Scripting](#scripting)
- [CI/CD](#cicd)
- [Command reference](#command-reference)
- [Environment variables](#environment-variables)
- [Exit codes](#exit-codes)
- [Best practices](#best-practices)
- [FAQ](#faq)

---

## Installation

The CLI is a single static binary with no runtime dependency. It talks to the Arble daemon over a local socket when one is running, and over HTTPS when you point it at a remote endpoint.

**macOS.** Homebrew is the supported path:

```bash
brew install arble/tap/arble
```

**Linux.** The install script detects your architecture and places the binary in `/usr/local/bin`:

```bash
curl -fsSL https://arble.ai/install.sh | sh
```

**Windows.** Use winget, or download the standalone `.exe` from the releases page:

```bash
winget install Arble.CLI
```

**npm.** Useful when you want the CLI pinned per-project rather than installed globally:

```bash
pnpm add -D @arble/cli
```

**Standalone binary.** Download and verify a release directly when you can't use a package manager. Checksums and signatures are published alongside each artifact:

```bash
curl -fsSLO https://releases.arble.ai/v1.8.2/arble-linux-arm64
```

**Docker.** The image ships the CLI with no daemon, for CI and headless use. Mount a config directory to persist credentials between runs:

```bash
docker run --rm -v ~/.arble:/root/.arble arble/cli:1.8 agents ls
```

Confirm the install and see which daemon you're connected to:

```bash
arble version
```

---

## Authentication

The CLI authenticates once and stores a credential in the OS keychain — not in a config file. Everything after that reads the stored credential unless you override it with `ARBLE_API_KEY`.

**Login.** Opens a browser for the device authorization flow, then writes the credential to the keychain:

```bash
arble login
```

**API token.** For headless environments where no browser exists, create a token in the dashboard and export it. The CLI prefers `ARBLE_API_KEY` over the keychain when both are present:

```bash
export ARBLE_API_KEY=arb_live_9f2c...
```

**Local mode vs remote mode.** By default the CLI connects to the daemon on your machine, and nothing leaves the device. Setting an endpoint switches it to a hosted or self-hosted Arble instance:

```bash
arble config set endpoint https://arble.internal.example.com
```

Local mode still requires login — the credential identifies *you* to your own daemon, which is what makes the audit log meaningful on a shared machine.

**Organizations.** An account can belong to several organizations. Commands operate against the active one:

```bash
arble orgs ls
arble orgs use acme-eng
```

**Profiles.** A profile bundles an endpoint, an organization and a credential under one name. Use them to keep a local machine, a staging instance and a production instance separate without re-authenticating:

```bash
arble profiles ls
arble profiles use staging
```

Check what the CLI thinks it is before running anything destructive:

```bash
arble whoami
```

```
lori@example.com
org      acme-eng
profile  staging
endpoint https://arble.internal.example.com
scopes   sessions:write agents:run memory:read
```

To drop the credential from the keychain:

```bash
arble logout
```

---

## Projects

Image placeholder · 16:9
A dark, minimal illustration: on the left, a plain folder icon representing a directory on disk; on the right, the same folder rendered as a structured glass card labeled "Project," now carrying three small attached badges — a memory glyph, a permissions glyph, and a connectors glyph. A thin horizontal light trail connects the two, suggesting initialization rather than duplication.

A project scopes everything Arble does: which memory an agent reads, which permissions are already granted, which connectors are available. A directory becomes a project when it has an `arble.json`, the same way a directory becomes a repository when it has a `.git`.

**Create.** Initializes `arble.json` in the current directory:

```bash
arble projects create api-gateway
```

**List.** Shows every project the active organization can see, with the active one marked:

```bash
arble projects ls
```

```
NAME             SESSIONS  MEMORY   UPDATED
api-gateway *          3   2.4 MB   12m ago
billing-web            0   840 KB   3d ago
infra-tooling          1   6.1 MB   1h ago
```

**Switch.** Sets the active project for subsequent commands. Inside a directory with an `arble.json`, this is inferred and you rarely need it:

```bash
arble projects use billing-web
```

**Delete.** Removes the project and its memory. Prompts unless `--force` is passed:

```bash
arble projects rm infra-tooling
```

Pass `--project` to any command to override the active project for a single invocation — the pattern `kubectl` uses for namespaces:

```bash
arble agents ls --project billing-web
```

---

## Sessions

A session is a conversation with accumulated context: the messages, the tool calls, and the permission grants made along the way. Agents run inside sessions. Killing a session discards its context; pausing it keeps the context and stops the work.

**Create.** Returns a session ID you can pass to later commands:

```bash
arble sessions new --title "Payment retry audit"
```

```
ses_8kQ2mVx  created  project=api-gateway
```

**List.** Active sessions first, with their state and current cost:

```bash
arble sessions ls
```

```
ID           TITLE                  STATE     AGENTS  AGE
ses_8kQ2mVx  Payment retry audit    running        2  4m
ses_3pLwRt9  Migrate auth handlers  paused         0  2h
ses_7nBcYs4  Flaky test triage      completed      0  1d
```

**Resume.** Reattaches to a paused or completed session with its context intact:

```bash
arble sessions resume ses_3pLwRt9
```

**Pause.** Stops running agents but preserves everything. A paused session costs nothing:

```bash
arble sessions pause ses_8kQ2mVx
```

**Terminate.** Ends the session and releases its context:

```bash
arble sessions kill ses_8kQ2mVx
```

**Export.** Writes the full transcript — messages, tool calls, arguments, results and approvals — as JSON. This is the artifact to attach to an incident review:

```bash
arble sessions export ses_7nBcYs4 --format json > triage.json
```

---

## Running agents

Image placeholder · 16:9
A dark render: a single terminal window at the bottom center of the frame, with four translucent glass agent cards fanned out above it in a shallow arc. Each card shows a short task label and a distinct state — one with a spinner, one with a progress bar, one with a checkmark, one dimmed and queued. Thin luminous lines connect each card back to the terminal prompt, suggesting they were spawned from it and still report to it.

`arble run` is the primary command. It takes an instruction, plans, calls tools, and streams what it's doing.

**Single agent.** Runs in the foreground and streams to your terminal. Ctrl-C cancels cleanly, mid-tool-call:

```bash
arble run "Find every handler that retries without a backoff and list the files"
```

**Multiple agents.** Fan out independent work across parallel agents in one session. Each gets its own context; results are collected when all finish:

```bash
arble run \
  --parallel \
  --task "Audit the retry logic in services/payments" \
  --task "Audit the retry logic in services/billing" \
  --task "Audit the retry logic in services/webhooks"
```

**Background agents.** Returns immediately with an agent ID. The work continues after your shell exits:

```bash
arble run --background "Reproduce the failing integration suite and summarize the first failure"
```

```
agt_5wTn9Kd  started  session=ses_8kQ2mVx
```

**Detached mode.** `--detach` is `--background` plus surviving a daemon restart — for work measured in hours. Reattach to a running agent's stream at any time:

```bash
arble agents attach agt_5wTn9Kd
```

**Interactive mode.** Opens a REPL against a session, which is the terminal equivalent of the desktop window:

```bash
arble run --interactive --session ses_3pLwRt9
```

**Streaming mode.** `--stream json` emits newline-delimited events instead of rendered output — the form to pipe into another process:

```bash
arble run --stream json "List the open PRs touching services/payments" | jq -r 'select(.type=="tool_call") | .tool'
```

Manage what's running:

```bash
arble agents ls
arble agents kill agt_5wTn9Kd
```

---

## Memory

Memory is per-project and persistent. Agents read it automatically at the start of a run and write to it when they learn something durable. The CLI gives you direct access so you can seed it, inspect it, and prune it.

**Search.** Semantic, not substring. Returns ranked entries with their source:

```bash
arble memory search "why we pinned the postgres driver"
```

**Add.** Writes an entry deliberately, rather than waiting for an agent to infer it:

```bash
arble memory add "Staging shares the production Redis. Never flush from a staging session."
```

**Delete.** Removes a single entry by ID, or everything matching a query with `--query`:

```bash
arble memory rm mem_2fQx8Lp
```

**Summarize.** Collapses related entries into fewer, denser ones. Worth running on a project that's been active for months — a smaller memory means less context spent per run:

```bash
arble memory summarize --older-than 90d
```

**Export.** Dumps memory as JSON for backup, review, or moving it to another project:

```bash
arble memory export > memory.json
```

Memory is not a log. Entries should be facts that stay true — a constraint, a decision, a gotcha — not a record of what happened in one session. Use `arble sessions export` for that.

---

## Skills

A skill is a packaged procedure: instructions, and optionally the tools and files that go with it. Where a tool is a single capability, a skill is a way of working — a deploy checklist, a review standard, a release process.

**Install.** From the registry, or from a local path during development:

```bash
arble skills install @acme/release-checklist
arble skills install ./skills/incident-review
```

**List.** Shows installed skills, their versions and whether they're active:

```bash
arble skills ls
```

```
NAME                      VERSION  STATE     SCOPE
@acme/release-checklist   2.1.0    enabled   project
@acme/incident-review     0.4.2    enabled   project
@arble/pr-description     1.0.0    disabled  global
```

**Enable and disable.** A disabled skill stays installed but is invisible to the planner. Use this to narrow what an agent considers, rather than uninstalling:

```bash
arble skills disable @arble/pr-description
arble skills enable @arble/pr-description
```

**Version and update.** Skills are pinned by default. `update` moves within the compatible range; pass an explicit version to pin exactly:

```bash
arble skills update @acme/release-checklist
arble skills install @acme/release-checklist@2.0.4
```

**Remove:**

```bash
arble skills rm @arble/pr-description
```

---

## Connectors

Image placeholder · 16:9
A dark composition with a terminal window at the center, surrounded by eight small floating glass connector tiles arranged in a loose ring — each bearing a minimal monochrome service mark (repository, chat, mail, calendar, database, cloud, design, ticketing). Two tiles glow faintly to indicate an authenticated, active state; the rest are dimmed. Thin lines run from the active tiles into the terminal.

A connector is an authenticated link to an external account. Enabling one adds its tools to the registry; authenticating it makes those tools usable.

**List.** Everything available, with current state:

```bash
arble connectors ls
```

```
NAME       STATE     AUTH        TOOLS
github     enabled   ok             8
slack      enabled   ok             4
linear     enabled   expired        6
notion     disabled  —              0
postgres   enabled   ok             3
```

**Enable and disable.** Disabling revokes tool access immediately without discarding the credential, which is the right move when you want an agent to stop being able to reach something for a while:

```bash
arble connectors enable notion
arble connectors disable slack
```

**Authenticate.** Runs the OAuth flow, or refreshes an expired grant:

```bash
arble connectors auth linear
```

**Status.** Detail for one connector — scopes granted, token expiry, last call, and the tools it contributes:

```bash
arble connectors status github
```

---

## MCP

Arble speaks Model Context Protocol natively. An MCP server's tools land in the same registry as built-in tools and pass the same permission gate. See [MCP server](mcp-servers.html) for the protocol details; this section covers the commands.

**Install a server.** Local servers take a command; remote servers take a URL:

```bash
arble mcp add postgres --command "npx -y @modelcontextprotocol/server-postgres"
arble mcp add acme-internal --url https://mcp.acme.example.com/mcp
```

**List.** Connected servers, their transport and tool count:

```bash
arble mcp ls
```

**Health.** Probes each server and reports latency and version. Run this first when an agent reports a tool as unavailable:

```bash
arble mcp health
```

```
SERVER          TRANSPORT  STATUS     LATENCY  VERSION  TOOLS
postgres        stdio      connected     11ms  2.0.1        3
acme-internal   http       connected    130ms  0.9.4        9
github          stdio      error            —  1.4.2        0
```

**Permissions.** Shows what each of a server's tools is allowed to do, and lets you change it per tool rather than per server:

```bash
arble mcp permissions postgres
```

**Remove.** Its tools leave the registry immediately:

```bash
arble mcp rm acme-internal
```

---

## Permissions

Every tool call passes a permission gate, whether it originated in the desktop app, a CI job, or your shell. The CLI is where you inspect and change the rules.

**Grant.** Scope as narrowly as the work needs. A grant without `--scope` applies to the whole capability:

```bash
arble permissions grant filesystem.write --scope "~/Projects/api-gateway"
arble permissions grant network.http --scope "api.github.com"
```

**Revoke.** Takes effect on the next call — no restart, no reinstall:

```bash
arble permissions revoke network.http --scope "api.github.com"
```

**List and audit.** `ls` shows current rules; `audit` shows what actually ran under them:

```bash
arble permissions ls
arble permissions audit --since 24h
```

```
TIME      AGENT        TOOL                    DECISION  SCOPE
14:02:11  agt_5wTn9Kd  filesystem.read         auto      ~/Projects/api-gateway
14:02:19  agt_5wTn9Kd  github.create_pr        approved  acme/api-gateway
14:03:40  agt_5wTn9Kd  postgres.query          denied    production
```

**Interactive approval.** In the foreground, a call needing approval pauses and prompts. In `--background` or CI it fails closed instead — an unattended run never silently grants itself something.

**Always allow and always deny.** Persist a decision so the prompt stops appearing:

```bash
arble permissions grant github.create_pr --always
arble permissions revoke terminal.exec --always
```

For unattended runs, declare the full set up front and use `--no-prompt`, so the job fails fast on anything you didn't anticipate rather than hanging on a prompt no one will answer.

---

## Desktop

Image placeholder · 16:9
A dark render: a terminal window in the lower left foreground, and floating above and to the right, a translucent glass rectangle representing a desktop screen with two abstract application windows inside it. A thin luminous line runs from the terminal's cursor to the desktop plane, terminating in a small crosshair over one of the windows. Minimal, monochrome, deep shadow.

Desktop control is built in, not a connector — the CLI drives the machine the daemon runs on. Every command here requires the `desktop` permission and appears in the audit log.

**Open an application, or a file in one:**

```bash
arble desktop open "Figma"
arble desktop open ~/Documents/spec.pdf
```

**Screenshot.** Full screen, or a single window by name. Writes a PNG and prints its path:

```bash
arble desktop screenshot --window "Safari" --out ./shot.png
```

**Clipboard.** Read and write, including piping in from another process:

```bash
arble desktop clipboard read
echo "arb_live_..." | arble desktop clipboard write
```

**Windows.** List, focus, resize:

```bash
arble desktop windows ls
arble desktop windows focus "Terminal"
```

**Mouse and keyboard.** Coordinates are in screen points, origin top-left:

```bash
arble desktop click 640 480
arble desktop type "SELECT count(*) FROM orders;"
arble desktop key cmd+shift+4
```

**Automation.** Chain steps from a file rather than a long shell pipeline, so the sequence is reviewable and rerunnable:

```bash
arble desktop run ./automations/export-report.yaml
```

---

## Mobile

A paired phone is addressable from the terminal. Pair once with `arble mobile pair`; after that the device appears as a target for these commands. Camera and microphone always prompt on the device itself, regardless of CLI flags — there is no way to capture silently.

**Send a notification.** Useful as the last line of a long background job:

```bash
arble mobile notify "Migration finished — 14 tables, 0 errors"
```

**Clipboard.** Shared with the desktop clipboard when both are paired:

```bash
arble mobile clipboard write "https://github.com/acme/api-gateway/pull/482"
```

**Open an app or a deep link:**

```bash
arble mobile open "shortcuts://run-shortcut?name=Standup"
```

**Run a shortcut.** Invokes a named iOS Shortcut or Android routine and returns its output:

```bash
arble mobile shortcut "Log Deploy"
```

**Camera and microphone.** Capture a still or record audio, subject to on-device approval:

```bash
arble mobile camera --out ./whiteboard.jpg
arble mobile mic --duration 30s --transcribe
```

---

## Automation

Image placeholder · 16:9
A dark, structured diagram: three terminal command fragments on the left, each connected by a thin line into a single vertical workflow spine on the right built from four stacked glass nodes — labeled trigger, queue, run, retry. A small clock glyph sits beside the topmost node and a looping arrow beside the last, indicating scheduling and retry. Monochrome, precise, technical rather than decorative.

Anything you can run once, you can run on a schedule or in response to an event. Automations are defined from the CLI and stored server-side, so they run whether or not your shell is open.

**Schedules.** Cron syntax, evaluated in the project's timezone:

```bash
arble schedule create nightly-triage \
  --cron "0 7 * * 1-5" \
  --task "Summarize failing CI runs from the last 24 hours and post to #eng-alerts"
```

```bash
arble schedule ls
arble schedule rm nightly-triage
```

**Triggers.** Event-driven rather than time-driven. A trigger fires on a webhook or a connector event:

```bash
arble triggers create pr-review \
  --on github.pull_request.opened \
  --task "Review the diff against @acme/release-checklist and comment"
```

**Background jobs.** Every scheduled or triggered run becomes a job. Inspect them the same way regardless of what started them:

```bash
arble jobs ls
arble jobs logs job_4hVn2Qs
```

**Queues.** Jobs in the same queue run serially; different queues run in parallel. Use one queue per resource that can't tolerate concurrent writes:

```bash
arble schedule create db-maintenance --cron "0 3 * * 0" --queue database --task "..."
```

**Retries.** Failed jobs retry with exponential backoff, bounded by `--max-retries`. Only errors the tool marked retryable are retried; a permission denial is never retried:

```bash
arble triggers create pr-review --on github.pull_request.opened --max-retries 3 --task "..."
```

---

## Logs

Logs are structured records of what ran. Every line carries a session ID, an agent ID and a tool name, which is what makes filtering useful rather than decorative.

**Live.** Follows the current project. Add `--session` to narrow to one conversation:

```bash
arble logs --follow
```

**Historical.** Time-bounded, with the same filters:

```bash
arble logs --since 2h --until 30m
```

**Filtering.** Combine narrowing flags; they intersect:

```bash
arble logs --agent agt_5wTn9Kd --tool postgres.query --level error
```

**Search.** Full text across the log body:

```bash
arble logs --grep "connection refused" --since 7d
```

**JSON output.** `--json` emits newline-delimited objects. This is the shape to pipe into `jq`, or ship to a log aggregator:

```bash
arble logs --json --since 1h | jq -r 'select(.level=="error") | "\(.tool)\t\(.message)"'
```

**Streaming to a file.** Long-running jobs are easier to review after the fact than over your shoulder:

```bash
arble logs --follow --json >> ~/.arble/logs/api-gateway.ndjson
```

---

## Observability

Metrics answer a different question than logs: not what happened in one run, but whether runs are getting slower, more expensive, or less reliable.

**Metrics overview.** Aggregated for the active project:

```bash
arble metrics --since 7d
```

```
RUNS          412
SUCCESS      94.2%
p50 DURATION  18s
p95 DURATION  2m41s
TOOL CALLS   3,891
RETRIES         57
MEMORY       2.4 MB
```

**Execution time.** Per-tool latency, to find which call dominates a slow run:

```bash
arble metrics tools --sort p95 --since 7d
```

**Failures.** Grouped by error, most frequent first — the report to read before deciding what to fix:

```bash
arble metrics failures --since 7d
```

**Retries.** High retry counts on a single tool usually mean a flaky upstream, not a flaky agent:

```bash
arble metrics retries --since 7d
```

**Tool usage.** Call counts by tool, which is how you find a connector that's installed but never chosen — and either fix its description or remove it:

```bash
arble metrics tools --sort calls
```

**Memory usage.** Size and entry count over time. Growth without bound is a signal to run `arble memory summarize`:

```bash
arble metrics memory
```

Add `--json` to any metrics command to feed a dashboard.

---

## Configuration

Configuration resolves in this order, most specific first: command-line flags, environment variables, project `arble.json`, then the user config file. This is the standard precedence, and it means a project can set a default that CI overrides without editing anything.

**Config file.** `~/.arble/config.toml` holds profiles and global defaults. Credentials are never written here:

```bash
arble config ls
arble config get endpoint
arble config set log_level debug
```

**Profiles.** Each profile carries its own endpoint, organization and credential:

```toml
[profiles.local]
endpoint = "unix:///var/run/arble.sock"
org = "acme-eng"

[profiles.staging]
endpoint = "https://arble.staging.example.com"
org = "acme-eng"
log_level = "debug"
```

```bash
arble profiles use local
```

**Project config.** `arble.json` is checked into the repository and shared with your team. It sets defaults for anyone working in the directory:

```json
{
  "project": "api-gateway",
  "skills": ["@acme/release-checklist@2.1.0"],
  "connectors": ["github", "postgres"],
  "permissions": {
    "filesystem.write": ["./src", "./tests"],
    "network.http": ["api.github.com"]
  }
}
```

**Secrets.** Stored in the keychain and referenced by name. Values are never printed, and are redacted from logs and traces:

```bash
arble secrets set GITHUB_TOKEN
arble secrets ls
```

**Workspaces.** A workspace groups several projects that share memory and connectors — the right structure for a monorepo where one agent needs to reason across services:

```bash
arble workspaces create platform --projects api-gateway,billing-web
```

---

## Debugging

Image placeholder · 16:9
A dark render of a terminal window displaying an execution timeline: a vertical tree of nested tool calls, each row showing a duration bar of a different length aligned to a shared time axis on the right, with one row highlighted in a lighter tone to mark the slowest span. Small indent guides show parent-child nesting. Precise, monospaced, monochrome — reads as a real profiler, not an illustration.

**Verbose mode.** `-v` shows tool calls and decisions; `-vv` adds full arguments and results. Both write to stderr, so piping stdout still works:

```bash
arble run -vv "Fix the failing auth test"
```

**Tracing.** A trace is the complete record of one run: every call, its arguments, its result, its duration, and the permission decision that let it through:

```bash
arble trace agt_5wTn9Kd
```

**Execution tree.** The same trace rendered as a tree, which is faster to read when you're looking for where a run went wrong:

```bash
arble trace agt_5wTn9Kd --tree
```

```
run  Fix the failing auth test                        41.2s
├─ filesystem.read  tests/auth_test.py                 0.1s
├─ terminal.exec    pytest tests/auth_test.py -x      12.8s
├─ filesystem.read  src/auth/session.py                0.1s
├─ filesystem.write src/auth/session.py                0.1s
└─ terminal.exec    pytest tests/auth_test.py -x      27.9s
```

**Timing.** `--timing` sorts spans by duration instead of showing them in order:

```bash
arble trace agt_5wTn9Kd --timing
```

**Permission logs.** When a run stops early, this usually explains it before the trace does:

```bash
arble permissions audit --agent agt_5wTn9Kd
```

**Dry run.** `--dry-run` plans and prints the tool calls the agent would make, without executing any of them. Use it before pointing an unfamiliar automation at production:

```bash
arble run --dry-run "Drop the staging replica and recreate it from the latest snapshot"
```

---

## Scripting

The CLI is designed to compose. Human-readable output goes to stdout, diagnostics to stderr, and `--json` makes any command machine-readable. Exit codes are meaningful, so `set -e` behaves.

**Bash.** Capture structured output and branch on it:

```bash
#!/usr/bin/env bash
set -euo pipefail

result=$(arble run --json --no-prompt \
  "List files in src/ that import the deprecated retry helper")

count=$(echo "$result" | jq '.files | length')
if [ "$count" -gt 0 ]; then
  arble mobile notify "$count files still use the deprecated retry helper"
fi
```

**PowerShell.** `ConvertFrom-Json` gives you objects directly:

```powershell
$result = arble run --json --no-prompt "Summarize open PRs older than 14 days" |
  ConvertFrom-Json
$result.summary | Set-Content pr-report.md
```

**Python.** For anything with real control flow, drive the CLI as a subprocess rather than parsing rendered output:

```python
import json, subprocess

out = subprocess.run(
    ["arble", "run", "--json", "--no-prompt", "Audit retry logic in services/payments"],
    capture_output=True, text=True, check=True,
)
report = json.loads(out.stdout)
```

**Cron.** Use an absolute path and set the profile explicitly — cron's environment is not your shell's:

```bash
0 7 * * 1-5 ARBLE_PROFILE=local /usr/local/bin/arble run --no-prompt "Summarize overnight CI failures"
```

Prefer `arble schedule` to cron when you can: scheduled runs get retries, queueing and job logs, which a cron entry does not.

---

## CI/CD

Image placeholder · 16:9
A dark, horizontal pipeline diagram: four connected stage nodes rendered as glass rectangles labeled checkout, install, arble run, report. The third node is visually emphasized, with three thin lines branching from it into small floating result cards showing a checkmark, a warning triangle, and a document glyph. Monochrome, clean, evocative of a real CI run summary rather than a marketing graphic.

In CI, run in remote mode with a scoped API token. Grant only the permissions the job needs, and always pass `--no-prompt` so an unexpected approval fails the build instead of hanging it.

**GitHub Actions.**

```yaml
- name: Review the diff
  env:
    ARBLE_API_KEY: ${{ secrets.ARBLE_API_KEY }}
    ARBLE_PROJECT: api-gateway
  run: |
    arble run --no-prompt --json \
      "Review the changes in this PR against @acme/release-checklist" \
      > review.json
```

**GitLab CI.**

```yaml
review:
  image: arble/cli:1.8
  variables:
    ARBLE_PROJECT: api-gateway
  script:
    - arble run --no-prompt "Review the changes on this branch"
```

**Azure DevOps, Jenkins, Buildkite, CircleCI.** All four follow the same shape: install the CLI or use the Docker image, expose `ARBLE_API_KEY` from the platform's secret store, and invoke `arble run --no-prompt`. Nothing about the CLI is platform-specific — if it runs a shell and holds a secret, it works.

```groovy
// Jenkins
withCredentials([string(credentialsId: 'arble-key', variable: 'ARBLE_API_KEY')]) {
  sh 'arble run --no-prompt "Summarize the changes in this build"'
}
```

Two rules for any pipeline: use a token scoped to exactly the permissions the job needs, and treat a nonzero exit as a real failure rather than something to `|| true` away.

---

## Command reference

**Authentication**

| Command | Description |
|---|---|
| `arble login` | Authenticate and store a credential in the keychain |
| `arble logout` | Remove the stored credential |
| `arble whoami` | Show the active identity, org, profile and endpoint |
| `arble orgs ls\|use` | List or switch organizations |

**Projects**

| Command | Description |
|---|---|
| `arble projects create <name>` | Initialize a project in the current directory |
| `arble projects ls` | List projects |
| `arble projects use <name>` | Set the active project |
| `arble projects rm <name>` | Delete a project and its memory |

**Sessions**

| Command | Description |
|---|---|
| `arble sessions new` | Create a session |
| `arble sessions ls` | List sessions and their state |
| `arble sessions resume <id>` | Reattach with context intact |
| `arble sessions pause <id>` | Stop agents, keep context |
| `arble sessions kill <id>` | End the session |
| `arble sessions export <id>` | Export the full transcript |

**Agents**

| Command | Description |
|---|---|
| `arble run <task>` | Run an agent |
| `arble agents ls` | List running agents |
| `arble agents attach <id>` | Attach to a running agent's stream |
| `arble agents kill <id>` | Cancel an agent |

**Memory**

| Command | Description |
|---|---|
| `arble memory search <query>` | Semantic search |
| `arble memory add <text>` | Add an entry |
| `arble memory rm <id>` | Delete an entry |
| `arble memory summarize` | Collapse related entries |
| `arble memory export` | Export as JSON |

**Permissions**

| Command | Description |
|---|---|
| `arble permissions grant <cap>` | Grant a capability, optionally scoped |
| `arble permissions revoke <cap>` | Revoke a grant |
| `arble permissions ls` | Show current rules |
| `arble permissions audit` | Show what ran under them |

**Skills**

| Command | Description |
|---|---|
| `arble skills install <name>` | Install from registry or path |
| `arble skills ls` | List installed skills |
| `arble skills enable\|disable <name>` | Toggle planner visibility |
| `arble skills update <name>` | Update within the compatible range |
| `arble skills rm <name>` | Uninstall |

**MCP**

| Command | Description |
|---|---|
| `arble mcp add <name>` | Add a local or remote server |
| `arble mcp ls` | List servers |
| `arble mcp health` | Probe status, latency and version |
| `arble mcp permissions <name>` | Inspect per-tool permissions |
| `arble mcp rm <name>` | Remove a server |

**Connectors**

| Command | Description |
|---|---|
| `arble connectors ls` | List connectors and state |
| `arble connectors enable\|disable <name>` | Toggle tool access |
| `arble connectors auth <name>` | Run or refresh the OAuth flow |
| `arble connectors status <name>` | Scopes, expiry and contributed tools |

**Desktop**

| Command | Description |
|---|---|
| `arble desktop open <target>` | Open an app or file |
| `arble desktop screenshot` | Capture screen or window |
| `arble desktop clipboard read\|write` | Read or write the clipboard |
| `arble desktop windows ls\|focus` | List or focus windows |
| `arble desktop click\|type\|key` | Simulate input |
| `arble desktop run <file>` | Run an automation file |

**Mobile**

| Command | Description |
|---|---|
| `arble mobile pair` | Pair a device |
| `arble mobile notify <text>` | Send a notification |
| `arble mobile clipboard read\|write` | Read or write the device clipboard |
| `arble mobile open <target>` | Open an app or deep link |
| `arble mobile shortcut <name>` | Run a shortcut |
| `arble mobile camera\|mic` | Capture, with on-device approval |

**Automation**

| Command | Description |
|---|---|
| `arble schedule create\|ls\|rm` | Manage cron schedules |
| `arble triggers create\|ls\|rm` | Manage event triggers |
| `arble jobs ls` | List job runs |
| `arble jobs logs <id>` | Logs for one job |

**Logs, config and debug**

| Command | Description |
|---|---|
| `arble logs` | Live or historical logs |
| `arble metrics` | Aggregated metrics |
| `arble config get\|set\|ls` | Read and write configuration |
| `arble profiles ls\|use` | Manage profiles |
| `arble secrets set\|ls` | Manage secrets |
| `arble trace <agent>` | Full execution trace |
| `arble version` | CLI and daemon versions |
| `arble help [command]` | Help for any command |

Every command accepts `--json`, `--project`, `--profile` and `-v`. `arble help <command>` is authoritative — this table is a map, not a spec.

---

## Environment variables

| Variable | Purpose |
|---|---|
| `ARBLE_API_KEY` | API token. Takes precedence over the keychain credential. |
| `ARBLE_PROFILE` | Profile to use, equivalent to `--profile`. |
| `ARBLE_PROJECT` | Active project, equivalent to `--project`. |
| `ARBLE_ENDPOINT` | Daemon or instance endpoint. Overrides the profile's endpoint. |
| `ARBLE_LOG_LEVEL` | `error`, `warn`, `info`, `debug` or `trace`. Default `info`. |
| `ARBLE_CONFIG` | Path to the config file. Default `~/.arble/config.toml`. |

Environment variables override config files and are overridden by flags.

---

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | General error — the command ran and failed |
| `2` | Usage error — unknown flag, missing argument |
| `3` | Not authenticated, or the credential expired |
| `4` | Permission denied, including a `--no-prompt` run that needed approval |
| `5` | Not found — project, session, agent or connector |
| `6` | Conflict — the resource is in a state that forbids the operation |
| `7` | Timeout |
| `8` | Cancelled, including a graceful Ctrl-C |
| `130` | Interrupted by SIGINT before the CLI could shut down cleanly |

In scripts, distinguish `4` from `1`. A permission denial means the grant is wrong and retrying won't help; a general error may be transient.

---

## Best practices

1. Use profiles rather than editing the endpoint — switching contexts should be one word, not a config change.
2. Check in `arble.json` so a teammate cloning the repository gets the same skills, connectors and permission scopes.
3. Always pass `--no-prompt` in CI, so a missing grant fails the build instead of hanging it.
4. Scope every permission — `filesystem.write --scope ./src`, never bare `filesystem.write`.
5. Use scoped API tokens per pipeline, not one token shared across every job.
6. Prefer `arble schedule` to cron; you get retries, queueing and job logs for free.
7. Put jobs that touch the same resource in the same queue so they can't run concurrently.
8. Use `--dry-run` the first time you point an automation at anything you can't easily undo.
9. Pipe `--json` into `jq` rather than parsing rendered tables — the table format is not a stable interface.
10. Read `arble permissions audit` before `arble trace` when a run stops early; it's usually the answer.
11. Write memory entries as durable facts, and use `arble sessions export` for what happened in one run.
12. Run `arble memory summarize` periodically on long-lived projects; unbounded memory costs context on every run.
13. Pin skill versions in `arble.json` so a registry update can't change how an agent behaves mid-sprint.
14. Run `arble mcp health` before debugging an agent that says a tool is unavailable.
15. Treat `arble sessions export` output as the artifact for incident reviews — it contains the arguments and approvals, not just the summary.

---

## FAQ

**Does the CLI need the desktop app installed?**
No. The app and the CLI are both clients of the same daemon. Install the daemon alone for a headless machine, or point the CLI at a remote instance and install nothing locally.

**Can I use the CLI fully offline?**
Yes, in local mode with a local model. Connectors and remote MCP servers need network access, but sessions, memory, permissions and desktop control do not.

**How do I stop an agent mid-run?**
Ctrl-C in the foreground, or `arble agents kill <id>` for a background one. Both cancel cooperatively — an in-flight tool call is given the chance to stop cleanly before it's terminated.

**What happens to a background agent if my shell exits?**
It keeps running; the daemon owns it, not your shell. Use `--detach` if it also needs to survive a daemon restart.

**Is the output format stable enough to parse?**
Parse `--json`, not the rendered tables. The JSON shape is versioned; table layout changes between releases.

**How do I run against a self-hosted instance?**
Set the endpoint on a profile and switch to it. Everything else is identical — the CLI doesn't distinguish hosted from self-hosted.

**Can two people share a project?**
Yes. Projects belong to the organization, and memory and permission grants are shared. Sessions are per-user unless explicitly shared.

**Does a CI run see my local permission grants?**
No. Grants are per-profile and per-project, and a CI token carries its own scopes. This is deliberate — a local convenience grant should never widen what a pipeline can do.

**Where are credentials stored?**
In the OS keychain — Keychain on macOS, Secret Service on Linux, Credential Manager on Windows. Never in `config.toml`, and never in `arble.json`.

**How do I see which version the daemon is running?**
`arble version` prints both the CLI and daemon versions. They don't have to match exactly, but the CLI warns when the gap is wide enough to matter.

---

**Previous:** [Tool SDK](tool-sdk.md) · **Next:** [Self-hosting](#)
