#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

expect_contains() {
  local file="$1"
  local pattern="$2"
  if ! grep -Fq "$pattern" "$file"; then
    echo "FAIL expected '$pattern' in $file" >&2
    echo "--- output ---" >&2
    cat "$file" >&2
    exit 1
  fi
}

expect_fails() {
  local output="$1"
  shift
  if "$@" >"$output" 2>&1; then
    echo "FAIL expected command to fail: $*" >&2
    cat "$output" >&2
    exit 1
  fi
}

"$ROOT_DIR/scripts/goalkeeper-init.sh" "$TMP_DIR" >"$TMP_DIR/init.out"
"$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR" >"$TMP_DIR/validate-init.out"
"$ROOT_DIR/scripts/goalkeeper-next.sh" "$TMP_DIR" >"$TMP_DIR/next-init.out"
expect_contains "$TMP_DIR/next-init.out" 'recommended_command: $goalkeeper-new-project'

"$ROOT_DIR/scripts/goalkeeper-new-project.sh" "$TMP_DIR" --idea "build TODO" --context7 yes --autonomy A2 >"$TMP_DIR/new.out"
"$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR" >"$TMP_DIR/validate-new.out"
"$ROOT_DIR/scripts/goalkeeper-next.sh" "$TMP_DIR" >"$TMP_DIR/next-new.out"
expect_contains "$TMP_DIR/next-new.out" 'mode: interrogate'
expect_contains "$TMP_DIR/next-new.out" 'recommended_command: $goalkeeper-new-project'

rm -rf "$TMP_DIR/.goalkeeper/phases/PHASE-0001-new-project-discovery"
expect_fails "$TMP_DIR/validate-missing-scoped.out" "$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR"
expect_contains "$TMP_DIR/validate-missing-scoped.out" "FAIL missing scoped artifact"

"$ROOT_DIR/scripts/goalkeeper-new-project.sh" "$TMP_DIR" --idea "build TODO" --context7 yes --autonomy A2 --force >"$TMP_DIR/new-force.out"
perl -0pi -e 's/Status: in_progress/Status: done/; s/Status: ready/Status: done/g' "$TMP_DIR/.goalkeeper/phase-plan.md"
expect_fails "$TMP_DIR/validate-fake-done.out" "$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR"
expect_contains "$TMP_DIR/validate-fake-done.out" "without scoped step verification evidence"
"$ROOT_DIR/scripts/goalkeeper-analyze-phase.sh" "$TMP_DIR" PHASE-0001 >"$TMP_DIR/analyze-fake-done.out"
expect_contains "$TMP_DIR/analyze-fake-done.out" "gaps:"
if find "$TMP_DIR/.goalkeeper/archive" -maxdepth 1 -type f | grep -q .; then
  echo "FAIL fake done produced archive" >&2
  find "$TMP_DIR/.goalkeeper/archive" -maxdepth 1 -type f >&2
  exit 1
fi

"$ROOT_DIR/scripts/goalkeeper-new-project.sh" "$TMP_DIR" --idea "build TODO" --context7 yes --autonomy A2 --force >"$TMP_DIR/new-force-2.out"
cat >>"$TMP_DIR/.goalkeeper/context-ledger.md" <<'EOF'

### RSR-0001: Todo Storage

Status: accepted
Question: Which storage should the TODO app use?
Normalized question: todo storage choice
Scope: project
Sources:
- local reasoning
Decision links:
- DEC-0001
Last checked: 2026-06-27
Freshness: stable
Result: Use localStorage for MVP persistence.
EOF
expect_fails "$TMP_DIR/validate-missing-decision.out" "$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR"
expect_contains "$TMP_DIR/validate-missing-decision.out" "links missing decision DEC-0001"
cat >>"$TMP_DIR/.goalkeeper/decision-log.md" <<'EOF'

## DEC-0001: Use Local Storage

Date: 2026-06-27
Status: accepted
Context: TODO MVP persistence
Options:
- localStorage
- backend database
Decision: Use localStorage for the MVP.
Rationale: It satisfies offline local TODO persistence with no backend.
Consequences: Data remains browser-local.
EOF
"$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR" >"$TMP_DIR/validate-research-fixed.out"
cat >>"$TMP_DIR/.goalkeeper/context-ledger.md" <<'EOF'

### RSR-0002: Todo Persistence

Status: proposed
Question: What should persist TODO items?
Normalized question: todo storage choice
Scope: project
Sources:
- local reasoning
Decision links:
- DEC-0001
Last checked: 2026-06-27
Freshness: stable
Result: Duplicate active research should be rejected.
EOF
expect_fails "$TMP_DIR/validate-duplicate-research.out" "$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR"
expect_contains "$TMP_DIR/validate-duplicate-research.out" "duplicate active research question"
perl -0pi -e 's/(### RSR-0002:[\s\S]*?Status: )proposed/$1superseded/' "$TMP_DIR/.goalkeeper/context-ledger.md"
"$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR" >"$TMP_DIR/validate-superseded-research.out"
perl -0pi -e 's/\$goalkeeper-new-project/\$goalkeeper-plan/' "$TMP_DIR/.goalkeeper/next-target.md"
expect_fails "$TMP_DIR/validate-bad-next-command.out" "$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR"
expect_contains "$TMP_DIR/validate-bad-next-command.out" "recommended command mismatch"

echo "ok: goalkeeper smoke test passed"
