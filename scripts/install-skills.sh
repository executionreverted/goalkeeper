#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: install-skills.sh [--target DIR] [--force] [--dry-run]

Install Goalkeeper skills into Codex skills dir.

Default target:
  ${CODEX_HOME:-$HOME/.codex}/skills

Options:
  --target DIR  install skills into DIR
  --force       overwrite existing goalkeeper-* skills
  --dry-run     print actions, write nothing
EOF
}

FORCE=0
DRY_RUN=0
TARGET="${CODEX_HOME:-$HOME/.codex}/skills"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET="${2:-}"
      if [[ -z "$TARGET" ]]; then echo "error: --target requires DIR" >&2; exit 1; fi
      shift 2
      ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "error: unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/skills"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "error: skills dir missing: $SOURCE_DIR" >&2
  exit 1
fi

run() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "dry-run: $*"
  else
    "$@"
  fi
}

run mkdir -p "$TARGET"

for skill in "$SOURCE_DIR"/goalkeeper-*; do
  [[ -d "$skill" ]] || continue
  name="$(basename "$skill")"
  dst="$TARGET/$name"

  if [[ -e "$dst" && "$FORCE" -ne 1 ]]; then
    echo "skip: $name exists. use --force to overwrite"
    continue
  fi

  if [[ -e "$dst" && "$FORCE" -eq 1 ]]; then
    run rm -rf "$dst"
  fi

  run cp -R "$skill" "$dst"
  echo "install: $name -> $dst"
done

echo "ok: Goalkeeper skills installed to $TARGET"
