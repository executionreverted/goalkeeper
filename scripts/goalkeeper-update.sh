#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: goalkeeper-update.sh [--agent codex|claude|both] [--scope user|project] [--target DIR] [--force] [--dry-run] [--yes] [--global]

Update installed Goalkeeper skills from the latest npm package.

Options:
  --agent VALUE  codex, claude, or both; default codex with --yes
  --scope VALUE  user or project, default user
  --target DIR   exact skills directory
  --force        overwrite existing skills, default on
  --dry-run      print actions only
  --yes          use Codex user defaults when no agent/target is provided
  --global       also update the global npm package
EOF
}

AGENT=""
SCOPE="user"
TARGET=""
DRY_RUN=0
YES=0
UPDATE_GLOBAL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent) AGENT="${2:-}"; shift 2 ;;
    --scope) SCOPE="${2:-user}"; shift 2 ;;
    --target) TARGET="${2:-}"; shift 2 ;;
    --force) shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --yes) YES=1; shift ;;
    --global) UPDATE_GLOBAL=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "error: unknown arg: $1" >&2; usage >&2; exit 1 ;;
  esac
done

if [[ -z "$AGENT" && -z "$TARGET" && "$YES" -eq 1 ]]; then
  AGENT="codex"
fi

if [[ -z "$AGENT" && -z "$TARGET" ]]; then
  echo "error: update requires --agent codex|claude|both, --target DIR, or --yes" >&2
  exit 1
fi

if [[ "$UPDATE_GLOBAL" -eq 1 ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "dry-run: npm install -g @goalkpr/goalkeeper@latest"
  else
    npm install -g @goalkpr/goalkeeper@latest
  fi
fi

cmd=(npx --yes @goalkpr/goalkeeper@latest install --force)
if [[ -n "$TARGET" ]]; then
  cmd+=(--target "$TARGET")
else
  cmd+=(--agent "$AGENT" --scope "$SCOPE")
fi
if [[ "$DRY_RUN" -eq 1 ]]; then
  cmd+=(--dry-run)
  printf 'dry-run:'
  printf ' %q' "${cmd[@]}"
  printf '\n'
else
  "${cmd[@]}"
fi
