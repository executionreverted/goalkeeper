#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: goalkeeper-init.sh [target-dir] [--force] [--dry-run]

Create .goalkeeper/ artifacts in target project.

Options:
  --force    overwrite existing Goalkeeper files
  --dry-run  print actions, write nothing
EOF
}

TARGET="."
FORCE=0
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) TARGET="$1"; shift ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_DIR="$ROOT_DIR/templates"
TARGET_DIR="$(cd "$TARGET" && pwd)"
GK_DIR="$TARGET_DIR/.goalkeeper"
GK_TEMPLATE_DIR="$GK_DIR/templates"
GK_PHASES_DIR="$GK_DIR/phases"
GK_ARCHIVE_DIR="$GK_DIR/archive"
GK_GAPS_DIR="$GK_DIR/gaps"

if [[ ! -d "$TEMPLATE_DIR" ]]; then
  echo "error: templates dir missing: $TEMPLATE_DIR" >&2
  exit 1
fi

run() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "dry-run: $*"
  else
    "$@"
  fi
}

write_from_template() {
  local src="$1"
  local dst="$2"

  if [[ -e "$dst" && "$FORCE" -ne 1 ]]; then
    echo "skip: ${dst#$TARGET_DIR/} exists"
    return
  fi

  run mkdir -p "$(dirname "$dst")"
  run cp "$src" "$dst"
  echo "write: ${dst#$TARGET_DIR/}"
}

run mkdir -p "$GK_DIR"
run mkdir -p "$GK_TEMPLATE_DIR"
run mkdir -p "$GK_PHASES_DIR"
run mkdir -p "$GK_ARCHIVE_DIR"
run mkdir -p "$GK_GAPS_DIR"

for template in "$TEMPLATE_DIR"/*.md; do
  [[ -f "$template" ]] || continue
  write_from_template "$template" "$GK_TEMPLATE_DIR/$(basename "$template")"
done

write_from_template "$TEMPLATE_DIR/active-goal.md" "$GK_DIR/active-goal.md"
write_from_template "$TEMPLATE_DIR/always-read.md" "$GK_DIR/always-read.md"
write_from_template "$TEMPLATE_DIR/compression-profile.md" "$GK_DIR/compression-profile.md"
write_from_template "$TEMPLATE_DIR/project-seed.md" "$GK_DIR/project-seed.md"
write_from_template "$TEMPLATE_DIR/discovery-log.md" "$GK_DIR/discovery-log.md"
write_from_template "$TEMPLATE_DIR/goal-contract.md" "$GK_DIR/goal-contract.md"
write_from_template "$TEMPLATE_DIR/context-ledger.md" "$GK_DIR/context-ledger.md"
write_from_template "$TEMPLATE_DIR/decision-log.md" "$GK_DIR/decision-log.md"
write_from_template "$TEMPLATE_DIR/phase-plan.md" "$GK_DIR/phase-plan.md"
write_from_template "$TEMPLATE_DIR/next-target.md" "$GK_DIR/next-target.md"
write_from_template "$TEMPLATE_DIR/progress-log.md" "$GK_DIR/progress-log.md"
write_from_template "$TEMPLATE_DIR/verification-log.md" "$GK_DIR/verification-log.md"
write_from_template "$TEMPLATE_DIR/resume-snapshot.md" "$GK_DIR/resume-snapshot.md"

write_from_template "$TEMPLATE_DIR/phase.md" "$GK_PHASES_DIR/PHASE-0000-bootstrap-goalkeeper/phase.md"
write_from_template "$TEMPLATE_DIR/wave.md" "$GK_PHASES_DIR/PHASE-0000-bootstrap-goalkeeper/waves/WAVE-0000-A-discovery/wave.md"
write_from_template "$TEMPLATE_DIR/step.md" "$GK_PHASES_DIR/PHASE-0000-bootstrap-goalkeeper/waves/WAVE-0000-A-discovery/steps/STEP-0000-A-01-run-new-project-discovery.md"

echo "ok: Goalkeeper initialized at $GK_DIR"
