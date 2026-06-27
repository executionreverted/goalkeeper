#!/usr/bin/env bash
set -euo pipefail

TARGET="."
REASON="manual pause"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --reason)
      REASON="${2:-manual pause}"
      shift 2
      ;;
    -h|--help)
      echo "Usage: goalkeeper-pause.sh [target-dir] [--reason TEXT]"
      exit 0
      ;;
    *)
      TARGET="$1"
      shift
      ;;
  esac
done

TARGET_DIR="$(cd "$TARGET" && pwd)"
GK_DIR="$TARGET_DIR/.goalkeeper"
SNAPSHOT="$GK_DIR/resume-snapshot.md"
PLAN="$GK_DIR/phase-plan.md"
PROGRESS="$GK_DIR/progress-log.md"
VERIFY="$GK_DIR/verification-log.md"
NEXT_TARGET="$GK_DIR/next-target.md"

if [[ ! -d "$GK_DIR" ]]; then
  echo "error: .goalkeeper not found in $TARGET_DIR" >&2
  exit 1
fi

now="$(date '+%Y-%m-%d %H:%M:%S %z')"
next_script="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/goalkeeper-next.sh"
next_output="$("$next_script" "$TARGET_DIR" 2>/dev/null || true)"
last_progress="$(grep -m1 '^- ' "$PROGRESS" 2>/dev/null || true)"
last_verification="$(grep -m1 '^## VER-' "$VERIFY" 2>/dev/null || true)"
next_phase_target="$(awk '
  $0 == "## Next Phase Target" { found=1; next }
  found && /^## / { exit }
  found && NF { print; exit }
' "$NEXT_TARGET" 2>/dev/null || true)"

cat > "$SNAPSHOT" <<EOF
# Resume Snapshot

Updated: $now
Status: paused
Current phase: paused
Autonomy level: A1

## Current Objective

Pause requested. Do not advance to next step.

## Latest Known State

- Pause reason: $REASON
- Last progress: ${last_progress:-unknown}
- Last verification: ${last_verification:-none}

## Next Action

$(printf '%s\n' "$next_output" | sed 's/^/- /')

## Next Phase Target

${next_phase_target:-Unknown. Re-run goalkeeper-next and inspect phase-plan.md.}

## Blockers

- None recorded by pause script.
EOF

cat >> "$PROGRESS" <<EOF

## $now

- Paused Goalkeeper work. Reason: $REASON
EOF

if [[ -f "$NEXT_TARGET" ]]; then
  tmp_file="$(mktemp)"
  awk -v now="$now" '
    /^Updated:/ { print "Updated: " now; next }
    { print }
  ' "$NEXT_TARGET" > "$tmp_file"
  mv "$tmp_file" "$NEXT_TARGET"
fi

echo "ok: paused and synced $GK_DIR"
