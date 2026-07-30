# API Reference

*Developers / API Reference*

Image placeholder · 16:9
A premium Apple-keynote render on a near-black background: three translucent glass cards on the left, each showing a fragment of an HTTP request (a `POST` verb, a JSON body, an `Authorization` header), flowing along thin luminous rails toward a matte-black monolithic slab at center labeled with a minimal Arble mark. Out of the right side of the slab, two structured response cards emerge — one a JSON object, one a stack of small streaming event rows. Monochrome, soft rim lighting, deep shadow, no color accents.

## Everything Arble can do. Over HTTP.

Every capability in the Arble desktop application is available through this API. Sessions, agents, memory, tools, permissions, desktop and mobile control are all resources you can create, read and act on from your own code.

The API is REST over HTTPS. Requests and responses are JSON. Long-running work streams over Server-Sent Events, and anything that happens outside a request — a permission approval, a completed run — reaches you through webhooks. Authentication is a bearer token on every request.

---

## On this page

- [Quick start](#quick-start)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Making requests](#making-requests)
- [Agents](#agents)
- [Sessions](#sessions)
- [Runs](#runs)
- [Messages](#messages)
- [Memory](#memory)
- [Tools](#tools)
- [Workflows](#workflows)
- [Permissions](#permissions)
- [Connectors](#connectors)
- [MCP](#mcp)
- [Desktop](#desktop)
- [Mobile](#mobile)
- [Files](#files)
- [Streaming](#streaming)
- [Webhooks](#webhooks)
- [Events](#events)
- [Pagination](#pagination)
- [Filtering](#filtering)
- [Rate limits](#rate-limits)
- [Errors](#errors)
- [SDKs](#sdks)
- [Versioning](#versioning)
- [OpenAPI](#openapi)
- [Security](#security)
- [Best practices](#best-practices)
- [Reference](#reference)
- [FAQ](#faq)

---

## Quick start

Create a run and get a result in one call:

```bash
curl https://api.arble.ai/v1/runs \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "agt_5wTn9Kd",
    "input": "Summarize the open pull requests in acme/api-gateway"
  }'
```

```json
{
  "id": "run_2Kd8vQx",
  "object": "run",
  "status": "queued",
  "agent": "agt_5wTn9Kd",
  "session": "ses_8kQ2mVx",
  "created_at": 1775049600
}
```

The run is created immediately and executes asynchronously. Poll it, stream it, or receive a `run.completed` webhook — all three are covered below.

Three things every request needs: an API key in the `Authorization` header, `Content-Type: application/json` on any request with a body, and the base URL for your environment.

---

## Authentication

All requests authenticate with a bearer token. There is no other scheme — no query-string keys, no HTTP basic.

```bash
curl https://api.arble.ai/v1/agents \
  -H "Authorization: Bearer arb_live_9f2c4a..."
```

Tokens differ in what they can reach, not in how they're sent.

| Token type | Prefix | Scope |
|---|---|---|
| Personal | `arb_user_` | Everything the user can access, across their organizations |
| Organization | `arb_org_` | One organization; all its projects |
| Project | `arb_proj_` | One project. The right default for a deployed service |
| Session | `arb_ses_` | One session, expires in ≤ 1 hour. For browser and mobile clients |
| Device | `arb_dev_` | One paired device, for desktop and mobile control endpoints |

**Project tokens** are what most integrations should use. A token scoped to one project can't read another project's memory even if the same key leaks.

**Session tokens** exist so you never ship a long-lived key to an untrusted client. Mint one server-side, hand it to the browser, and let it expire:

```bash
curl https://api.arble.ai/v1/tokens \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "session", "session": "ses_8kQ2mVx", "expires_in": 900}'
```

```json
{
  "object": "token",
  "token": "arb_ses_7Vn2...",
  "type": "session",
  "expires_at": 1775050500
}
```

**Device authentication** covers the desktop and mobile endpoints, which act on a specific machine. Pair the device once through the app; the resulting device token is the only credential those endpoints accept.

**Rotation.** Create the new key, deploy it, then revoke the old one. Both work during the overlap, so rotation needs no downtime:

```bash
curl -X POST https://api.arble.ai/v1/api_keys \
  -H "Authorization: Bearer $ARBLE_ADMIN_KEY" \
  -d '{"name": "api-gateway-prod", "scope": "project", "project": "prj_4mNp"}'
```

**Revocation** takes effect immediately, on in-flight requests as well as new ones:

```bash
curl -X DELETE https://api.arble.ai/v1/api_keys/key_8fRt2Ls \
  -H "Authorization: Bearer $ARBLE_ADMIN_KEY"
```

The full key is returned only once, at creation. Store it in a secret manager; there is no endpoint that reads it back.

---

## Base URL

| Environment | Base URL |
|---|---|
| Production | `https://api.arble.ai/v1` |
| Development | `https://api.sandbox.arble.ai/v1` |
| Self-hosted | `https://<your-host>/v1` |

Development is a full instance with separate data and no billing. Runs execute against a smaller model by default, so latency and output differ from production — verify behavior in production before you depend on it.

Regional endpoints pin data residency. Requests to a regional host never leave that region, including model inference:

| Region | Host |
|---|---|
| United States | `https://us.api.arble.ai/v1` |
| European Union | `https://eu.api.arble.ai/v1` |
| Asia Pacific | `https://ap.api.arble.ai/v1` |

An object created in one region isn't visible from another. Pick a region per project, not per request.

---

## Making requests

**Headers.**

| Header | Notes |
|---|---|
| `Authorization` | `Bearer <token>`. Required on every request. |
| `Content-Type` | `application/json` on any request with a body. |
| `Arble-Version` | Pins the API version. Defaults to your account's version. |
| `Idempotency-Key` | Client-generated key. Safe retries on `POST`. |
| `Accept-Encoding` | `gzip` or `br`. Responses are compressed when requested. |

**Idempotency.** Send an `Idempotency-Key` on any `POST` that creates something. A repeated key returns the original response instead of creating a second object — keys are retained 24 hours:

```bash
curl https://api.arble.ai/v1/runs \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Idempotency-Key: 8f2c4a9e-1b7d-4e3a-9c8f-2d1e6b5a4c30" \
  -H "Content-Type: application/json" \
  -d '{"agent": "agt_5wTn9Kd", "input": "Audit the retry logic"}'
```

Reusing a key with a *different* body returns `400 idempotency_key_reused`.

**Timeouts.** The API responds within 30 seconds. Anything longer is asynchronous by design: creating a run returns immediately with `status: "queued"`, and you stream or poll for the result. Set a client timeout of 30 seconds and don't raise it.

**Retries.** Retry `429`, `500`, `502`, `503` and `504` with exponential backoff and jitter. Never retry `400`, `401`, `403`, `404` or `422` — the request is wrong and will stay wrong. Always send an idempotency key on retried `POST`s.

---

## Agents

Image placeholder · 16:9
A dark, minimal render: on the left, a single glass card labeled "Agent" listing three abstract config rows (model, tools, instructions). A thin luminous line runs right, where it fans into three smaller identical execution cards labeled "Run," each with its own progress indicator. The composition makes clear that one definition produces many executions — configuration on the left, instances on the right.

An agent is a reusable configuration: a model, a set of tools, and instructions. Runs are executions of an agent. Create the agent once and run it many times.

### Create an agent

`POST /v1/agents`

| Parameter | Type | Notes |
|---|---|---|
| `name` | string | Required. Unique within the project. |
| `instructions` | string | Required. System instructions. |
| `model` | string | Defaults to the project's model. |
| `tools` | array | Tool names the agent may call. Omit for all project tools. |
| `permissions` | object | Capability grants scoped to this agent. |
| `metadata` | object | Up to 16 key-value pairs. Returned unmodified. |

```bash
curl https://api.arble.ai/v1/agents \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pr-reviewer",
    "instructions": "Review diffs for missing error handling. Be specific.",
    "model": "arble-1",
    "tools": ["github.get_pull_request", "github.create_review_comment"],
    "permissions": {"network.http": ["api.github.com"]}
  }'
```

```json
{
  "id": "agt_5wTn9Kd",
  "object": "agent",
  "name": "pr-reviewer",
  "model": "arble-1",
  "tools": ["github.get_pull_request", "github.create_review_comment"],
  "permissions": {"network.http": ["api.github.com"]},
  "created_at": 1775049600
}
```

Errors: `400 parameter_missing` · `409 name_already_exists` · `422 unknown_tool`

### List agents

`GET /v1/agents`

Returns agents in the project, newest first. Accepts `limit`, `cursor` and `name` filters.

```bash
curl "https://api.arble.ai/v1/agents?limit=2" \
  -H "Authorization: Bearer $ARBLE_API_KEY"
```

```json
{
  "object": "list",
  "data": [
    {"id": "agt_5wTn9Kd", "object": "agent", "name": "pr-reviewer", "created_at": 1775049600},
    {"id": "agt_3pLwRt9", "object": "agent", "name": "ci-triage", "created_at": 1774963200}
  ],
  "has_more": true,
  "next_cursor": "cur_agt_3pLwRt9"
}
```

Errors: `400 invalid_cursor`

### Retrieve an agent

`GET /v1/agents/:id`

```bash
curl https://api.arble.ai/v1/agents/agt_5wTn9Kd \
  -H "Authorization: Bearer $ARBLE_API_KEY"
```

Returns the full agent object. Errors: `404 agent_not_found`

### Update an agent

`PATCH /v1/agents/:id`

Accepts any creatable field except `name`. Updates apply to future runs; in-flight runs keep the configuration they started with.

```bash
curl -X PATCH https://api.arble.ai/v1/agents/agt_5wTn9Kd \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "arble-1-pro"}'
```

Errors: `404 agent_not_found` · `422 unknown_tool`

### Delete an agent

`DELETE /v1/agents/:id`

Fails while runs are active unless `force=true`, which cancels them.

```json
{"id": "agt_5wTn9Kd", "object": "agent", "deleted": true}
```

Errors: `404 agent_not_found` · `409 agent_has_active_runs`

---

## Sessions

A session holds context across runs: messages, tool results, and permission grants. Runs in the same session see each other's history; runs in different sessions are independent.

### Create a session

`POST /v1/sessions`

| Parameter | Type | Notes |
|---|---|---|
| `title` | string | Optional, for display. |
| `agent` | string | Default agent for runs in this session. |
| `metadata` | object | Up to 16 key-value pairs. |

```bash
curl https://api.arble.ai/v1/sessions \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Payment retry audit", "agent": "agt_5wTn9Kd"}'
```

```json
{
  "id": "ses_8kQ2mVx",
  "object": "session",
  "status": "active",
  "title": "Payment retry audit",
  "agent": "agt_5wTn9Kd",
  "message_count": 0,
  "created_at": 1775049600
}
```

Errors: `404 agent_not_found`

### Session lifecycle

A session is `active`, `paused` or `archived`. Each transition is its own endpoint:

| Action | Endpoint | Effect |
|---|---|---|
| Pause | `POST /v1/sessions/:id/pause` | Cancels active runs, keeps context |
| Resume | `POST /v1/sessions/:id/resume` | Returns to `active` with context intact |
| Archive | `POST /v1/sessions/:id/archive` | Read-only. Context retained, no new runs |
| Delete | `DELETE /v1/sessions/:id` | Removes the session and its messages |

```bash
curl -X POST https://api.arble.ai/v1/sessions/ses_8kQ2mVx/pause \
  -H "Authorization: Bearer $ARBLE_API_KEY"
```

```json
{"id": "ses_8kQ2mVx", "object": "session", "status": "paused"}
```

Errors: `404 session_not_found` · `409 invalid_session_state`

Deletion is permanent and does not remove memory the session wrote — memory outlives sessions by design. Delete memory entries explicitly if you need them gone.

### Export a session

`GET /v1/sessions/:id/export`

Returns the complete transcript: messages, tool calls with arguments and results, and every permission decision. This is the artifact for an audit or incident review.

```bash
curl "https://api.arble.ai/v1/sessions/ses_8kQ2mVx/export?format=json" \
  -H "Authorization: Bearer $ARBLE_API_KEY"
```

`format` accepts `json` or `jsonl`. Errors: `404 session_not_found`

---

## Runs

Image placeholder · 16:9
A dark render of a horizontal execution timeline: a single left-to-right spine with six labeled state nodes (queued, running, requires_action, running, completed) rendered as small glass discs of increasing brightness, and beneath the spine, short duration bars showing nested tool calls at different offsets. One node is visually emphasized with a small permission-prompt glyph beside it, showing where execution paused for approval. Precise and technical, like a real profiler view.

A run is one execution of an agent. Creating a run returns immediately; the run progresses asynchronously through states:

| Status | Meaning |
|---|---|
| `queued` | Accepted, not yet started |
| `running` | Executing |
| `requires_action` | Paused for a permission approval or client-side tool result |
| `completed` | Finished successfully |
| `failed` | Finished with an error. See `last_error` |
| `cancelled` | Cancelled by request |
| `expired` | Exceeded `timeout` without completing |

`requires_action` is the state that matters most: the run is waiting on you. Inspect `required_action` to see what it needs, then either approve a permission or submit a tool result.

### Create a run

`POST /v1/runs`

| Parameter | Type | Notes |
|---|---|---|
| `agent` | string | Required unless `session` has a default agent. |
| `input` | string | The instruction. Required. |
| `session` | string | Existing session. A new one is created if omitted. |
| `stream` | boolean | Return SSE instead of a run object. See [Streaming](#streaming). |
| `tools` | array | Narrow the agent's tools for this run only. |
| `timeout` | integer | Seconds, 1–3600. Default 300. |
| `metadata` | object | Up to 16 key-value pairs. |

```bash
curl https://api.arble.ai/v1/runs \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "agt_5wTn9Kd",
    "session": "ses_8kQ2mVx",
    "input": "Review PR 482 and comment on anything missing error handling",
    "timeout": 600
  }'
```

```json
{
  "id": "run_2Kd8vQx",
  "object": "run",
  "status": "queued",
  "agent": "agt_5wTn9Kd",
  "session": "ses_8kQ2mVx",
  "created_at": 1775049600,
  "started_at": null,
  "completed_at": null,
  "usage": null
}
```

Errors: `400 parameter_missing` · `404 agent_not_found` · `409 session_not_active` · `429 concurrency_limit_exceeded`

### Retrieve a run

`GET /v1/runs/:id`

```json
{
  "id": "run_2Kd8vQx",
  "object": "run",
  "status": "completed",
  "agent": "agt_5wTn9Kd",
  "session": "ses_8kQ2mVx",
  "output": "Three handlers retry without backoff: charge.py:118, refund.py:64, webhook.py:203.",
  "created_at": 1775049600,
  "started_at": 1775049601,
  "completed_at": 1775049643,
  "usage": {"input_tokens": 4182, "output_tokens": 311, "tool_calls": 9}
}
```

When `status` is `failed`, `last_error` carries the same shape as an API error. Errors: `404 run_not_found`

### Cancel a run

`POST /v1/runs/:id/cancel`

Cancels cooperatively: an in-flight tool call is given the chance to finish before the run stops. Returns the run with `status: "cancelling"`, then `cancelled`.

Errors: `404 run_not_found` · `409 run_not_cancellable`

### Retry a run

`POST /v1/runs/:id/retry`

Creates a new run with the same agent, input and session. Only `failed`, `cancelled` and `expired` runs can be retried; the original is left untouched and `retry_of` links them.

```json
{
  "id": "run_9Ln4Ktp",
  "object": "run",
  "status": "queued",
  "retry_of": "run_2Kd8vQx"
}
```

Errors: `404 run_not_found` · `409 run_not_retryable`

### List runs

`GET /v1/runs`

Filter by `session`, `agent`, `status`, `created_after` and `created_before`. See [Filtering](#filtering).

```bash
curl "https://api.arble.ai/v1/runs?session=ses_8kQ2mVx&status=failed" \
  -H "Authorization: Bearer $ARBLE_API_KEY"
```

Errors: `400 invalid_filter`

---

## Messages

Messages are the contents of a session. A run appends messages as it works; you append them to continue a conversation.

### Send a message

`POST /v1/sessions/:id/messages`

Appends a message and starts a run to respond to it. This is the conversational form of `POST /v1/runs` — use it when you're building a chat interface rather than dispatching a task.

| Parameter | Type | Notes |
|---|---|---|
| `content` | string | Required. |
| `attachments` | array | File IDs from [Files](#files). |
| `stream` | boolean | Return SSE instead of a message object. |

```bash
curl https://api.arble.ai/v1/sessions/ses_8kQ2mVx/messages \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Which of those is riskiest under load?",
    "attachments": ["file_7Bn3Kqs"]
  }'
```

```json
{
  "id": "msg_4Rt8Nvp",
  "object": "message",
  "session": "ses_8kQ2mVx",
  "role": "user",
  "content": "Which of those is riskiest under load?",
  "attachments": ["file_7Bn3Kqs"],
  "run": "run_6Wq2Mdx",
  "created_at": 1775049700
}
```

Errors: `404 session_not_found` · `409 session_not_active` · `422 attachment_not_found`

### List messages

`GET /v1/sessions/:id/messages`

Returns messages oldest-first by default; pass `order=desc` to reverse. Assistant messages include the `run` that produced them and any `tool_calls` made along the way.

```json
{
  "object": "list",
  "data": [
    {
      "id": "msg_5Sv9Owq",
      "object": "message",
      "role": "assistant",
      "content": "webhook.py:203 — it retries in a request handler, so retries stack under load.",
      "run": "run_6Wq2Mdx",
      "tool_calls": [
        {"tool": "filesystem.read", "arguments": {"path": "webhook.py"}, "duration_ms": 84}
      ],
      "created_at": 1775049714
    }
  ],
  "has_more": false,
  "next_cursor": null
}
```

Errors: `404 session_not_found`

---

## Memory

Image placeholder · 16:9
A dark composition: eight small translucent glass blocks of varying sizes float in loose vertical formation on the left, each bearing a few abstract text lines. They converge along thin luminous rails into a single narrow API gateway slot at center-right, emerging on the far right as one compact, denser block — conveying retrieval and summarization rather than mere storage. Monochrome, precise.

Memory is per-project and persists across sessions. Agents read it automatically at the start of a run. Entries should be durable facts — a constraint, a decision, a gotcha — not a log of what happened.

### Search memory

`POST /v1/memory/search`

Semantic search, not substring matching. Returns ranked entries with relevance scores.

| Parameter | Type | Notes |
|---|---|---|
| `query` | string | Required. |
| `limit` | integer | 1–100. Default 10. |
| `min_score` | number | 0–1. Filters weak matches. |

```bash
curl https://api.arble.ai/v1/memory/search \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "why the postgres driver is pinned", "limit": 3}'
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "mem_2fQx8Lp",
      "object": "memory",
      "content": "pg driver pinned to 8.11.3 — 8.12 breaks prepared statements under pgbouncer.",
      "score": 0.91,
      "source": "run_2Kd8vQx",
      "created_at": 1774963200
    }
  ],
  "has_more": false,
  "next_cursor": null
}
```

Errors: `400 parameter_missing`

### Insert memory

`POST /v1/memory`

```bash
curl https://api.arble.ai/v1/memory \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"content": "Staging shares the production Redis. Never flush from staging."}'
```

```json
{
  "id": "mem_8Yt3Rqz",
  "object": "memory",
  "content": "Staging shares the production Redis. Never flush from staging.",
  "created_at": 1775049800
}
```

Errors: `400 parameter_missing` · `422 content_too_long`

### Update and delete

`PATCH /v1/memory/:id` replaces `content`. `DELETE /v1/memory/:id` removes an entry.

```json
{"id": "mem_8Yt3Rqz", "object": "memory", "deleted": true}
```

Errors: `404 memory_not_found`

### Summarize memory

`POST /v1/memory/summarize`

Collapses related entries into fewer, denser ones. A smaller memory costs less context on every run. Accepts `older_than` (a duration like `90d`) to bound the work. This is asynchronous and returns a run you can poll.

```json
{"id": "run_1Cv7Hmn", "object": "run", "status": "queued"}
```

Errors: `409 summarization_in_progress`

### Export memory

`GET /v1/memory/export` returns every entry as JSONL. Errors: `403 permission_denied`

---

## Tools

Tools are the capabilities an agent can call. Agents call them during runs; you can also call them directly, which is useful for testing a tool or reusing one outside an agent loop.

### List tools

`GET /v1/tools`

Returns every tool available to the project — built-in, Tool SDK, MCP and connector-provided — in one list. The `source` field says where each came from; nothing else about the shape differs.

```json
{
  "object": "list",
  "data": [
    {
      "name": "github.create_review_comment",
      "object": "tool",
      "source": "connector",
      "description": "Comment on a line in a pull request.",
      "permissions": ["network.http:api.github.com"],
      "streaming": false
    }
  ],
  "has_more": true,
  "next_cursor": "cur_tool_github"
}
```

### Retrieve tool metadata

`GET /v1/tools/:name`

Returns the full JSON Schema for the tool's input and output, alongside its permission requirements. This is the same schema the planner reads.

```json
{
  "name": "github.create_review_comment",
  "object": "tool",
  "source": "connector",
  "input_schema": {
    "type": "object",
    "properties": {
      "pull_request": {"type": "integer"},
      "path": {"type": "string"},
      "line": {"type": "integer"},
      "body": {"type": "string"}
    },
    "required": ["pull_request", "path", "line", "body"]
  },
  "output_schema": {
    "type": "object",
    "properties": {"id": {"type": "integer"}, "url": {"type": "string"}}
  },
  "permissions": ["network.http:api.github.com"]
}
```

Errors: `404 tool_not_found`

### Execute a tool

`POST /v1/tools/:name/execute`

Calls the tool directly, bypassing the agent loop. Arguments are validated against the input schema before execution — a malformed call fails with `422` and never runs.

```bash
curl https://api.arble.ai/v1/tools/github.create_review_comment/execute \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "arguments": {
      "pull_request": 482,
      "path": "webhook.py",
      "line": 203,
      "body": "This retry stacks under load — move it out of the handler."
    }
  }'
```

```json
{
  "object": "tool_result",
  "tool": "github.create_review_comment",
  "output": {"id": 1904832, "url": "https://github.com/acme/api-gateway/pull/482#discussion_r1904832"},
  "duration_ms": 212
}
```

Direct execution still passes the permission gate. If the capability isn't granted, the call fails with `403` rather than prompting — there's no interactive approval on a bare HTTP request.

Streaming tools accept `"stream": true` and return SSE. Errors: `403 permission_denied` · `404 tool_not_found` · `422 invalid_arguments` · `504 tool_timeout`

---

## Workflows

Image placeholder · 16:9
A dark, structured diagram: a vertical spine of five glass step nodes connected by thin lines, with the second node branching into two parallel sub-nodes that rejoin at the third. A small clock glyph sits beside the top node and a looping arrow beside one middle node, indicating scheduling and retry. One completed node carries a checkmark, one is mid-progress. Technical and precise, not decorative.

A workflow is a sequence of steps — agent runs, tool calls, or conditionals — defined once and executed on demand or on a schedule. Where a run is one execution, a workflow is a repeatable process with state that survives failures.

### Create a workflow

`POST /v1/workflows`

| Parameter | Type | Notes |
|---|---|---|
| `name` | string | Required. Unique within the project. |
| `steps` | array | Required. Ordered steps. |
| `schedule` | string | Cron expression. Omit for on-demand only. |
| `on` | string | Event name to trigger on. See [Events](#events). |
| `max_retries` | integer | 0–10. Default 3. |

```bash
curl https://api.arble.ai/v1/workflows \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "nightly-triage",
    "schedule": "0 7 * * 1-5",
    "steps": [
      {"type": "run", "agent": "agt_3pLwRt9", "input": "Summarize CI failures from the last 24h"},
      {"type": "tool", "tool": "slack.post_message", "arguments": {"channel": "#eng-alerts"}}
    ]
  }'
```

```json
{
  "id": "wfl_5Kp2Nvx",
  "object": "workflow",
  "name": "nightly-triage",
  "schedule": "0 7 * * 1-5",
  "steps": 2,
  "created_at": 1775049900
}
```

Errors: `400 invalid_cron` · `409 name_already_exists` · `422 invalid_step`

### Run a workflow

`POST /v1/workflows/:id/run`

Starts an execution and returns a workflow run. Pass `input` to override the first step's input.

```json
{
  "id": "wfr_7Qm3Bkt",
  "object": "workflow_run",
  "workflow": "wfl_5Kp2Nvx",
  "status": "running",
  "step": 1,
  "steps_total": 2,
  "started_at": 1775049901
}
```

Errors: `404 workflow_not_found` · `409 workflow_run_in_progress`

### Control an execution

| Action | Endpoint |
|---|---|
| Pause | `POST /v1/workflow_runs/:id/pause` |
| Resume | `POST /v1/workflow_runs/:id/resume` |
| Cancel | `POST /v1/workflow_runs/:id/cancel` |

Pausing takes effect at the next step boundary, not mid-step. Resuming continues from the step that hadn't started — completed steps never re-execute.

Errors: `404 workflow_run_not_found` · `409 invalid_workflow_state`

### History

`GET /v1/workflow_runs?workflow=wfl_5Kp2Nvx`

Returns past executions with per-step timing and outcome. Filter by `status` to find failures.

```json
{
  "object": "list",
  "data": [
    {
      "id": "wfr_7Qm3Bkt",
      "object": "workflow_run",
      "status": "failed",
      "step": 2,
      "last_error": {"type": "permission_error", "code": "permission_denied"},
      "duration_ms": 41200
    }
  ],
  "has_more": false,
  "next_cursor": null
}
```

---

## Permissions

Every tool call passes a permission gate, whether it came from the app, the CLI or this API. A grant is a capability plus an optional scope.

### List and grant

`GET /v1/permissions` returns current grants. `POST /v1/permissions` creates one:

```bash
curl https://api.arble.ai/v1/permissions \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "capability": "network.http",
    "scope": "api.github.com",
    "level": "always_allow",
    "agent": "agt_5wTn9Kd"
  }'
```

`level` is `always_allow`, `ask` or `never_allow`. Omitting `agent` applies the grant project-wide.

```json
{
  "id": "perm_3Nx8Vqt",
  "object": "permission",
  "capability": "network.http",
  "scope": "api.github.com",
  "level": "always_allow",
  "agent": "agt_5wTn9Kd",
  "created_at": 1775050000
}
```

Errors: `422 unknown_capability` · `409 permission_already_exists`

### Handle a permission request

When a run needs a capability set to `ask`, it enters `requires_action`:

```json
{
  "id": "run_2Kd8vQx",
  "object": "run",
  "status": "requires_action",
  "required_action": {
    "type": "permission_request",
    "id": "preq_9Ft2Wsm",
    "capability": "github.create_pull_request",
    "scope": "acme/api-gateway",
    "arguments": {"title": "Add backoff to webhook retries", "base": "main"}
  }
}
```

Approve or deny it, and the run continues or fails:

```bash
curl https://api.arble.ai/v1/permission_requests/preq_9Ft2Wsm/approve \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -d '{"remember": true}'
```

`remember: true` promotes the decision to a persistent `always_allow` grant. `POST .../deny` is the mirror. A permission request expires after 15 minutes and the run fails with `permission_request_expired`.

Errors: `404 permission_request_not_found` · `409 permission_request_resolved`

### Revoke

`DELETE /v1/permissions/:id` takes effect on the next tool call, including inside runs already executing.

### Policy

`PUT /v1/permissions/policy` sets defaults for capabilities with no explicit grant. Use it to fail closed:

```json
{"default": "never_allow", "exceptions": {"filesystem.read": "always_allow"}}
```

---

## Connectors

A connector is an authenticated link to an external service. Installing one adds its tools to the registry; authenticating it makes them usable.

| Action | Endpoint |
|---|---|
| List | `GET /v1/connectors` |
| Install | `POST /v1/connectors` |
| Remove | `DELETE /v1/connectors/:name` |
| Health | `GET /v1/connectors/:name/health` |
| Authenticate | `POST /v1/connectors/:name/authorize` |

```bash
curl https://api.arble.ai/v1/connectors \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "github"}'
```

```json
{
  "name": "github",
  "object": "connector",
  "status": "pending_auth",
  "authorize_url": "https://api.arble.ai/v1/connectors/github/authorize?state=st_4Kp9",
  "tools": []
}
```

OAuth can't complete inside an API call. Redirect the user to `authorize_url`; the connector becomes `connected` and its tools appear once they finish.

```json
{
  "name": "github",
  "object": "connector",
  "status": "connected",
  "scopes": ["repo", "read:org"],
  "expires_at": 1782825600,
  "tools": ["github.get_pull_request", "github.create_review_comment"]
}
```

Health reports reachability and token validity separately — an expired token is `status: "connected"` with `auth: "expired"`, which is a different fix from an unreachable service.

Errors: `404 connector_not_found` · `409 connector_already_installed` · `401 connector_auth_expired`

---

## MCP

Arble speaks Model Context Protocol natively. An MCP server's tools land in the same registry as everything else and pass the same permission gate.

| Action | Endpoint |
|---|---|
| List servers | `GET /v1/mcp/servers` |
| Install | `POST /v1/mcp/servers` |
| Remove | `DELETE /v1/mcp/servers/:name` |
| Health | `GET /v1/mcp/servers/:name/health` |
| Registry | `GET /v1/mcp/registry` |

```bash
curl https://api.arble.ai/v1/mcp/servers \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "acme-internal", "transport": "http", "url": "https://mcp.acme.example.com/mcp"}'
```

```json
{
  "name": "acme-internal",
  "object": "mcp_server",
  "transport": "http",
  "status": "connected",
  "protocol_version": "2025-06-18",
  "tools": 9
}
```

`transport` is `http` for remote servers or `stdio` for local ones, which take a `command` instead of a `url`. Only `http` is available on hosted Arble — `stdio` requires a self-hosted instance or a paired device, since it spawns a process.

`GET /v1/mcp/registry` lists servers Arble is known to work with, for building an install picker. Per-tool permissions are read and written through [Permissions](#permissions) using the tool's fully qualified name.

Errors: `409 server_already_installed` · `422 unsupported_transport` · `503 server_unreachable`

---

## Desktop

Image placeholder · 16:9
A dark render: a floating translucent glass plane on the right represents a desktop screen containing two abstract application windows. On the left, three stacked HTTP request cards send thin luminous lines into the plane — one terminating in a crosshair over a window, one in a small camera glyph, one in a clipboard glyph. Monochrome, deep shadow, restrained.

Desktop endpoints act on a specific paired machine and require a device token. Every call requires the `desktop` capability and appears in the audit log.

| Action | Endpoint |
|---|---|
| Open app or file | `POST /v1/desktop/open` |
| Screenshot | `POST /v1/desktop/screenshot` |
| Read clipboard | `GET /v1/desktop/clipboard` |
| Write clipboard | `PUT /v1/desktop/clipboard` |
| Keyboard input | `POST /v1/desktop/keyboard` |
| Mouse input | `POST /v1/desktop/mouse` |
| List windows | `GET /v1/desktop/windows` |
| Notification | `POST /v1/desktop/notifications` |

```bash
curl https://api.arble.ai/v1/desktop/screenshot \
  -H "Authorization: Bearer $ARBLE_DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"window": "Safari"}'
```

Screenshots return a file reference, not inline base64 — fetch the bytes through [Files](#files):

```json
{
  "object": "screenshot",
  "file": "file_7Bn3Kqs",
  "width": 2560,
  "height": 1440,
  "captured_at": 1775050100
}
```

Mouse coordinates are screen points with the origin top-left:

```bash
curl https://api.arble.ai/v1/desktop/mouse \
  -H "Authorization: Bearer $ARBLE_DEVICE_TOKEN" \
  -d '{"action": "click", "x": 640, "y": 480}'
```

Errors: `401 device_token_required` · `403 permission_denied` · `404 window_not_found` · `503 device_offline`

---

## Mobile

Mobile endpoints target a paired phone and also require a device token. Camera and microphone always prompt on the device itself — no parameter suppresses that, and there is no silent capture.

| Action | Endpoint |
|---|---|
| Push notification | `POST /v1/mobile/notifications` |
| Clipboard | `GET` / `PUT /v1/mobile/clipboard` |
| Open app or deep link | `POST /v1/mobile/open` |
| Camera capture | `POST /v1/mobile/camera` |
| Microphone capture | `POST /v1/mobile/microphone` |

```bash
curl https://api.arble.ai/v1/mobile/notifications \
  -H "Authorization: Bearer $ARBLE_DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Migration finished", "body": "14 tables, 0 errors"}'
```

```json
{"object": "notification", "id": "ntf_2Vx8Kmp", "delivered": true}
```

Capture endpoints return `202 Accepted` with a pending capture, since they wait on a human:

```json
{
  "object": "capture",
  "id": "cap_6Rn4Wqt",
  "status": "awaiting_approval",
  "expires_at": 1775050400
}
```

Poll it, or subscribe to the capture events. Approved captures expose a `file`; declined ones become `status: "denied"`.

Errors: `401 device_token_required` · `403 capture_denied` · `503 device_offline` · `504 capture_timeout`

---

## Files

Files carry binary data in and out of the API: attachments on messages, screenshots, and tool inputs and outputs.

### Upload

`POST /v1/files` with `multipart/form-data`.

| Field | Notes |
|---|---|
| `file` | Required. The bytes. |
| `purpose` | `attachment`, `tool_input` or `resource`. Required. |

```bash
curl https://api.arble.ai/v1/files \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -F purpose=attachment \
  -F file=@./trace.json
```

```json
{
  "id": "file_7Bn3Kqs",
  "object": "file",
  "filename": "trace.json",
  "purpose": "attachment",
  "bytes": 48219,
  "content_type": "application/json",
  "created_at": 1775050200
}
```

Errors: `413 file_too_large` · `422 unsupported_content_type`

### Download, metadata, delete

`GET /v1/files/:id/content` streams the bytes with the original `Content-Type`. `GET /v1/files/:id` returns metadata only. `DELETE /v1/files/:id` removes it.

Requesting content with a `Range` header returns `206 Partial Content`, which is how you resume an interrupted download.

### Large files

Single-request uploads are capped at 100 MB. Above that, use a resumable upload: `POST /v1/uploads` returns an upload session, `PUT` each part to it, then `POST /v1/uploads/:id/complete`. Parts are 5–100 MB and may be sent in parallel.

```json
{
  "id": "upl_9Kt3Mvx",
  "object": "upload",
  "status": "pending",
  "part_size": 8388608,
  "expires_at": 1775136600
}
```

Errors: `409 upload_already_completed` · `422 invalid_part_size`

---

## Streaming

Image placeholder · 16:9
A dark render showing a vertical stack of narrow horizontal event rows scrolling upward, each row a thin glass bar labeled with an event name and a timestamp, becoming progressively more transparent toward the top of the frame to suggest continuous flow. On the right edge, a single unbroken luminous vertical line represents the open connection, with small tick marks for heartbeats. Precise, technical, monochrome.

Pass `"stream": true` to any run, message or tool execution and the response becomes `text/event-stream` instead of a JSON object.

```bash
curl https://api.arble.ai/v1/runs \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agent": "agt_5wTn9Kd", "input": "Audit the retry logic", "stream": true}'
```

```
event: run.created
data: {"id":"run_2Kd8vQx","status":"queued"}

event: run.step
data: {"step":1,"type":"tool_call","tool":"filesystem.read"}

event: progress
data: {"message":"Reading 14 files","percent":35}

event: message.delta
data: {"delta":"Three handlers retry without"}

event: message.delta
data: {"delta":" backoff: charge.py:118, "}

event: run.completed
data: {"id":"run_2Kd8vQx","status":"completed","usage":{"input_tokens":4182,"output_tokens":311}}
```

| Event | Meaning |
|---|---|
| `run.created` | The run exists and is queued |
| `run.step` | A step started — a tool call or a model turn |
| `progress` | Incremental progress from a streaming tool |
| `message.delta` | A fragment of assistant output. Concatenate in order |
| `tool.result` | A tool returned |
| `run.requires_action` | Execution paused. See [Permissions](#permissions) |
| `run.completed` | Terminal. Carries final usage |
| `error` | Terminal. Carries a standard error object |

A stream always ends with `run.completed`, `error`, or a closed connection. Treat a closed connection without a terminal event as a failure and reconcile with `GET /v1/runs/:id` — never assume success.

**Heartbeats.** A `:ping` comment arrives every 15 seconds to keep intermediaries from closing an idle connection. Ignore lines beginning with `:`.

**Cancellation.** Closing the connection does *not* cancel the run — it keeps executing server-side. Call `POST /v1/runs/:id/cancel` to actually stop it.

**Resuming.** Reconnect with `Last-Event-ID` to replay events you missed. Events are retained for the run's lifetime plus one hour.

---

## Webhooks

Webhooks deliver events that happen outside a request — a run completing, a permission being requested. Use them instead of polling.

### Register an endpoint

`POST /v1/webhook_endpoints`

```bash
curl https://api.arble.ai/v1/webhook_endpoints \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/hooks/arble",
    "events": ["run.completed", "run.failed", "permission.requested"]
  }'
```

```json
{
  "id": "we_3Lm8Qvx",
  "object": "webhook_endpoint",
  "url": "https://api.example.com/hooks/arble",
  "events": ["run.completed", "run.failed", "permission.requested"],
  "secret": "whsec_9Ft2Wsm4Kp...",
  "status": "enabled"
}
```

The `secret` is returned once. Store it — you need it to verify signatures, and it can only be rotated, not read back.

Errors: `422 invalid_url` · `422 unknown_event`

### Verify signatures

Every delivery carries an `Arble-Signature` header:

```
Arble-Signature: t=1775050300,v1=5257a869e7bcd...
```

Verify by computing HMAC-SHA256 over `{timestamp}.{raw_body}` with your endpoint secret, comparing in constant time, and rejecting timestamps older than five minutes.

```python
import hmac, hashlib, time

def verify(raw_body: bytes, header: str, secret: str) -> bool:
    parts = dict(p.split("=", 1) for p in header.split(","))
    if abs(time.time() - int(parts["t"])) > 300:
        return False
    expected = hmac.new(
        secret.encode(),
        f"{parts['t']}.".encode() + raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, parts["v1"])
```

Verify against the **raw** body. Parsing to JSON and re-serializing changes the bytes and the signature will never match.

### Delivery and retries

Respond `2xx` within 10 seconds. Anything else is a failure and is retried with exponential backoff over 24 hours: after 10s, 1m, 5m, 30m, 2h, 6h, then hourly. An endpoint failing for 24 consecutive hours is disabled and a `webhook.disabled` event is sent to your other endpoints.

Deliveries can arrive out of order and more than once. Use the event `id` for idempotency and `created_at` for ordering — not arrival time.

Errors: `404 webhook_endpoint_not_found`

---

## Events

Every event shares one envelope:

```json
{
  "id": "evt_8Vn3Kqt",
  "object": "event",
  "type": "run.completed",
  "created_at": 1775050300,
  "data": {
    "id": "run_2Kd8vQx",
    "object": "run",
    "status": "completed",
    "session": "ses_8kQ2mVx"
  }
}
```

`data` holds the full object the event concerns, in the same shape the corresponding `GET` returns.

| Event | Fires when |
|---|---|
| `run.started` | A run leaves `queued` and begins executing |
| `run.completed` | A run finishes successfully |
| `run.failed` | A run terminates with an error |
| `permission.requested` | A run needs approval and entered `requires_action` |
| `permission.granted` | A permission request was approved |
| `memory.updated` | An entry was inserted, changed or deleted |
| `tool.executed` | A tool call completed, successfully or not |
| `session.closed` | A session was archived or deleted |
| `connector.connected` | A connector finished authenticating |
| `connector.disconnected` | A connector was removed or its token expired |

`GET /v1/events` lists past events for replay and reconciliation, filterable by `type` and `created_after`. Events are retained 30 days.

`permission.requested` is the one to wire up first if you run agents unattended — without a handler, those runs sit in `requires_action` until they expire.

---

## Pagination

List endpoints are cursor-paginated. Cursors are opaque and stable: an object inserted mid-iteration won't shift a page or cause a duplicate.

| Parameter | Notes |
|---|---|
| `limit` | 1–100. Default 20. |
| `cursor` | From `next_cursor` on the previous page. |
| `order` | `asc` or `desc` by `created_at`. Default `desc`. |

```bash
curl "https://api.arble.ai/v1/runs?limit=50&cursor=cur_run_2Kd8vQx" \
  -H "Authorization: Bearer $ARBLE_API_KEY"
```

Every list response has the same envelope:

```json
{
  "object": "list",
  "data": [],
  "has_more": false,
  "next_cursor": null
}
```

Iterate until `has_more` is `false`. Don't stop when `data` is shorter than `limit` — filtered pages can come back partially full with more results behind them. Don't construct cursors yourself; the format is not part of the contract.

Errors: `400 invalid_cursor` · `400 limit_out_of_range`

---

## Filtering

List endpoints accept filters as query parameters, combined with AND.

| Filter | Applies to | Example |
|---|---|---|
| `status` | Runs, workflow runs, sessions | `status=failed` |
| `project` | All resources | `project=prj_4mNp` |
| `session` | Runs, messages | `session=ses_8kQ2mVx` |
| `agent` | Runs | `agent=agt_5wTn9Kd` |
| `created_after` | All resources | `created_after=1775049600` |
| `created_before` | All resources | `created_before=1775136000` |
| `metadata[key]` | Resources with metadata | `metadata[env]=staging` |

```bash
curl "https://api.arble.ai/v1/runs?agent=agt_5wTn9Kd&status=failed&created_after=1775049600" \
  -H "Authorization: Bearer $ARBLE_API_KEY"
```

`status` accepts a comma-separated list — `status=failed,expired` — which is an OR within that one filter. Timestamps are Unix seconds, always UTC.

Filtering on `metadata` is how you correlate Arble objects with records in your own system. Set `metadata` at creation to your primary key, then filter by it later.

Errors: `400 invalid_filter` · `422 unknown_filter_field`

---

## Rate limits

Limits are per token, applied on a sliding window. Concurrency is counted separately from request rate.

| Limit | Default |
|---|---|
| Requests | 1,000 per minute |
| Burst | 100 per second |
| Concurrent runs | 25 |
| Concurrent streams | 50 |

Every response carries the current state:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 947
X-RateLimit-Reset: 1775050360
```

Exceeding a limit returns `429` with `Retry-After` in seconds:

```json
{
  "error": {
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded",
    "message": "Request rate limit exceeded. Retry after 12 seconds.",
    "request_id": "req_5Kp2Nvx"
  }
}
```

Exceeding *concurrency* is a different error — `concurrency_limit_exceeded` — and retrying immediately won't help. Wait for a run to finish, or queue work yourself.

Back off on `429` rather than retrying tightly; a client that retries without backoff will stay rate-limited. Read `X-RateLimit-Remaining` and slow down before you hit zero.

---

## Errors

Image placeholder · 16:9
A dark render of a single translucent glass card centered in frame, containing a formatted JSON error object with its keys visibly aligned and one line — the `code` field — subtly emphasized in a lighter tone. Behind the card, three dimmed duplicate cards recede in perspective, suggesting a class of errors rather than one instance. Restrained, monochrome, no red or alarm coloring.

Every error uses the same shape, whatever the status code:

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "parameter_missing",
    "message": "Missing required parameter: input.",
    "param": "input",
    "request_id": "req_5Kp2Nvx"
  }
}
```

Branch on `code`, not `message`. Messages are written for humans and change without notice; codes are part of the contract.

| Status | Type | Meaning |
|---|---|---|
| `400` | `invalid_request_error` | Malformed request — bad JSON, missing parameter |
| `401` | `authentication_error` | Missing, malformed or revoked token |
| `403` | `permission_error` | Authenticated but not permitted |
| `404` | `not_found_error` | No such object, or not visible to this token |
| `409` | `conflict_error` | Object state forbids the operation |
| `422` | `validation_error` | Well-formed but semantically invalid |
| `429` | `rate_limit_error` | Rate or concurrency limit exceeded |
| `500` | `api_error` | Server-side fault. Safe to retry |
| `503` | `service_unavailable` | Temporarily unavailable. Retry with backoff |
| `504` | `timeout_error` | Upstream tool or model timed out |

Validation errors list every problem at once, rather than failing on the first:

```json
{
  "error": {
    "type": "validation_error",
    "code": "invalid_parameters",
    "message": "2 parameters are invalid.",
    "errors": [
      {"param": "timeout", "code": "out_of_range", "message": "Must be between 1 and 3600."},
      {"param": "tools[1]", "code": "unknown_tool", "message": "No tool named 'github.merge'."}
    ],
    "request_id": "req_5Kp2Nvx"
  }
}
```

The distinction worth encoding in your client: `403 permission_error` means a grant is missing and retrying is pointless — surface it. `500` and `503` are transient — retry them.

Every response includes `request_id`, in the body on errors and in the `Arble-Request-Id` header always. Log it; it's the first thing support will ask for.

---

## SDKs

Official libraries wrap authentication, retries with backoff, pagination and SSE parsing. They're generated from the same [OpenAPI](#openapi) spec, so coverage is identical.

| Language | Package |
|---|---|
| Python | `pip install arble` |
| TypeScript | `pnpm add arble` |
| Go | `go get github.com/arble-ai/arble-go` |
| Rust | `cargo add arble` |
| Swift | Swift Package Manager |
| Kotlin | `com.arble:arble-kotlin` |

```python
from arble import Arble

client = Arble()  # reads ARBLE_API_KEY

run = client.runs.create(
    agent="agt_5wTn9Kd",
    input="Summarize the open pull requests",
)

for event in client.runs.stream(run.id):
    if event.type == "message.delta":
        print(event.delta, end="", flush=True)
```

```typescript
import Arble from "arble";

const client = new Arble();

const stream = await client.runs.create({
  agent: "agt_5wTn9Kd",
  input: "Summarize the open pull requests",
  stream: true,
});

for await (const event of stream) {
  if (event.type === "message.delta") process.stdout.write(event.delta);
}
```

Iterating a list in any SDK paginates automatically — there's no cursor handling to write:

```python
for run in client.runs.list(status="failed"):
    print(run.id, run.last_error.code)
```

---

## Versioning

The API is versioned by date. Your account is pinned to the version current when you created it, and that version's behavior does not change.

```bash
curl https://api.arble.ai/v1/runs \
  -H "Authorization: Bearer $ARBLE_API_KEY" \
  -H "Arble-Version: 2026-04-15"
```

The `/v1` path segment denotes the API generation and changes only for a wholesale redesign. Dated versions carry the actual breaking changes.

Additive changes — a new field, a new endpoint, a new event type or enum value — ship to every version without notice. Treat unknown fields and unrecognized enum values as forward-compatible; a client that rejects them will break on a routine release.

Breaking changes only ever arrive in a new dated version. Deprecated versions are supported at least 12 months, and requests to one return a `Arble-Deprecation` header with the sunset date. To migrate, set `Arble-Version` explicitly, test, then move your account default.

---

## OpenAPI

The complete specification is published and versioned alongside the API:

```bash
curl https://api.arble.ai/v1/openapi.json
```

It's OpenAPI 3.1, covers every endpoint and schema on this page, and is the source the SDKs are generated from — so it's exact rather than approximate. Use it to generate a client for a language without an official SDK:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i https://api.arble.ai/v1/openapi.json \
  -g ruby -o ./arble-ruby
```

A Postman collection is available at `https://api.arble.ai/v1/postman.json`, and the spec renders as browsable Swagger UI at `https://api.arble.ai/docs`. Pin the spec to a dated version with `?version=2026-04-15` when generating a client you intend to keep.

---

## Security

**HTTPS and TLS.** TLS 1.2 or higher, required. Plain HTTP requests are rejected, not redirected — a redirect would leak the token in transit. HSTS is enforced.

**Encryption.** Data is encrypted in transit and at rest. Credentials and secrets are encrypted with per-project keys and never returned by any endpoint after creation.

**Authentication.** Bearer tokens only, scoped as narrowly as the integration allows. Tokens are hashed at rest; a leaked key can be revoked but never recovered.

**Permissions.** Authentication and authorization are separate. A valid token gets you into the API; a permission grant gets a tool call executed. Neither implies the other.

**Audit logs.** Every request and tool call is recorded with its token, arguments, permission decision and outcome, queryable through `GET /v1/audit_logs` and retained 90 days.

**Least privilege.** Use project tokens over organization tokens, scope permissions to specific hosts and paths, and mint short-lived session tokens for anything client-side.

Secrets sent to the API — in tool arguments, memory entries or metadata — are redacted from logs and traces on a best-effort basis. Don't rely on that: never put a credential in a field whose purpose isn't credentials.

---

## Best practices

1. Use project-scoped tokens in deployed services; reserve personal tokens for local development.
2. Never ship a long-lived key to a browser or mobile client — mint a session token server-side.
3. Send an `Idempotency-Key` on every `POST` that creates something, not just retries.
4. Pin `Arble-Version` explicitly rather than relying on the account default.
5. Branch on `error.code`, never on `error.message`.
6. Retry only `429`, `500`, `502`, `503` and `504`, with exponential backoff and jitter.
7. Treat `403` as terminal and surface it — a missing grant won't resolve on retry.
8. Prefer webhooks to polling; poll only to reconcile after a missed delivery.
9. Verify webhook signatures against the raw request body, in constant time.
10. Deduplicate webhooks by event `id` and order by `created_at`, not arrival time.
11. Handle `permission.requested` before running agents unattended, or those runs will expire.
12. Never assume a closed stream means success — reconcile with `GET /v1/runs/:id`.
13. Call `POST /v1/runs/:id/cancel` to stop a run; closing the connection doesn't.
14. Iterate lists until `has_more` is `false`, not until a page is short.
15. Set `metadata` to your own primary key at creation so you can correlate later.
16. Ignore unknown fields and unrecognized enum values so additive changes don't break you.
17. Write memory entries as durable facts; use session exports for what happened once.
18. Scope permissions to specific hosts and paths — `network.http:api.github.com`, not bare `network.http`.
19. Log `request_id` on every failure; it's what support needs to trace a request.
20. Keep client timeouts at 30 seconds and let long work be asynchronous, as designed.

---

## Reference

- [Authentication](#authentication) — token types, rotation, revocation
- [Agents](#agents) — create, list, retrieve, update, delete
- [Runs](#runs) — lifecycle, cancel, retry, stream
- [Sessions](#sessions) — lifecycle, export
- [Messages](#messages) — send, list, attachments
- [Memory](#memory) — search, insert, summarize, export
- [Tools](#tools) — list, metadata, direct execution
- [Files](#files) — upload, download, resumable uploads
- [Permissions](#permissions) — grants, requests, policy
- [Streaming](#streaming) — SSE event types, heartbeats, resume
- [Webhooks](#webhooks) — registration, signatures, retries
- [Errors](#errors) — status codes, error types, validation
- [SDKs](#sdks) — official libraries and examples

---

## FAQ

**Do I need the desktop app to use the API?**
No. The app and the API are clients of the same runtime. The only endpoints that need a paired machine are [Desktop](#desktop) and [Mobile](#mobile), which act on a specific device by definition.

**Is a run synchronous or asynchronous?**
Asynchronous. `POST /v1/runs` returns immediately with `status: "queued"`. Stream it, poll it, or take a `run.completed` webhook — streaming is the lowest-latency option.

**Should I use streaming or webhooks?**
Streaming when a user is waiting on output. Webhooks for anything unattended. They're complementary, not alternatives — many integrations use both.

**What happens if my stream disconnects mid-run?**
The run keeps executing. Reconnect with `Last-Event-ID` to replay missed events, or fetch the run to get its final state. A dropped connection is never a cancellation.

**How do I handle a permission request from a server with no UI?**
Either pre-grant the capability with `level: "always_allow"` so runs never pause, or subscribe to `permission.requested` and approve programmatically. Runs left in `requires_action` expire after 15 minutes.

**Why did a tool call return 403 instead of prompting me?**
Interactive approval requires a client that can prompt. A bare HTTP request has nowhere to show a dialog, so an ungranted capability fails closed. Grant it explicitly.

**Can two runs share a session safely?**
Yes, but they see each other's messages, which is usually what you want in a conversation and rarely what you want for parallel independent tasks. Use separate sessions for fan-out.

**Does deleting a session delete what it wrote to memory?**
No. Memory is project-scoped and outlives sessions deliberately. Delete memory entries explicitly.

**How do I test without touching production data?**
Use the sandbox base URL. It's a full instance with separate data. Note that it defaults to a smaller model, so verify latency-sensitive behavior in production.

**Are timestamps UTC?**
Always. Every timestamp in every response is Unix seconds in UTC. There is no timezone parameter.

**What's the difference between 409 and 422?**
`409` means the request is valid but the object's current state forbids it — cancelling a completed run. `422` means the request itself is semantically wrong — a `timeout` of 5000, or a tool that doesn't exist.

**How long are objects retained?**
Runs and messages for the life of their session. Events 30 days, audit logs 90 days, idempotency keys 24 hours. Memory and files persist until deleted.

---

**Previous:** [CLI](cli.md) · **Next:** [Self-hosting](#)
