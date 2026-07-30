#!/usr/bin/env bash
# Serve the site locally. A server is required rather than opening index.html
# off the filesystem: the docs use directory URLs and fetch a search index.
set -euo pipefail
PORT="${1:-8080}"
cd "$(dirname "$0")/.."
echo "Arble website  →  http://localhost:${PORT}"
exec python3 -m http.server "$PORT"
