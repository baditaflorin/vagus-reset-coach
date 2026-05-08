#!/usr/bin/env bash
set -euo pipefail

npm run build
npx playwright test

test -f docs/index.html
test -f docs/404.html
