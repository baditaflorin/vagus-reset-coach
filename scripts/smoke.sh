#!/usr/bin/env bash
set -euo pipefail

npm run build

if command -v lsof >/dev/null 2>&1; then
  lsof -ti tcp:4173 | xargs -r kill || true
fi
node scripts/static-server.js &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT

for _ in {1..50}; do
  if curl -fs "http://127.0.0.1:4173/vagus-reset-coach/" >/dev/null; then
    break
  fi
  sleep 0.2
done

PLAYWRIGHT_BASE_URL="http://127.0.0.1:4173" npx playwright test

test -f docs/index.html
test -f docs/404.html
