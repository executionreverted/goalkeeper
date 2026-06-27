#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: goalkeeper-analyze-phase.sh <target-dir> <PHASE-ID>" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/goalkeeper-state.cjs" analyze-phase "$1" "$2"
