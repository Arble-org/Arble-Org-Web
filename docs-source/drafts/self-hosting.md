# Self-hosting

*Infrastructure / Self-hosting*

Image placeholder · 16:9
A premium Apple-keynote render, predominantly white and monochrome: a central matte-white monolithic slab labeled with a minimal Arble mark sits inside a faintly luminous rectangular boundary suggesting a private network perimeter. Arranged around it on layered translucent glass panels are grouped hardware forms — a rack of GPU servers on the left, stacked storage modules below, small labeled model containers to the right, a cluster of MCP server tiles, and three user devices (laptop, phone, desktop) at the outer edge. All connections are thin grey lines that terminate at the boundary; none cross it. Industrial-design lighting, soft shadows, no color accents.

## Run Arble. On infrastructure you own.

Arble is designed to run entirely inside your environment. No component requires a managed cloud, and no telemetry leaves the perimeter unless you configure it to.

You choose where compute, storage, models and memory live. The same binaries run on a laptop and on a multi-node cluster — the difference is configuration, not a separate product edition.

| Deployment | Typical use |
|---|---|
| Desktop | One user, local models, no shared state |
| Single server | Small team, one VM, all services co-located |
| Workstation | One user with a local GPU |
| GPU server | Shared inference for a team |
| Docker | Single-host container deployment |
| Docker Compose | Single host, full stack with dependencies |
| Kubernetes | Multi-node, HA, autoscaling |
| Bare metal | Maximum control over hardware and isolation |
| Private cloud | OpenStack, VMware, Nutanix |
| Public cloud | EKS, GKE, AKS, or plain VMs |
| Hybrid cloud | Control plane on-prem, inference burst to cloud |
| Air-gapped | No egress. Mirrored images, local models only |

---

## On this page

- [Architecture](#architecture)
- [Deployment options](#deployment-options)
- [System requirements](#system-requirements)
- [Docker](#docker)
- [Kubernetes](#kubernetes)
- [Models](#models)
- [Storage](#storage)
- [Memory](#memory)
- [Networking](#networking)
- [Authentication](#authentication)
- [Secrets](#secrets)
- [Scaling](#scaling)
- [High availability](#high-availability)
- [Monitoring](#monitoring)
- [Security](#security)
- [Backups](#backups)
- [Disaster recovery](#disaster-recovery)
- [Updating](#updating)
- [Troubleshooting](#troubleshooting)
- [Best practices](#best-practices)
- [Reference](#reference)
- [FAQ](#faq)

---

## Architecture

Image placeholder · 16:9
A clean vertical architecture diagram on a white background, rendered as stacked horizontal glass bands connected by thin downward arrows. From top: a row of user device icons; an API Gateway band; an Arble Runtime band; then a Planner band; then three parallel bands side by side — Memory, Tool Registry — with the registry fanning into two sub-bands, Built-in Tools and MCP Servers; then an LLMs band showing three small model tiles; and a Storage band at the base showing a database cylinder, a cache cylinder and an object-store cube. Labels in a light monospace. Monochrome, precise, technical.

Arble separates into four planes: a stateless request plane, a stateful orchestration plane, an execution plane that needs isolation, and the data plane. Understanding which is which tells you what to scale and what to protect.

**API Gateway** terminates TLS, authenticates every request, and enforces rate limits before anything reaches the runtime. It is stateless and the only component that needs ingress. Run at least two replicas.

**Arble Runtime** owns sessions and runs. It accepts work, tracks run state, and coordinates the planner and workers. State lives in Postgres, so the runtime itself is horizontally scalable.

**Planner** decides which tool to call for a given step. It reads the tool registry and the session context, calls a model, and emits a tool call. It is CPU-light and latency-bound on the model, not on itself.

**Memory** stores durable per-project facts and serves semantic search. It owns embedding generation and the vector index. This is the component that benefits most from a GPU if you embed locally.

**Tool Registry** is the single index of every callable capability, regardless of origin. The planner sees built-in tools, Tool SDK tools, MCP tools and connector tools identically — one schema shape, one permission model.

**Built-in Tools** — filesystem, terminal, HTTP, browser — execute inside a sandboxed worker, never in the runtime process. A tool that escapes its sandbox must not land in a process holding database credentials.

**MCP Servers** run as separate processes or Pods. Remote servers are reached over HTTPS; local `stdio` servers are spawned per-worker, which is why `stdio` requires a self-hosted deployment.

**LLMs** are external to Arble. The runtime speaks an OpenAI-compatible protocol to whatever you point it at — local vLLM, Ollama, or a hosted provider. Arble does not embed a model.

**Storage** is Postgres for control-plane state, Redis for queues and coordination, and an S3-compatible object store for files. Each is a standard component you likely already operate.

### Component summary

| Component | Stateless | Scales on | Needs GPU |
|---|---|---|---|
| `arble-gateway` | Yes | Request rate | No |
| `arble-runtime` | Yes | Concurrent runs | No |
| `arble-worker` | Yes | Tool call volume | No |
| `arble-memory` | No (owns index) | Embedding volume | Optional |
| Postgres | No | Write throughput | No |
| Redis | No | Queue depth | No |
| Object store | No | Data volume | No |
| Model backend | Yes | Token throughput | Yes, for local models |

The common sizing mistake is provisioning GPUs for Arble. Arble itself is a CPU workload. GPUs serve inference and, optionally, embeddings — if your models are remote, you need no GPU at all.

---

## Deployment options

Pick the smallest topology that meets your availability requirement. Every option below runs the same images.

| Option | Nodes | HA | Best for |
|---|---|---|---|
| Desktop | 1 | No | Individual use, local models |
| Single machine | 1 | No | Evaluation, small teams |
| Docker | 1 | No | One service, existing Postgres |
| Docker Compose | 1 | No | Full stack on one host |
| Virtual machine | 1–2 | Partial | Regulated environments with VM-only policy |
| Bare metal | 1–n | Yes | Strict isolation, predictable latency |
| Cloud VM | 1–n | Yes | Fastest path with managed Postgres |
| Kubernetes | 3+ | Yes | Autoscaling, rolling updates, multi-tenant |
| Enterprise cluster | 6+ | Yes | Multi-region, GPU pools, SSO |

**Desktop and workstation** run a single daemon with SQLite and no gateway. There is no cluster to operate — this is what the desktop app installs.

**Docker Compose** is the right default for a team evaluation. One host, real Postgres and Redis, and a config file you can lift into Kubernetes later without rewriting.

**Kubernetes** is the right default for production. You get rolling updates, health-checked replicas and autoscaling without building them yourself.

**Bare metal** matters when you need hardware-level isolation for tool sandboxes, or when GPU passthrough through a hypervisor is unacceptable.

Avoid single-node Kubernetes as a production target. It adds operational surface without adding availability — Docker Compose is simpler and fails in more predictable ways.

---

## System requirements

Sizing below excludes model inference. Add GPU capacity separately per [Models](#models).

| | Minimum | Recommended | Enterprise |
|---|---|---|---|
| CPU | 4 vCPU | 8 vCPU | 16+ vCPU per node, 3+ nodes |
| RAM | 8 GB | 32 GB | 64 GB per node |
| Storage | 40 GB SSD | 250 GB NVMe | 1 TB NVMe + object store |
| GPU | None | 1 × 24 GB | 2+ × 80 GB, pooled |
| Network | 100 Mbps | 1 Gbps | 10 Gbps, redundant |
| OS | Linux 5.15+ | Linux 5.15+ | Linux 5.15+ |
| Postgres | 14 | 16 | 16, HA with replicas |
| Redis | 6.2 | 7.2 | 7.2, Sentinel or Cluster |

**Operating systems.** Ubuntu 22.04 LTS and 24.04, Debian 12, RHEL 9 and derivatives are tested. macOS 14+ is supported for desktop and workstation only. Windows is supported through WSL2 for development, not production.

**Kernel requirements.** Tool sandboxing uses cgroups v2, user namespaces and seccomp. A kernel older than 5.15, or one with user namespaces disabled, falls back to weaker isolation and logs a warning at startup.

**Storage characteristics.** Postgres is latency-sensitive on writes; put it on NVMe or provisioned IOPS. Object storage is throughput-sensitive, not latency-sensitive — network storage is fine.

Plan roughly 2 GB of Postgres per 10,000 runs retained, and size the object store for files and screenshots, which dominate volume.

---

## Docker

Image placeholder · 16:9
A technical illustration on white: a central rounded container block labeled "arble-runtime" with three labeled volume cylinders attached beneath it by short connectors (config, data, cache). To the right, three smaller identical container blocks labeled as MCP servers connect to the central block over a thin bracket labeled with a Docker network name. Ports are shown as small numbered tabs on the container's left edge. Flat, precise, monochrome, no perspective.

Single-host Docker is the fastest way to a working deployment. Use it for evaluation, or for production where one host is an acceptable failure domain.

### Installation

Images are published to GitHub Container Registry, tagged by exact version. Pin the patch version in production — `latest` is for local experiments only.

```bash
docker pull ghcr.io/arble-ai/runtime:1.8.2
docker pull ghcr.io/arble-ai/gateway:1.8.2
```

### Volumes

Three paths must persist. Everything else in the container is disposable.

| Path | Contents | Backed up |
|---|---|---|
| `/var/lib/arble/data` | SQLite (single-node), memory index | Yes |
| `/var/lib/arble/config` | `arble.yaml`, TLS material | Yes, in version control |
| `/var/cache/arble` | Model and embedding cache | No, rebuildable |

Never bind-mount the Docker socket into a worker. A tool with socket access can start a privileged container and leave the sandbox entirely.

### Ports

| Port | Protocol | Purpose |
|---|---|---|
| `8443` | HTTPS | API and CLI traffic. The only port to expose |
| `8080` | HTTP | Internal only. Redirects to TLS when enabled |
| `9090` | HTTP | Prometheus metrics. Never expose publicly |
| `7070` | gRPC | Runtime-to-worker. Internal network only |

### Configuration

Configuration is a YAML file, overridable by environment variables. Environment wins, which is what makes one image work across environments.

```yaml
# /var/lib/arble/config/arble.yaml
server:
  bind: 0.0.0.0:8443
  external_url: https://arble.internal.example.com

database:
  url: postgres://arble@postgres:5432/arble
  max_connections: 40

redis:
  url: redis://redis:6379/0

storage:
  backend: s3
  endpoint: https://minio.internal.example.com
  bucket: arble-files

models:
  default: local-qwen
  providers:
    - name: local-qwen
      kind: openai_compatible
      base_url: http://vllm:8000/v1

telemetry:
  metrics: true
  otlp_endpoint: http://otel-collector:4317
```

### Docker Compose

This stack is production-shaped on one host: real Postgres, real Redis, separated worker, no host networking.

```yaml
services:
  gateway:
    image: ghcr.io/arble-ai/gateway:1.8.2
    ports: ["8443:8443"]
    environment:
      ARBLE_RUNTIME_URL: http://runtime:8080
      ARBLE_TLS_CERT: /etc/arble/tls/tls.crt
      ARBLE_TLS_KEY: /etc/arble/tls/tls.key
    volumes:
      - ./tls:/etc/arble/tls:ro
    depends_on: [runtime]
    restart: unless-stopped

  runtime:
    image: ghcr.io/arble-ai/runtime:1.8.2
    environment:
      ARBLE_DATABASE_URL: postgres://arble:${PG_PASSWORD}@postgres:5432/arble
      ARBLE_REDIS_URL: redis://redis:6379/0
      ARBLE_WORKER_URL: grpc://worker:7070
    volumes:
      - arble-config:/var/lib/arble/config
    depends_on:
      postgres: {condition: service_healthy}
      redis: {condition: service_started}
    restart: unless-stopped

  worker:
    image: ghcr.io/arble-ai/worker:1.8.2
    # Sandboxing needs these; it does NOT need privileged.
    security_opt: ["seccomp=./seccomp-arble.json"]
    cap_drop: ["ALL"]
    cap_add: ["SYS_ADMIN"]
    tmpfs: ["/tmp:size=2g"]
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: arble
      POSTGRES_PASSWORD: ${PG_PASSWORD}
      POSTGRES_DB: arble
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U arble"]
      interval: 10s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7.2
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redisdata:/data
    restart: unless-stopped

volumes:
  arble-config:
  pgdata:
  redisdata:
```

Run migrations before starting the stack for the first time, and before every upgrade:

```bash
docker compose run --rm runtime arble server migrate
docker compose up -d
```

### Networking and MCP containers

Compose puts every service on one bridge network, so only the gateway needs a published port. Local MCP servers join the same network and are reachable by service name:

```yaml
  mcp-postgres:
    image: ghcr.io/arble-ai/mcp-postgres:1.2.0
    environment:
      DATABASE_URL: postgres://readonly@warehouse:5432/analytics
    restart: unless-stopped
```

Register it against the internal hostname, not localhost:

```bash
docker compose exec runtime \
  arble mcp add postgres --url http://mcp-postgres:8080/mcp
```

---

## Kubernetes

Image placeholder · 16:9
A Kubernetes architecture diagram on white: an outer dashed rectangle labeled as a namespace. Inside, from top, an Ingress block, a Service block below it, then a row of three identical Pod blocks labeled as runtime replicas. To the right, a separate labeled node pool rectangle containing two Pod blocks with small GPU chip glyphs. Beneath the Pods, two PersistentVolumeClaim cylinders and a Secret block shown as a small keyed rectangle. Thin connecting lines, flat monochrome, standard Kubernetes iconography.

Kubernetes is the recommended production target. The Helm chart is the supported installation path; raw manifests are shown to explain what the chart produces.

### Namespace and installation

```bash
kubectl create namespace arble
helm install arble oci://ghcr.io/arble-ai/charts/arble \
  --version 1.8.2 \
  --namespace arble \
  --values values.yaml
```

```yaml
# values.yaml
gateway:
  replicaCount: 3
  ingress:
    enabled: true
    className: nginx
    host: arble.internal.example.com
    tls:
      secretName: arble-tls

runtime:
  replicaCount: 3
  resources:
    requests: {cpu: "2", memory: 4Gi}
    limits: {cpu: "4", memory: 8Gi}

worker:
  replicaCount: 6
  resources:
    requests: {cpu: "1", memory: 2Gi}
    limits: {cpu: "2", memory: 4Gi}

memory:
  persistence:
    size: 100Gi
    storageClass: fast-nvme

postgres:
  # Point at managed Postgres in production rather than running it in-cluster.
  external: true
  existingSecret: arble-postgres

models:
  default: local-qwen
  providers:
    - name: local-qwen
      kind: openai_compatible
      base_url: http://vllm.models.svc.cluster.local:8000/v1
```

### Deployment

The runtime is stateless, which is what makes rolling updates safe. Note the probes — they are what make a rollout non-disruptive.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: arble-runtime
  namespace: arble
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels: {app: arble-runtime}
  template:
    metadata:
      labels: {app: arble-runtime}
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        fsGroup: 10001
      containers:
        - name: runtime
          image: ghcr.io/arble-ai/runtime:1.8.2
          ports:
            - {containerPort: 8080, name: http}
            - {containerPort: 9090, name: metrics}
          env:
            - name: ARBLE_DATABASE_URL
              valueFrom:
                secretKeyRef: {name: arble-postgres, key: url}
            - name: ARBLE_REDIS_URL
              valueFrom:
                secretKeyRef: {name: arble-redis, key: url}
          livenessProbe:
            httpGet: {path: /healthz, port: 8080}
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet: {path: /readyz, port: 8080}
            periodSeconds: 5
          # Runs can be long. Give in-flight work time to drain.
          lifecycle:
            preStop:
              exec: {command: ["arble", "server", "drain", "--timeout", "120s"]}
          resources:
            requests: {cpu: "2", memory: 4Gi}
            limits: {cpu: "4", memory: 8Gi}
      terminationGracePeriodSeconds: 150
```

`/healthz` reports process liveness only. `/readyz` additionally checks Postgres, Redis and the default model backend — a runtime that can't reach its database reports unready and stops receiving traffic instead of failing requests.

### Service and Ingress

```yaml
apiVersion: v1
kind: Service
metadata:
  name: arble-runtime
  namespace: arble
spec:
  selector: {app: arble-runtime}
  ports:
    - {name: http, port: 8080, targetPort: http}
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: arble
  namespace: arble
  annotations:
    # Streaming responses must not be buffered or cut off mid-run.
    nginx.ingress.kubernetes.io/proxy-buffering: "off"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
spec:
  ingressClassName: nginx
  tls:
    - hosts: [arble.internal.example.com]
      secretName: arble-tls
  rules:
    - host: arble.internal.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: arble-gateway
                port: {name: http}
```

Those two annotations are the most common cause of broken self-hosted deployments. Default proxy buffering breaks Server-Sent Events, and a 60-second read timeout kills long runs mid-execution.

### Persistent volumes

Only `arble-memory` needs a PersistentVolume. Use `ReadWriteOnce` on block storage — the vector index is not safe to share across Pods.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: arble-memory
  namespace: arble
spec:
  serviceName: arble-memory
  replicas: 1
  selector:
    matchLabels: {app: arble-memory}
  template:
    metadata:
      labels: {app: arble-memory}
    spec:
      containers:
        - name: memory
          image: ghcr.io/arble-ai/memory:1.8.2
          volumeMounts:
            - {name: index, mountPath: /var/lib/arble/index}
  volumeClaimTemplates:
    - metadata: {name: index}
      spec:
        accessModes: [ReadWriteOnce]
        storageClassName: fast-nvme
        resources: {requests: {storage: 100Gi}}
```

### Secrets

Never put credentials in a ConfigMap or a Helm values file committed to git. Reference existing Secrets, ideally projected from an external manager:

```bash
kubectl create secret generic arble-postgres \
  --namespace arble \
  --from-literal=url='postgres://arble:...@pg.internal:5432/arble'
```

### Autoscaling

Scale the runtime on concurrent runs, not CPU — a run waiting on a model uses almost no CPU while still consuming a slot.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: arble-runtime
  namespace: arble
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: arble-runtime
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Pods
      pods:
        metric: {name: arble_active_runs}
        target: {type: AverageValue, averageValue: "15"}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

Workers scale on queue depth (`arble_tool_queue_depth`). Both metrics are exported on `:9090` and require an adapter such as `prometheus-adapter`.

### Node pools

Separate pools by workload shape. Arble components are CPU workloads and should never be scheduled onto GPU nodes, where they waste expensive capacity.

```yaml
      nodeSelector:
        arble.ai/pool: runtime
      tolerations:
        - {key: arble.ai/dedicated, operator: Equal, value: runtime, effect: NoSchedule}
```

Taint GPU nodes for inference only, and let the model backend be the sole workload tolerating that taint.

### Rolling updates

`maxUnavailable: 0` with `maxSurge: 1` brings up a new Pod before removing an old one. Combined with the `preStop` drain hook and a `terminationGracePeriodSeconds` longer than the drain timeout, in-flight runs complete rather than failing.

Add a PodDisruptionBudget so node maintenance can't take the service down:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: arble-runtime
  namespace: arble
spec:
  minAvailable: 2
  selector:
    matchLabels: {app: arble-runtime}
```

---

## Models

Image placeholder · 16:9
An illustration on white: a central Arble runtime block on the left, connected by thin labeled lines to five model provider blocks stacked vertically on the right — each a rounded rectangle bearing a small distinguishing glyph and a label. Two of the lines are solid and three dashed, with a small legend indicating primary and fallback routing. Beneath the provider column, a horizontal bracket labeled with a GPU chip glyph spans the local providers only. Flat, monochrome, no perspective.

Arble does not ship a model. It speaks the OpenAI chat-completions protocol to whatever backend you configure, which is why local and hosted providers are interchangeable.

| Provider | Kind | Notes |
|---|---|---|
| Ollama | `ollama` | Simplest local option. Good for desktop and evaluation |
| LM Studio | `openai_compatible` | Desktop GUI, useful for local experimentation |
| vLLM | `openai_compatible` | Recommended for production local serving. High throughput |
| SGLang | `openai_compatible` | Strong on structured output and prefix caching |
| OpenAI-compatible | `openai_compatible` | Any gateway exposing `/v1/chat/completions` |
| Anthropic | `anthropic` | Hosted. Requires egress |
| Gemini | `gemini` | Hosted. Requires egress |
| OpenRouter | `openai_compatible` | Hosted aggregator across many models |
| Custom | `openai_compatible` | Your own inference service |

### Configuration

```yaml
models:
  default: local-qwen
  embedding: local-embed
  providers:
    - name: local-qwen
      kind: openai_compatible
      base_url: http://vllm.models.svc.cluster.local:8000/v1
      model: Qwen3-32B-Instruct
      max_concurrency: 32

    - name: local-embed
      kind: openai_compatible
      base_url: http://tei.models.svc.cluster.local:8080/v1
      model: bge-large-en-v1.5

    - name: anthropic-fallback
      kind: anthropic
      api_key_secret: arble-anthropic
      model: claude-sonnet-4-5
```

### Routing

Route by task class rather than pinning one model everywhere. Planning benefits from a stronger model; summarization and memory compaction do not.

```yaml
models:
  routes:
    planner: local-qwen
    summarizer: local-qwen-8b
    embedding: local-embed
```

### Fallback

A fallback chain is evaluated in order on connection failure, `5xx`, or timeout. It is not evaluated on a `4xx` — a malformed request will fail the same way everywhere.

```yaml
models:
  routes:
    planner:
      primary: local-qwen
      fallback: [local-qwen-8b, anthropic-fallback]
      timeout: 60s
```

In air-gapped deployments, omit hosted providers entirely. A configured-but-unreachable provider adds a timeout to every failure path for no benefit.

### Load balancing

For multiple replicas of one model, put a Service or load balancer in front and give Arble a single `base_url`. Arble does not implement inference-aware load balancing, and a naive round-robin in front of vLLM will degrade prefix-cache hit rates.

Set `max_concurrency` to match what the backend can serve. Arble queues beyond it rather than overwhelming the GPU and triggering timeouts across every in-flight run.

---

## Storage

Four storage systems, each with a distinct role. Only Postgres and the object store hold data you cannot rebuild.

| System | Holds | Loss impact |
|---|---|---|
| Postgres | Sessions, runs, permissions, audit log, memory metadata | Total. Back up |
| Object store | Files, screenshots, session exports | Permanent data loss. Back up |
| Redis | Queues, run scheduling, leader election, cache | Recoverable. In-flight runs fail |
| Vector index | Memory embeddings | Rebuildable from Postgres |

**SQLite** is the default for desktop and single-node deployments. It is genuinely production-capable for one node and one process, and unsuitable for anything with multiple runtime replicas. Migrate before you scale out, not during.

**PostgreSQL** 14+ is required for multi-node. Use 16, and enable `pgvector` if you want the vector index in Postgres rather than a separate service:

```yaml
database:
  url: postgres://arble@pg.internal:5432/arble
  max_connections: 40
  vector_backend: pgvector
```

Size the connection pool as `max_connections × runtime replicas` and check it against the server's limit. Exhausting Postgres connections is the most common cause of a cluster-wide stall.

**Object storage** is any S3-compatible endpoint — AWS S3, MinIO, Ceph RGW, Cloudflare R2. Enable object versioning; it turns an accidental deletion into a recoverable event.

**Redis** 6.2+ handles queues and coordination. Enable AOF persistence so a restart doesn't drop queued work. Use Sentinel or Cluster for HA.

### Retention

Retention is configured per data class. Defaults are conservative; tighten them to match your compliance posture.

```yaml
retention:
  runs: 90d
  messages: 90d
  audit_log: 365d
  events: 30d
  files: 180d
  memory: indefinite
```

A nightly job enforces retention and vacuums reclaimed space. Audit log retention should meet or exceed your longest compliance window — it is the record you will be asked for.

---

## Memory

Memory is what makes an agent useful on the second run. It is also the component with the most sensitive contents, since it accumulates facts about your systems over time.

**Short-term** memory is session context: messages and tool results in the current conversation. It lives in Postgres, is bounded by the model's context window, and is discarded when the session is deleted.

**Long-term** memory is durable per-project facts, deliberately written and semantically retrieved. It outlives sessions by design — deleting a session does not delete what it learned.

**Embeddings** are generated by the configured embedding model and stored in the vector index. Changing embedding models requires a full reindex, since vectors from different models are not comparable:

```bash
arble memory reindex --model local-embed-v2
```

**Compression** collapses related entries into fewer, denser ones. Run it on a schedule for long-lived projects — an unbounded memory costs context on every single run.

```bash
arble memory summarize --older-than 90d
```

**Retention** for memory defaults to indefinite, which is usually correct. Facts don't expire on a timer; prune them when they stop being true.

**Encryption** applies at rest through your storage layer, and Arble additionally encrypts memory contents with a project-scoped key before writing. A database dump does not yield readable memory without the key:

```yaml
memory:
  encryption:
    enabled: true
    key_source: vault
    vault_path: secret/arble/memory-key
```

Back up the encryption key separately from the database. A backup of encrypted memory with no key is not a backup.

---

## Networking

Image placeholder · 16:9
A network topology diagram on white: an outer rectangle labeled as a private network, containing an inner DMZ strip at the top holding a load balancer block and a reverse proxy block. Below, a larger application zone with three runtime blocks and a worker block. At the base, an isolated data zone with database and cache cylinders, separated by a labeled firewall line. Thin arrows show traffic flowing inward only, with one dashed outbound arrow from the application zone labeled as model egress. Standard network-diagram conventions, monochrome.

Arble needs exactly one inbound port. Everything else is internal, and treating it that way is most of your security posture.

**HTTPS and TLS.** TLS 1.2 minimum, 1.3 preferred. Terminate at the load balancer or ingress. Plain HTTP is rejected rather than redirected — a redirect leaks the bearer token in the first request.

```yaml
server:
  tls:
    min_version: "1.3"
    cert_file: /etc/arble/tls/tls.crt
    key_file: /etc/arble/tls/tls.key
```

**Reverse proxy.** Any proxy works, with two required settings: response buffering off, and a read timeout longer than your longest run. Both defaults are wrong for streaming.

```nginx
location / {
    proxy_pass http://arble-gateway:8080;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_read_timeout 3600s;
    proxy_set_header X-Forwarded-Proto https;
}
```

**Load balancer.** Runs are not pinned to a replica, so no session affinity is required. Health checks should target `/readyz`, not `/healthz` — the former knows whether dependencies are reachable.

**Internal networking.** Runtime-to-worker is gRPC on `7070`, and worker-to-anything-else should be denied by default. Workers execute tool code; they are the component most likely to be attacked.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: arble-worker-egress
  namespace: arble
spec:
  podSelector:
    matchLabels: {app: arble-worker}
  policyTypes: [Egress]
  egress:
    # DNS, and explicitly allowed destinations only.
    - to: [{namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: kube-system}}}]
      ports: [{protocol: UDP, port: 53}]
    - to: [{podSelector: {matchLabels: {app: vllm}}}]
      ports: [{protocol: TCP, port: 8000}]
```

**Private DNS.** Use internal names for every service-to-service hop, and make `external_url` match the certificate exactly. A mismatch breaks OAuth redirects and webhook signature verification in ways that are tedious to diagnose.

**Firewall.** Allow `443` inbound to the load balancer. Deny everything else inbound. Outbound egress should be an explicit allowlist — model endpoints, your registry, and any remote MCP servers you have approved.

**Air-gapped deployments.** Mirror images to an internal registry, use local models only, and disable telemetry and the connector directory. Arble runs with no egress; the CLI warns once at startup that update checks are unavailable.

```yaml
telemetry:
  enabled: false
registry:
  connector_directory: disabled
  mcp_registry: disabled
updates:
  check: false
```

---

## Authentication

Self-hosted Arble authenticates users through your identity provider and services through API keys. There is no separate Arble user directory to maintain.

**OIDC** is the recommended integration and works with Okta, Entra ID, Auth0, Keycloak and Google Workspace:

```yaml
auth:
  oidc:
    issuer: https://login.example.com
    client_id: arble-production
    client_secret_secret: arble-oidc
    redirect_url: https://arble.internal.example.com/auth/callback
    scopes: [openid, profile, email, groups]
```

**SAML** is available for providers without OIDC. It supports SP-initiated flow and signed assertions; IdP-initiated flow is not supported, since it can't carry the state parameter Arble uses to prevent login CSRF.

**LDAP** authenticates against Active Directory or OpenLDAP directly. Prefer OIDC where you have the option — LDAP requires Arble to handle credentials, which OIDC avoids entirely.

**Group mapping** drives authorization. Map IdP groups to Arble roles so access changes in one place:

```yaml
auth:
  role_mapping:
    "arble-admins": admin
    "platform-engineering": maintainer
    "engineering": member
```

**API keys** authenticate services, scoped to a project or organization. Prefer project scope — a leaked key then reaches one project's data, not everything.

**Service accounts** are non-human identities for CI and automation. They hold their own permission grants and appear in the audit log under their own name, which is what makes an unattended action attributable.

```bash
arble service-accounts create ci-pr-review \
  --project api-gateway \
  --permissions "network.http:api.github.com"
```

**Organizations** partition projects, users and billing. In self-hosted deployments most operators run one organization; use several when you need hard tenant separation with no shared memory or connectors.

---

## Secrets

Arble reads secrets from a configurable source and never writes them to disk in plaintext. Every value marked secret is redacted from logs, traces and audit entries.

**Environment variables** are acceptable for evaluation and single-host Docker. They are visible in `docker inspect` and in a process listing, so avoid them in production.

**HashiCorp Vault** is the recommended production source, with either token or Kubernetes auth:

```yaml
secrets:
  backend: vault
  vault:
    address: https://vault.internal.example.com
    auth_method: kubernetes
    role: arble
    mount: secret/arble
```

**Kubernetes Secrets** are the practical default in-cluster. Enable encryption at rest for etcd, or project from an external manager with the Secrets Store CSI driver — a plain Secret is base64, not encryption.

**Docker Secrets** work in Swarm, mounted at `/run/secrets`. In plain Docker Compose, use a read-only mounted file rather than an environment variable.

**Rotation** is non-disruptive when done in the right order. Create the new value, deploy it, verify, then revoke the old one:

```bash
arble api-keys create --name api-gateway-prod-2 --project api-gateway
# deploy, verify, then:
arble api-keys revoke key_8fRt2Ls
```

Rotate the memory encryption key with `arble memory rotate-key`, which re-encrypts in place. Do not rotate it by hand; a partially re-encrypted store is not recoverable without both keys.

---

## Scaling

Image placeholder · 16:9
An illustration on white showing horizontal growth: on the left, three identical Pod blocks in a row; a thin arrow labeled with a metric name points right, where six blocks now sit in the same row, the three newest rendered in a lighter tone to indicate they were just added. Below, a separate labeled GPU pool row remains fixed at two blocks, making clear that the two scale independently. Flat, monochrome, restrained.

Scale the plane that is actually saturated. Adding runtime replicas will not help if the bottleneck is GPU throughput, and it may make it worse.

| Symptom | Bottleneck | Action |
|---|---|---|
| Runs queued, low CPU | Runtime slots | Add runtime replicas |
| Tool calls queued | Worker capacity | Add worker replicas |
| High model latency | Inference | Add GPU capacity or a replica |
| Slow memory search | Vector index | Vertical scale, faster disk |
| Slow API, healthy runs | Gateway | Add gateway replicas |
| Everything slow | Postgres | Check connections, then IOPS |

**Horizontal scaling** applies to the gateway, runtime and workers — all stateless. This is the first lever for almost every capacity problem.

**Vertical scaling** applies to `arble-memory` and Postgres. The vector index is single-writer; give it more CPU, RAM and faster disk rather than more replicas.

**Queue workers** execute scheduled and triggered runs. Scale them on `arble_job_queue_depth`, separately from interactive traffic, so a nightly batch doesn't starve users.

**GPU pools** scale independently of Arble. Keep them tainted and dedicated, and size on tokens per second rather than request count — a long summarization consumes far more than a short planning step.

**Memory workers** handle embedding and compaction asynchronously. If memory writes lag behind runs, add memory workers before scaling the index.

**Session workers** maintain long-lived streaming connections. Each holds an open connection, so they are memory- and file-descriptor-bound rather than CPU-bound. Raise `ulimit -n` accordingly.

---

## High availability

HA means surviving the loss of one node without dropping requests. Three things must be true: no singleton on the request path, a failover story for state, and health checks that tell the truth.

**Multiple replicas.** Run 3+ gateway and runtime replicas across distinct nodes. Use anti-affinity so a single node failure can't take all of them:

```yaml
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchLabels: {app: arble-runtime}
              topologyKey: kubernetes.io/hostname
```

**Leader election.** Scheduled jobs, retention and migrations must run exactly once. Replicas elect a leader through Redis, and only the leader executes them — no cron sidecar or manual designation is required.

**Database failover.** Use managed Postgres with automated failover, or Patroni if self-managing. Arble reconnects with backoff and reports unready while the primary is unavailable; runs in flight fail and are retryable.

**Health checks.** `/healthz` for liveness, `/readyz` for readiness and load-balancer membership. Never point a liveness probe at `/readyz` — a brief database blip would restart every Pod simultaneously and turn a degradation into an outage.

**Automatic restart.** Kubernetes handles this through the liveness probe. On Docker, use `restart: unless-stopped`. On bare metal, a systemd unit with `Restart=always` and `RestartSec=5`.

`arble-memory` is the one singleton. A brief window where memory search is unavailable degrades run quality but does not fail runs — plan for restart, not for zero downtime, on that component.

---

## Monitoring

Image placeholder · 16:9
A dashboard illustration on white, organized as a grid of six panels: two line charts (labeled run latency and queue depth), one stacked area chart, two large single-number stat tiles, and one horizontal bar chart of tool call counts. Axes and gridlines are thin and light grey; series lines are dark monochrome with no color coding. Panel titles in small monospace. Reads as a real Grafana board, not a decorative graphic.

Every component exports Prometheus metrics on `:9090/metrics` and structured JSON logs on stdout.

### Metrics

```yaml
scrape_configs:
  - job_name: arble
    kubernetes_sd_configs:
      - {role: pod, namespaces: {names: [arble]}}
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: "arble-.*"
        action: keep
```

The metrics worth alerting on:

| Metric | Meaning | Alert when |
|---|---|---|
| `arble_active_runs` | Runs currently executing | Sustained near capacity |
| `arble_run_duration_seconds` | Run latency histogram | p95 above your SLO |
| `arble_runs_failed_total` | Failed runs by error type | Rate increase |
| `arble_tool_queue_depth` | Queued tool calls | Growing steadily |
| `arble_model_latency_seconds` | Backend latency by provider | p95 above 30s |
| `arble_model_errors_total` | Backend errors by provider | Any sustained rate |
| `arble_db_connections_in_use` | Pool utilization | Above 80% |
| `arble_permission_denials_total` | Denied tool calls | Spike, may indicate misconfig |

**Logs** are JSON with a `request_id`, `session_id`, `run_id` and `agent_id` on every line. Ship them with any collector; the fields are designed to correlate a user report to a run.

```json
{"ts":"2026-07-30T14:02:19Z","level":"info","msg":"tool call completed",
 "request_id":"req_5Kp2Nvx","run_id":"run_2Kd8vQx",
 "tool":"github.create_pull_request","decision":"approved","duration_ms":212}
```

**Tracing** uses OpenTelemetry. A trace spans the gateway, runtime, planner, each tool call and each model request — which is what tells you whether a slow run was the model or a tool.

```yaml
telemetry:
  otlp_endpoint: http://otel-collector.observability:4317
  sample_rate: 0.1
```

Sample at 10% in steady state. Trace volume scales with tool calls, not requests, and a single complex run can emit dozens of spans.

**Health endpoints.** `/healthz` liveness, `/readyz` readiness with dependency checks, `/version` build and migration state. All three are unauthenticated and safe to expose internally.

---

## Security

Arble executes model-generated tool calls against your systems. Treat the worker as hostile-adjacent and the permission gate as the control that matters.

**Encryption.** TLS 1.3 in transit. At rest, encryption comes from your storage layer, plus Arble's own project-scoped encryption for memory and credentials. Credentials are never returned by any API after creation.

**Permissions.** Every tool call passes the gate, whatever initiated it. Scope grants narrowly and set a deny-by-default policy so an unlisted capability fails closed:

```yaml
permissions:
  default: never_allow
  grants:
    - {capability: filesystem.read, scope: "/workspace"}
    - {capability: network.http, scope: "api.github.com"}
```

**Audit logs.** Every request, tool call, permission decision and configuration change is recorded immutably with its actor. Ship them off-host — an audit log an attacker can edit is not evidence.

**Sandbox.** Workers run unprivileged with cgroups v2, seccomp, a read-only root filesystem and no Docker socket. Verify at startup:

```bash
arble server verify-sandbox
```

**Network isolation.** Deny worker egress by default and allowlist explicitly. This is the single highest-value control: it bounds what a prompt-injected tool call can reach even when everything else fails.

**Least privilege.** Non-root containers, dropped capabilities, project-scoped tokens, read-only database users for analytics MCP servers. Give the platform the narrowest identity that works.

**Certificate management.** Use cert-manager in Kubernetes, or automate renewal. An expired internal certificate fails every request at once and is a genuinely common self-hosted outage.

**Secrets.** Never in ConfigMaps, images, values files or `arble.json`. See [Secrets](#secrets).

Content reaching Arble from a web page, a repository or an MCP server is untrusted input. Injected instructions are why permission scoping and egress policy exist — the model should never be your only control.

---

## Backups

Back up three things. Two are small, and the third is where the data actually is.

| What | Method | Frequency |
|---|---|---|
| Postgres | `pg_dump` or WAL archiving | Continuous WAL + nightly base |
| Object store | Bucket replication + versioning | Continuous |
| Configuration | Version control | On change |
| Memory encryption key | Secret manager backup | On rotation |

**Database.** Logical dumps are simple and slow to restore; WAL archiving gives point-in-time recovery and is what you want in production:

```bash
pg_dump --format=custom --compress=9 \
  "$ARBLE_DATABASE_URL" > arble-$(date +%F).dump
```

**Memory** metadata is in Postgres and the vector index is derived, so the database backup covers it. Restore then reindex:

```bash
arble memory reindex
```

**Configuration** belongs in git — `arble.yaml`, Helm values, manifests. Never commit secrets; reference them.

**Snapshots.** Volume snapshots are convenient but are not a consistent database backup unless the filesystem supports atomic snapshots and you quiesce writes. Use them alongside `pg_dump`, not instead of it.

**Restore** into an empty database, then start the runtime — it will detect the schema version and refuse to start if it mismatches the binary, which is the behavior you want:

```bash
pg_restore --dbname="$ARBLE_DATABASE_URL" --clean arble-2026-07-30.dump
arble server migrate
```

**Version history.** Configuration changes, permission grants and skill versions are recorded, so you can see what changed before an incident:

```bash
arble audit config --since 7d
```

A backup you have not restored is a hypothesis. Restore into staging on a schedule and time it, so your RTO is measured rather than assumed.

---

## Disaster recovery

Define your targets first. RPO is how much data you can lose; RTO is how long you can be down. Every choice below follows from those two numbers.

| Strategy | RPO | RTO | Cost |
|---|---|---|---|
| Cold backup | Hours | Hours | Low |
| Warm standby | Minutes | Minutes | Medium |
| Hot standby | Seconds | Seconds | High |

**Cold backup.** Nightly dumps in object storage, infrastructure as code, nothing running. Restore by applying manifests and loading the dump. Appropriate for internal tooling.

**Warm standby.** A second environment deployed and current, scaled to zero or minimal replicas, with continuous WAL shipping. Failover is a scale-up and a DNS change.

**Hot standby.** Full capacity in a second region with streaming replication and a global load balancer. Justified when Arble is on a critical path.

**Replication.** Postgres streaming replication for the control plane, cross-region bucket replication for objects, and Redis replication only if you care about in-flight runs — usually you don't, since they're retryable.

**Failover** is four steps, and the order matters: promote the database, point configuration at the new primary, scale up the runtime, move DNS.

```bash
arble server drain --timeout 120s     # if the old site is reachable
# promote replica, update the database secret, then:
kubectl -n arble rollout restart deployment/arble-runtime
```

**Restore verification.** After any failover or restore, confirm the schema, the memory index and the model backends before returning traffic:

```bash
arble server verify --all
```

What is *not* recoverable: memory encrypted with a key you didn't back up, and object-store contents with versioning disabled and no replication. Verify both are covered before you need them.

---

## Updating

Arble uses semantic versioning. Patch and minor releases are backward compatible; major releases may require migration steps documented in the release notes.

**Version compatibility.** The gateway, runtime, worker and memory components must share the same minor version. Mixing minors is unsupported and the runtime logs a warning and refuses some operations.

Database schema is versioned independently. A binary refuses to start against a schema newer than it understands, which is what makes rollback safe.

**Rolling updates.** Run migrations first, then roll the Deployments. Migrations are additive within a minor release, so the old version keeps running against the new schema during the rollout:

```bash
kubectl -n arble create job arble-migrate-1-8-2 \
  --image=ghcr.io/arble-ai/runtime:1.8.2 -- arble server migrate

helm upgrade arble oci://ghcr.io/arble-ai/charts/arble \
  --version 1.8.2 --namespace arble --values values.yaml --wait
```

**Zero downtime** requires `maxUnavailable: 0`, working readiness probes, the `preStop` drain hook, and a PodDisruptionBudget. With all four, in-flight runs complete on the old replicas while new traffic goes to the new ones.

**Rollback.** Roll the application back first; only roll the schema back if the release notes say the migration was destructive:

```bash
helm rollback arble --namespace arble
```

Because migrations are additive within a minor, an application rollback is safe without a schema rollback. Across a major version, follow the documented downgrade path — additivity is not guaranteed there.

Always test an upgrade against a staging environment restored from a production backup. A migration's duration is a function of your data volume, and finding that out in production is avoidable.

---

## Troubleshooting

Start with `arble server verify --all`, which checks database, Redis, object store, model backends and sandbox in one pass.

### GPU unavailable

Runs fall back or fail with `model_unavailable`. Usually the device plugin or a resource request, not Arble.

```bash
kubectl -n models logs deploy/vllm --tail=50
kubectl describe node <gpu-node> | grep -A5 Allocatable
```

Check that the GPU node is tainted and the inference Pod tolerates it, that `nvidia.com/gpu` appears in allocatable resources, and that no Arble component is occupying the node.

### Model offline

`/readyz` reports unready and runs queue. Test the backend directly from inside the cluster, bypassing Arble:

```bash
kubectl -n arble run curl --rm -it --image=curlimages/curl -- \
  curl -s http://vllm.models:8000/v1/models
```

If that works and Arble disagrees, the `base_url` is wrong or a NetworkPolicy is blocking egress from the runtime.

### Connector failed

An expired token and an unreachable service need different fixes, and the health output distinguishes them:

```bash
arble connectors status github
arble mcp health
```

`auth: expired` means re-authorize. `status: unreachable` means egress or DNS. For remote MCP servers, confirm the worker's egress allowlist includes the host.

### Permission errors

A run stopping early is usually a denied capability, not a bug:

```bash
arble permissions audit --agent agt_5wTn9Kd --since 1h
```

With `default: never_allow`, every capability must be granted explicitly. In CI, an interactive prompt fails closed by design — pre-grant instead.

### Storage full

Postgres refuses writes and runs fail broadly. Find what grew, then tighten retention:

```bash
arble admin storage-usage
arble admin retention apply --dry-run
```

Files and screenshots normally dominate. Move the object store off the database volume, and confirm the retention job is actually running — a leader-election failure silently stops it.

### Networking issues

Streams cut off at a fixed interval, or long runs die at the same duration every time. That is nearly always proxy buffering or a read timeout, not Arble:

```bash
kubectl -n arble get ingress arble -o yaml | grep -A5 annotations
```

Confirm `proxy-buffering: "off"` and a `proxy-read-timeout` above your longest run. See [Networking](#networking).

---

## Best practices

1. Pin exact image versions in production. Never deploy `latest`.
2. Keep `arble.yaml`, Helm values and manifests in version control; reference secrets, never inline them.
3. Run migrations as a discrete step before rolling the application, not as a container entrypoint.
4. Use managed Postgres with automated failover unless you already operate Patroni well.
5. Point liveness at `/healthz` and readiness at `/readyz`. Never point liveness at a dependency check.
6. Set `maxUnavailable: 0`, a `preStop` drain hook, and a `terminationGracePeriodSeconds` above the drain timeout.
7. Add a PodDisruptionBudget so node maintenance can't drain the service to zero.
8. Turn off proxy response buffering and raise the read timeout before debugging streaming.
9. Autoscale the runtime on `arble_active_runs`, not CPU — a run waiting on a model is idle.
10. Taint GPU nodes for inference only; never schedule Arble components onto them.
11. Deny worker egress by default and allowlist explicitly. This is your highest-value control.
12. Set `permissions.default: never_allow` and grant capabilities narrowly, with scopes.
13. Use project-scoped tokens and service accounts so unattended actions are attributable.
14. Integrate OIDC and map IdP groups to roles, so access changes in one place.
15. Back up the memory encryption key separately from the database.
16. Enable object versioning on the bucket; it makes deletion recoverable.
17. Restore a backup into staging on a schedule and time it. Measure RTO, don't assume it.
18. Ship audit logs off-host, and retain them at least as long as your compliance window.
19. Run `arble memory summarize` periodically; unbounded memory costs context on every run.
20. Test upgrades against staging restored from a production backup, so migration duration is known.

---

## Reference

- [Docker](#docker) — images, volumes, ports, Compose
- [Kubernetes](#kubernetes) — Helm chart, manifests, autoscaling, node pools
- [Configuration](#docker) — `arble.yaml` structure and precedence
- Environment variables — full list, `arble server config --list`
- [Networking](#networking) — TLS, proxy settings, NetworkPolicy, air-gapped
- [Storage](#storage) — Postgres, Redis, object storage, retention
- [Authentication](#authentication) — OIDC, SAML, LDAP, service accounts
- [Scaling](#scaling) — metrics, bottleneck table, worker pools
- [Security](#security) — sandbox, permissions, audit, isolation
- [Monitoring](#monitoring) — metrics, logs, tracing, health endpoints
- [Backups](#backups) — database, objects, keys, restore procedure
- [CLI](cli.md) — `arble server`, `arble admin` command reference
- [API Reference](api-reference.md) — REST endpoints exposed by your deployment

---

## FAQ

**Is self-hosted Arble feature-complete against the managed version?**
Yes, with two additions rather than omissions: `stdio` MCP servers and bare-metal desktop control need a self-hosted deployment. Nothing is held back.

**Can I run Arble without any GPU?**
Yes. Arble is a CPU workload. Point it at a hosted model provider, or at a shared inference server elsewhere. GPUs are only for local inference and local embeddings.

**Does Arble phone home?**
Only for update checks, which are disableable with `updates.check: false`. Telemetry is opt-in. In air-gapped mode both are off and nothing egresses.

**Can I use SQLite in production?**
For a genuine single-node, single-process deployment, yes. It does not support multiple runtime replicas. Migrate to Postgres before scaling out, not during.

**How do I size GPU capacity?**
Size on tokens per second at your expected concurrency, not on user count. Start by measuring `arble_model_latency_seconds` p95 under realistic load and add capacity until it meets your SLO.

**What happens to in-flight runs during an upgrade?**
With the drain hook and `maxUnavailable: 0`, they complete on the old replicas. Without them, they fail and are retryable via `POST /v1/runs/:id/retry`.

**Do I need Redis if I'm not using scheduled jobs?**
Yes for multi-replica deployments — it also handles leader election and run scheduling. Single-node deployments can run without it.

**Can the control plane be on-prem with inference in the cloud?**
Yes, and it's a common hybrid pattern. Configure a cloud model provider and allowlist its endpoint in worker egress. Prompts and completions leave your network; memory and audit logs do not.

**How do I isolate teams from each other?**
Projects for soft separation within a shared deployment; organizations for hard separation with no shared memory or connectors. For regulatory isolation, separate deployments.

**What is the actual blast radius if a worker is compromised?**
Whatever its egress allowlist and permission grants permit — that's the entire point of scoping both. A worker holds no database credentials and runs unprivileged.

**Can I bring my own vector database?**
`pgvector` is the default and is sufficient for most deployments. External vector stores are supported through the memory service's backend configuration; the index is rebuildable either way.

**How long do upgrades take?**
The rollout is a normal rolling update, typically single-digit minutes. Migration duration scales with data volume — measure it in staging against a production-sized restore.

---

**Previous:** [API Reference](api-reference.md) · **Next:** [Glossary](#)
