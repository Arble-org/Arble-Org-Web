# Tool SDK

*Developers / Tool SDK*

Image placeholder · 16:9
A premium Apple-keynote-style render on a near-black background: a matte obsidian chip labeled with a minimal "SDK" glyph floats above three stacked translucent glass planes, softly lit from the upper left. Thin glowing lines connect the chip to small orbiting fragments of syntax-highlighted code (a function signature, a JSON brace, a lock icon) arranged in a loose halo around it. Reflections on the glass planes suggest depth; the background fades to pure black at the edges.

## Build tools once. Run them everywhere.

Tool SDK is the native extension framework for Arble. You write one implementation, and Arble makes it available on desktop, mobile, CLI, API, workflows, and agents — no adapters, no per-surface reimplementation.

A tool defined with Tool SDK isn't a plugin bolted onto one client. It's registered once into Arble's tool registry, and every runtime that can call a tool — a desktop session, a scheduled workflow, a remote agent — calls it the same way, with the same schema, the same permission gate, and the same audit trail.

---

## On this page

- [Why Tool SDK](#why-tool-sdk)
- [Quick example](#quick-example)
- [Supported languages](#supported-languages)
- [Tool lifecycle](#tool-lifecycle)
- [Tool anatomy](#tool-anatomy)
- [Input schemas](#input-schemas)
- [Output schemas](#output-schemas)
- [Resources](#resources)
- [Permissions](#permissions)
- [Authentication](#authentication)
- [Streaming](#streaming)
- [Development](#development)
- [Testing](#testing)
- [Publishing](#publishing)
- [Built-in helpers](#built-in-helpers)
- [Example tools](#example-tools)
- [Tool registry](#tool-registry)
- [Performance](#performance)
- [Security](#security)
- [Best practices](#best-practices)
- [Reference](#reference)
- [FAQ](#faq)

---

## Why Tool SDK

Image placeholder · 16:9
A single dark SDK package icon at the center-left of the frame, rendered as a rounded glass cube, expands rightward into five thin beams of light that terminate in five distinct minimal device glyphs — a desktop window, a phone, a terminal cursor, an API bracket `{}`, and a workflow node graph. Each beam is labeled with a short caption beneath its endpoint. The style is clean, dark-mode, high contrast, with a subtle grid backdrop.

MCP gives you a protocol for exposing tools to any compatible client. Tool SDK gives you a runtime. It assumes you're building specifically for Arble, and in exchange handles everything a tool needs to behave well inside an agent loop rather than just respond to a call.

**Typed inputs and outputs.** Every tool declares its input and output shape once. Arble validates calls against it before your code runs, and validates results before they reach the model — malformed calls never reach your function, and malformed responses never reach the agent.

**Streaming.** Tools that take more than an instant can emit progress events, partial results, and a final payload over the same channel, so the agent — and the user watching it work — sees a task in motion, not a spinner.

**Authentication.** Tool SDK resolves API keys, OAuth tokens, and local credentials through Arble's credential store, so your tool asks for a token and gets one, without handling secrets or storage itself.

**Permissions.** A tool declares what it needs — network access, filesystem writes, a specific scope — and Arble handles asking, remembering, and enforcing. Your code never checks "am I allowed to do this"; if it's running, it's allowed.

**Memory.** Tools can read from and write to the user's persistent memory store, so a tool that looks something up once can make that result available to every later run, not just the current context window.

**Resources.** Inputs and outputs aren't limited to primitives. A tool can accept a file, an image, a database handle, or a URL as a first-class typed value, and return one the same way.

**Cancellation and timeouts.** Every tool call carries a cancellation signal and a deadline. Long-running tools check both cooperatively; Arble enforces the deadline regardless.

**Progress events, tracing, logging, versioning, observability.** Every call is traced end to end, every log line is attributed to the tool and version that produced it, and every tool ships with a version so the registry can run two versions side by side during a rollout.

None of this is optional scaffolding you opt into later. It's the shape a Tool SDK tool has from the moment you write `@tool`.

---

## Quick example

Image placeholder · 16:9
Split-screen composition on a dark background. Left half: a code editor window showing a short, syntax-highlighted Python function with a `@tool` decorator, rendered with realistic editor chrome (line numbers, minimap, tab bar). Right half: four small stacked cards labeled "Permission prompt," "Documentation," "JSON Schema," and "CLI command," each showing a miniature realistic preview of that generated artifact, connected to the code editor by a thin arrow crossing the center seam.

Here's a complete tool, start to finish:

```python
from arble import tool, Context

@tool(
    name="weather.current",
    description="Get current conditions for a city.",
    permissions=["network.http"],
)
def current_weather(city: str, units: str = "metric", ctx: Context = None) -> dict:
    response = ctx.http.get(
        "https://api.weather.example/v1/current",
        params={"city": city, "units": units},
    )
    response.raise_for_status()
    data = response.json()
    return {
        "city": city,
        "temperature": data["temp"],
        "condition": data["summary"],
        "units": units,
    }
```

That's the whole tool. No manifest file, no separate schema definition, no registration step. From this one function, Arble generates:

| Artifact | Source |
|---|---|
| JSON Schema | Inferred from the function signature and type hints |
| Validation | Enforced on every call, before your code runs |
| Permission prompt | Built from the `permissions` list |
| CLI command | `arble tools run weather.current --city Lisbon` |
| REST endpoint | `POST /v1/tools/weather.current` |
| Streaming endpoint | `POST /v1/tools/weather.current/stream` (SSE) |
| Registry entry | Name, version, owner, and permission summary |
| Documentation | Parameter table and example calls, from the docstring and type hints |

The function signature is the source of truth. Change a parameter's type and the schema, validation, generated docs, and CLI flags all change with it — there's nothing else to keep in sync.

---

## Supported languages

Image placeholder · 16:9
Four premium floating glass cards arranged in a shallow arc against a dark background, each embossed with a language logo mark rendered in a minimal monochrome style — Python, TypeScript, Go, and Rust — evenly lit with soft rim lighting and subtle drop shadows, suggesting equal weight and no visual hierarchy between them.

Tool SDK ships first-party libraries for Python, TypeScript, Go, and Rust. Parity across them is a design constraint, not a roadmap item: the same tool built in any of the four gets the same schema inference, the same streaming model, the same permission declarations, and the same registry entry shape. An agent calling a Go tool and a Python tool in the same run can't tell the difference, and neither should you when reading the registry.

Choose based on where the tool needs to run and what it needs to link against — a tool wrapping a Rust image codec belongs in Rust, a tool orchestrating HTTP calls is often fastest to write in TypeScript or Python — not based on what the SDK supports, because all four support the same surface.

---

## Tool lifecycle

Image placeholder · 16:9
A vertical Apple-style workflow diagram on a dark background: nine minimal circular nodes connected by thin glowing vertical lines, evenly spaced top to bottom, each labeled with one word (Define, Register, Validate, Test, Package, Publish, Install, Run, Share). Each node is a small glass disc with a subtle icon inside — a pencil, a plus sign, a checkmark, a flask, a box, an upload arrow, a download arrow, a play triangle, a share arrow. The line brightens progressively from top to bottom to suggest forward motion.

A tool moves through nine stages between being an idea and being something another user's agent can call.

**Define.** You write the function, its decorator, and its docstring. This is the only stage that requires you to write code — everything after this point operates on what you defined.

**Register.** On first run, Arble reads the decorator and signature and adds an entry to the local tool registry. No separate registration call or config file is involved.

**Validate.** Arble checks the inferred schema for ambiguity — ununion-able types, missing defaults on optional fields, permission scopes that don't exist — and fails fast with a specific error rather than a runtime surprise later.

**Test.** You run the tool against the test harness described in [Testing](#testing), using mock resources and simulated permissions so a full Arble session isn't required to iterate.

**Package.** `arble tools package` bundles the tool's code, declared dependencies, and metadata into a signed artifact ready for distribution.

**Publish.** The package is pushed to a registry — private, organization, or public — described in [Publishing](#publishing).

**Install.** Another user, or another one of your own environments, runs `arble tools install` to pull the package and its declared permissions into their local registry.

**Run.** The agent calls the tool like any other registry entry. This is the stage a tool spends most of its life in.

**Share.** A tool can be shared directly with a teammate or workflow, independent of the public registry, scoped to exactly the people or workflows you name.

---

## Tool anatomy

Image placeholder · 16:9
An exploded-view technical diagram in the style of an Apple product teardown: a single tool rendered as a stack of nine thin horizontal glass layers, separated vertically with visible gaps, each layer labeled on the right with one component name (Metadata, Input schema, Permissions, Resources, Execution, Streaming, Output schema, Documentation, Registry). Soft blue-white rim lighting along each layer's edge, dark background, subtle floating dust particles for depth.

Every tool is made of the same nine parts, whether it's three lines or three hundred.

**Metadata.** Name, description, owner, and version — the identity the registry and the agent's tool picker use to find and describe the tool.

**Input schema.** The typed shape of a valid call, inferred from the function signature or declared explicitly. See [Input schemas](#input-schemas).

**Permissions.** The capabilities the tool needs to run, declared up front so Arble can gate and remember consent. See [Permissions](#permissions).

**Resources.** Any files, documents, database handles, or external services the tool reads or writes as first-class typed values. See [Resources](#resources).

**Execution.** The function body — the only part you'd recognize as "your code" in a traditional sense.

**Streaming.** The channel for progress events and partial results, present on any tool that yields rather than returns. See [Streaming](#streaming).

**Output schema.** The typed shape of a successful result, validated before it reaches the agent. See [Output schemas](#output-schemas).

**Documentation.** Generated from the docstring, type hints, and examples, kept in sync with the code because it's derived from the code.

**Registry.** The entry other tools, workflows, and agents see when they look this tool up — everything above, indexed and queryable.

---

## Input schemas

A tool's input schema is inferred from its function signature by default. You can widen or constrain it with standard typing constructs — Tool SDK doesn't introduce its own type language.

**Primitives** — `str`, `int`, `float`, `bool` — map directly to JSON Schema types.

**Objects** — a `dataclass`, `TypedDict`, or Pydantic model — become nested schema objects with their own field validation.

**Arrays** — `list[T]` becomes a typed array; Arble validates every element, not just the container.

**Enums** — `Literal["low", "medium", "high"]` or an `Enum` subclass becomes a closed set of allowed values, and shows up as a picker rather than a free text field in generated UI.

**Optional fields** — a parameter with a default value is optional in the schema; one without a default is required. `X | None` makes nullability explicit for fields that are required but may legitimately be empty.

```python
from pydantic import BaseModel, Field
from typing import Literal

class CreateIssueInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=256)
    body: str = ""
    labels: list[str] = []
    priority: Literal["low", "medium", "high"] = "medium"
    assignee: str | None = None

@tool(name="github.create_issue", permissions=["network.http"])
def create_issue(input: CreateIssueInput, ctx: Context) -> dict:
    ...
```

Validation runs before your function body executes. A call with `priority="urgent"` or a `title` over 256 characters never reaches your code — the caller gets a schema error naming the exact field and constraint that failed.

---

## Output schemas

Output schemas work the same direction in reverse: Arble validates what your function returns before handing it to the agent, so a tool can't silently return a shape the caller didn't ask for.

**Typed responses.** A return type hint — a dataclass, a Pydantic model, or a plain `dict` with a declared `TypedDict` — becomes the output schema, the same way input types do.

**Structured outputs.** Nested objects and arrays in the return value are validated recursively, so a tool returning a list of typed records gets every record checked, not just the top-level list.

**Streaming.** A streaming tool's output schema describes the shape of the *final* payload; intermediate `Progress` and partial-result events have their own fixed shape, covered in [Streaming](#streaming).

**Errors.** Raise a typed exception — `ToolError`, or a subclass you define — and Arble turns it into a structured error the agent can reason about (a name, a message, and whether it's retryable), instead of an opaque stack trace.

**Resources.** A tool can return a `Resource` — a file, an image, a table — in place of or alongside plain data. The agent receives a reference it can pass to another tool, not a blob it has to parse.

```python
from arble import ToolError

class RateLimited(ToolError):
    retryable = True

@tool(name="github.create_issue", permissions=["network.http"])
def create_issue(input: CreateIssueInput, ctx: Context) -> dict:
    response = ctx.http.post("https://api.github.com/issues", json=input.dict())
    if response.status_code == 429:
        raise RateLimited("GitHub rate limit hit, retry after backoff")
    response.raise_for_status()
    return response.json()
```

---

## Resources

Image placeholder · 16:9
A dark, minimal illustration showing a central glowing node labeled "Resource," with eight thin lines radiating outward to eight small flat icons arranged in a circle around it: a document, a folder, a database cylinder, an image frame, a spreadsheet grid, a table, a globe (for a web API), and a binary stream icon (animated-looking parallel bars). Each icon sits on its own small glass tile. Clean, evenly spaced, high contrast against black.

A resource is anything a tool reads or writes that isn't a plain value — Tool SDK treats these as first-class typed inputs and outputs rather than paths or blobs the tool has to manage itself.

| Resource type | Represents |
|---|---|
| File | A single file on disk, opened and closed by Arble around your call |
| Directory | A scoped view of a folder, walked or written to within its declared permission |
| Database | A connection handle to a database Arble has been granted access to |
| Image | A typed binary resource with format and dimension metadata attached |
| Document | A structured document (PDF, Markdown, Word) with extraction helpers |
| Table | A typed tabular resource — rows and a schema — independent of file format |
| Web API | A named external endpoint with its authentication already resolved |
| Binary resource | Untyped bytes, for anything that doesn't fit a more specific category |
| Streaming resource | A resource whose content arrives incrementally rather than all at once |

Declaring a parameter as `Resource[File]` instead of `str` changes what the agent can pass you: instead of a raw path it has to guess is valid, it passes a reference Arble already validated, already scoped to a permission, and already knows how to render in the UI. Returning a resource works the same way — the agent gets something it can preview, pass to the next tool, or hand back to the user, not a string it has to interpret.

---

## Permissions

Image placeholder · 16:9
A realistic macOS-style permission approval sheet floating above a blurred dark desktop background, rendered as a rounded glass panel. It shows a tool name and icon at the top, a short description of what it wants to do, and three pill-shaped buttons in a row: "Ask every time," "Allow this session," and "Always allow," with "Allow this session" subtly highlighted as the default. Soft drop shadow beneath the panel.

A tool declares what it needs, not how it will use it. Arble is the one that asks, remembers, and enforces — the tool's code never contains a permission check, because if the function body is running, the permission has already been granted.

```python
@tool(
    name="filesystem.write_report",
    permissions=["filesystem.write:~/Reports"],
)
def write_report(path: str, content: str, ctx: Context) -> dict:
    ctx.fs.write(path, content)
    return {"path": path, "bytes": len(content)}
```

Each permission has a grant level:

| Level | Behavior |
|---|---|
| Always allow | Granted once, applied to every future call without prompting again |
| Ask every time | Prompts on every call, regardless of prior answers |
| Never allow | Calls fail immediately with a permission error, no prompt shown |

Grants can be scoped **per tool**, **per workflow**, or **per session** — a permission granted to a tool inside one workflow doesn't silently extend to the same tool called from a different context, unless you explicitly grant it more broadly. Permissions are inherited down a call chain: if a workflow has been granted `network.http` and it calls a tool that also needs `network.http`, the tool doesn't re-prompt — but a *tighter* scope on the tool (a specific host, a specific path) is still enforced on top of the broader grant, never loosened by it.

---

## Authentication

Tools that talk to external services need credentials, and Tool SDK resolves them through Arble's credential store rather than asking you to manage secrets yourself.

**API keys.** Declare a required key with `ctx.secrets.get("service_name")`; Arble resolves it from the user's stored keys and fails the call with a clear setup error if none exists.

**OAuth.** Declare an OAuth scope and Arble handles the authorization flow, token storage, and refresh — your tool calls `ctx.auth.token("github")` and gets a valid token, never the refresh logic.

**Bearer tokens.** For services without full OAuth, a bearer token behaves like an API key: stored once, injected on request, never logged.

**Environment variables.** Useful for local development and self-hosted tools, but resolved through `ctx.env`, not `os.environ`, so the same tool works identically when Arble supplies credentials a different way in production.

**Local credentials and device keychain.** On desktop, Arble can resolve a credential from the OS keychain instead of its own store, for tools that need to match credentials already used by another application.

**Secrets.** Anything marked as a secret — key, token, password — is redacted from logs, traces, and error messages automatically. A tool that accidentally includes a secret in a return value has that value stripped before it reaches storage.

Best practice: never accept a credential as a plain tool parameter. If a caller can pass it, it can leak into a trace or a workflow definition. Resolve credentials through `ctx`, always.

---

## Streaming

Image placeholder · 16:9
A dark UI mockup of a streaming task card, mid-execution: a progress bar at 62%, a rotating status line reading "Cloning objects... 1,240 of 2,003," and a small "Cancel" button in the corner. Below it, a partial result already rendered — a file tree with some entries dimmed as still-loading. Clean, minimal, high-contrast dark mode styling consistent with a premium developer tool.

A tool that takes more than an instant should stream, not block. Make the function an async generator and yield instead of returning once.

```python
from arble import tool, Context, Progress

@tool(name="repo.clone", permissions=["filesystem.write", "network.http"])
async def clone_repository(url: str, dest: str, ctx: Context):
    yield Progress(message="Resolving repository", percent=0)

    async for received, total in ctx.git.clone(url, dest):
        yield Progress(
            message=f"Receiving objects ({received}/{total})",
            percent=int(received / total * 100),
        )

    yield {"path": dest, "commit": await ctx.git.head(dest)}
```

**Progress updates** carry a message and an optional percent, and render as a live status line without the caller needing to poll.

**Partial outputs** let a tool yield pieces of its final result as they're ready — search results as they arrive, rows as a query streams back — rather than holding everything until the end.

**Long-running tasks** stay attached to the same call rather than requiring a separate "check status" tool; the stream itself is the status.

**Cancellation** arrives as a signal on `ctx.cancelled`, checked cooperatively — a streaming tool should check it between yields and stop cleanly, not rely on being killed.

**Timeouts** are enforced by Arble regardless of whether the tool checks cancellation; a tool that ignores the signal still gets terminated at its deadline, just less gracefully.

---

## Development

Image placeholder · 16:9
A realistic developer workstation shot from a three-quarter angle: a laptop showing a code editor on the left half of the screen and a live tool inspector panel on the right half, displaying a schema tree, a permission preview, and a scrolling log pane. Warm desk lighting, shallow depth of field, a coffee cup softly blurred in the foreground — evokes a genuine working setup rather than a stock photo.

`arble dev` runs a local loop built around fast iteration on a single tool.

**Hot reload.** Saving the tool file re-registers it in the local registry within milliseconds — no restart, no re-authentication.

**Inspector.** A live panel showing the current inferred schema, the last five calls with their inputs and outputs, and any validation errors as you type.

**Schema viewer.** Renders the generated JSON Schema exactly as the registry will store it, so you catch an unintended type widening before it ships.

**Permission preview.** Shows the exact prompt a user will see on first call, so you can tell whether your `permissions` declaration reads clearly to someone who isn't you.

**Logs.** Structured, per-call logs with the tool name, version, and call ID attached, filterable by tool while other tools keep running in the background.

**Registry.** A local-only view of everything currently registered, matching the shape of the production registry described in [Tool registry](#tool-registry).

**CLI.** Every `arble dev` capability is also a scriptable command — `arble tools inspect`, `arble tools schema`, `arble tools logs` — for use outside the interactive session.

---

## Testing

Tool SDK's test harness runs a tool without a live Arble session, so tests are fast and don't depend on network state or a real agent loop.

**Unit testing.** `arble.testing.call(tool, **kwargs)` invokes a tool directly against its schema, catching type and validation errors the same way a real call would.

**Mock tools.** Any tool your tool calls internally can be swapped for a mock that returns fixed data, isolating the test to the tool under test.

**Replay.** Record a real call once with `arble tools record`, then replay it in CI without hitting the live service again — useful for tools wrapping flaky or rate-limited APIs.

**Snapshots.** Assert that a tool's output schema, not just its output value, hasn't changed unexpectedly — catches a field rename or a widened type before it breaks a caller.

**Permission simulation.** Run a tool as though a specific permission were denied, to verify it fails with a clear error rather than a partial, confusing result.

**Failure simulation.** Inject a timeout, a network error, or a malformed upstream response to verify your tool's error handling actually produces the typed error you think it does.

```python
from arble.testing import call, deny_permission

def test_create_issue_success():
    result = call(create_issue, input=CreateIssueInput(title="Bug"))
    assert result["title"] == "Bug"

def test_create_issue_without_network_permission():
    with deny_permission("network.http"):
        with pytest.raises(PermissionError):
            call(create_issue, input=CreateIssueInput(title="Bug"))
```

---

## Publishing

Image placeholder · 16:9
A dark, cinematic render showing a small glass SDK package cube on the left transforming — via a horizontal light trail — into a larger, more structured registry card on the right, labeled with a version tag, a checkmark seal, and a small icon row. The transformation suggests packaging and validation happening in transit. Minimal, high contrast, centered composition.

`arble tools publish` pushes a packaged tool to a registry. Which registry depends on who should be able to install it.

**Versioning.** Tools follow semantic versioning. A published version is immutable — a fix ships as a new version, never an overwrite — so a workflow pinned to `1.2.0` never changes underneath it.

**Signing.** Every published package is signed with the publisher's key. Arble verifies the signature on install and refuses an unsigned or tampered package.

**Private registry.** Visible only to you, useful for tools still in development or scoped to a single deployment.

**Organization registry.** Visible to everyone in your Arble organization, gated by the same role permissions as any other shared resource.

**Public registry.** Visible to any Arble user, reviewed before listing, and where [Example tools](#example-tools) like the ones below live.

---

## Built-in helpers

`ctx` gives every tool access to a set of helpers so common operations don't require a new dependency or a hand-rolled client.

| Helper | Provides |
|---|---|
| Filesystem | Scoped read/write/list, respecting the tool's declared path permission |
| Browser | A controllable browser context for tools that need to navigate or scrape |
| Desktop | OS-level automation — window focus, screenshots, input simulation |
| Terminal | A sandboxed shell for tools that need to run a command |
| Clipboard | Read and write the system clipboard, gated behind its own permission |
| Notifications | Post a system notification the user sees outside the Arble session |
| Memory | Read and write the user's persistent memory store |
| Scheduler | Queue a future or recurring call to this or another tool |
| HTTP | An HTTP client with credentials, retries, and tracing pre-wired |
| Database | Query a database Arble has been granted a connection to |
| Encryption | Encrypt and decrypt values using keys Arble manages, never exposed to the tool |
| Search | Query the user's indexed local content and connected sources |

Reaching for `ctx.http` instead of importing a new HTTP library isn't a style preference — calls made through `ctx` are traced, retried, and rate-limited consistently with every other tool, which a hand-rolled client won't be.

---

## Example tools

Image placeholder · 16:9
A gallery of twelve premium tool cards arranged in a 4×3 grid on a dark background, each a small rounded glass tile with a minimal monochrome icon (folder, browser window, cloud with sun, GitHub octocat-style mark, chat bubble, envelope, calendar, database cylinder, bell, camera, microphone, brain outline) and a short label beneath. Even spacing, consistent lighting, subtle hover-like glow on two of the tiles to suggest interactivity.

| Tool | What it does |
|---|---|
| Filesystem | Reads, writes, and searches files within a granted directory scope |
| Browser | Navigates, clicks, and extracts content from a controlled browser session |
| Weather | Fetches current conditions and forecasts for a named location |
| GitHub | Opens issues, reviews pull requests, and reads repository state |
| Slack | Posts messages and reads channel history in workspaces the user connected |
| Email | Drafts, sends, and searches messages through the user's connected inbox |
| Calendar | Reads availability and creates events on the user's connected calendar |
| Database | Runs scoped queries against a database connection the user granted |
| Notifications | Delivers a system notification outside the current Arble session |
| Camera | Captures a still image from a paired device's camera |
| Microphone | Records or transcribes audio from a paired device's microphone |
| Memory | Reads from and writes to the user's persistent memory store |

Each of these is a normal Tool SDK tool — nothing about them is privileged or built with a different API than the one described on this page.

---

## Tool registry

Image placeholder · 16:9
A dark, symmetrical diagram: five labeled source icons (Built-in, SDK, MCP, Desktop, Remote Services) arranged around the top and sides, each connected by a thin converging line to a single glowing hexagonal node at the center labeled "Registry." From the registry, a single line extends downward to a minimal robot/agent glyph, captioned "sees every tool identically." Clean, dark, high contrast.

Every tool Arble can call — regardless of where it came from — lands in one registry, indexed the same way.

| Source | Examples |
|---|---|
| Built-in | Filesystem, terminal, browser, memory |
| Tool SDK | Anything you build and register with `@tool` |
| MCP | Tools exposed by a connected MCP server |
| Desktop | OS-level capabilities on a paired desktop |
| Remote services | Tools backed by a hosted API rather than local code |

The planner that decides which tool to call for a given step reads name, description, input schema, and permission requirements — the same four fields regardless of source. It has no notion of "this one is built-in" or "this one came from MCP." That's deliberate: it means adding a source of tools to Arble never means teaching the planner something new, and it means a tool you publish through Tool SDK is chosen exactly as readily as one Arble shipped with.

---

## Performance

**Cold start.** A tool's first call in a session pays a one-time cost to load its code and resolve permissions; every call after that reuses the warm instance.

**Caching.** A tool can declare a result as cacheable with a TTL — `@tool(cache_ttl=60)` — and Arble serves repeated identical calls from cache without re-executing the function.

**Streaming.** Streaming a long task's progress isn't just UX — it lets Arble start planning the next step before the current one fully completes, when the plan doesn't depend on the final value.

**Memory.** Tools that write to memory should write summaries, not raw payloads; a tool that dumps a full API response into memory bloats every future context that reads it back.

**Latency.** The registry tracks p50/p95 latency per tool and surfaces tools trending slower, so a regression in a dependency shows up before a user reports it.

**Retries.** Declare `retryable=True` on errors that are safe to retry, and Arble retries with backoff automatically — your function doesn't need its own retry loop.

**Timeouts.** Set a tool-level default with `@tool(timeout=30)`; callers can request a shorter deadline but never a longer one than the tool declares.

---

## Security

**Sandbox.** Tool code runs in an isolated process with no ambient access to the filesystem, network, or other tools' data — only what its declared permissions and resources explicitly grant.

**Permissions.** Every capability is opt-in and declared up front, per [Permissions](#permissions) — there is no implicit access a tool can fall back on.

**Audit logs.** Every call — inputs, the permission grant it ran under, and its outcome — is logged and queryable, so "what did this tool do, and when" always has an answer.

**Least privilege.** Scope permissions as narrowly as the tool functionally needs — `filesystem.write:~/Reports`, not `filesystem.write:~` — since a broader grant is a broader blast radius if the tool is ever compromised.

**Encryption.** Secrets and credentials are encrypted at rest in Arble's credential store and never appear in plaintext in logs, traces, or registry entries.

**Secrets.** Handled exclusively through `ctx.secrets` and `ctx.auth` — never accepted as a plain parameter, per [Authentication](#authentication).

**Revocation.** Revoking a permission takes effect on the next call, immediately, without requiring the tool to be reinstalled or the session restarted.

---

## Best practices

1. Keep a tool's scope narrow — one clear job, not a Swiss Army knife with a dozen optional modes.
2. Name tools with a `namespace.action` convention (`github.create_issue`, not `create`), so the registry stays legible at scale.
3. Write the docstring for the agent, not for yourself — it's the description the planner reads to decide when to call this tool.
4. Declare the narrowest permission that works, and scope filesystem and network permissions to specific paths or hosts.
5. Never accept credentials as parameters — resolve them through `ctx.secrets` or `ctx.auth`.
6. Prefer typed models (Pydantic, dataclasses) over loose `dict` parameters — the schema you get is only as good as the types you write.
7. Stream anything that takes more than a couple of seconds — a blocked call with no progress reads as broken, not slow.
8. Check `ctx.cancelled` between yields in any streaming tool, and stop promptly when it's set.
9. Raise typed `ToolError` subclasses instead of letting exceptions propagate raw — the agent can only react intelligently to errors it can parse.
10. Mark genuinely retryable errors as `retryable=True`, but never mark ones that write data non-idempotently.
11. Write memory entries as summaries, not raw dumps — future context windows pay for every token you store.
12. Version deliberately — a breaking schema change is a major version, not a patch.
13. Test with permission simulation, not just happy-path calls — most production failures are a denied permission, not bad input.
14. Return resources instead of raw paths or blobs whenever the output is a file, image, or document.
15. Keep the function body free of permission or credential checks — if you find yourself writing one, the declaration in the decorator is what's missing.

---

## Reference

- [Decorators](#) — `@tool`, parameters, defaults
- [Schemas](#) — type inference rules, explicit schema overrides
- [Resources](#) — full resource type catalog and helper methods
- [Permissions](#) — scope syntax, grant levels, inheritance rules
- [Streaming](#) — `Progress`, partial results, cancellation signals
- [Memory](#) — read/write API, retention, summarization guidance
- [Authentication](#) — `ctx.secrets`, `ctx.auth`, OAuth flow setup
- [CLI](#) — full `arble tools` command reference
- [Publishing](#) — package format, signing, registry configuration
- [Testing](#) — `arble.testing` API reference
- [API](#) — REST and streaming endpoint reference for published tools

---

## FAQ

**Do I need MCP if I'm using Tool SDK?**
No. They solve different problems. MCP connects Arble to a server someone else runs; Tool SDK is how you build a tool that runs as a native part of Arble itself. Many setups use both.

**Can a Tool SDK tool call an MCP tool?**
Yes. From the registry's perspective they're both just tools — your function can call one through the same `ctx` interface it uses for any built-in helper.

**What happens if I change a tool's input schema after publishing?**
A backward-compatible change (a new optional field) can ship as a patch version. A breaking change (removing or retyping a required field) needs a new major version — the old version keeps working for anyone pinned to it.

**How does Arble decide which tool to call for a given task?**
The planner reads each candidate tool's name, description, and schema from the registry and picks based on fit — the same process regardless of whether the tool is built-in, SDK, or MCP.

**Can I test a tool without a full Arble session running?**
Yes — the `arble.testing` harness calls a tool directly against its schema and mocked context, with no live session required. See [Testing](#testing).

**Do streaming tools need a different permission model?**
No. Permissions are declared once on the tool and apply to the whole call, streamed or not.

**Where are secrets actually stored?**
In Arble's encrypted credential store, resolved into your tool at call time through `ctx.secrets` or `ctx.auth`. Your code never touches the storage layer.

**Can I publish a tool privately within my company only?**
Yes — the organization registry is visible only to members of your Arble organization. See [Publishing](#publishing).

**What's the difference between `permissions` and a `Resource` scope?**
A permission is a capability ("this tool can write files"); a resource scope narrows *where* ("...within `~/Reports`"). Most filesystem and network permissions carry a scope as part of the same declaration.

**Is there a limit on how long a streaming tool can run?**
Every tool has a deadline, defaulting to 30 seconds and overridable with `@tool(timeout=...)`. A streaming tool that needs longer should say so explicitly rather than relying on the default.

---

**Previous:** [MCP Servers](#) · **Next:** [CLI](#)
