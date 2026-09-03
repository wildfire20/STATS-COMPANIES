#!/usr/bin/env bash
set -euo pipefail

# Restore the exact dependency tree committed by the merged task.
npm ci --no-audit --no-fund

# Catch incompatible task merges before workflow reconciliation.
npm run check
npm run build