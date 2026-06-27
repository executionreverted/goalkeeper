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

expect_not_contains() {
  local file="$1"
  local pattern="$2"
  if grep -Fq "$pattern" "$file"; then
    echo "FAIL did not expect '$pattern' in $file" >&2
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

git -C "$TMP_DIR" init >/dev/null 2>&1
"$ROOT_DIR/scripts/goalkeeper-init.sh" "$TMP_DIR" >"$TMP_DIR/init.out"
"$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR" >"$TMP_DIR/validate-init.out"
expect_not_contains "$TMP_DIR/validate-init.out" "fatal:"
node "$ROOT_DIR/bin/goalkeeper.cjs" config "$TMP_DIR" >"$TMP_DIR/config-init.out"
expect_contains "$TMP_DIR/config-init.out" '"autonomy_level": "A1"'
node "$ROOT_DIR/bin/goalkeeper.cjs" do "$TMP_DIR" --text "what next" >"$TMP_DIR/do-init.out"
expect_contains "$TMP_DIR/do-init.out" 'recommended_command: $goalkeeper-new-project'
node "$ROOT_DIR/bin/goalkeeper.cjs" do "$TMP_DIR" --text "change autonomy to A2" >"$TMP_DIR/do-config.out"
expect_contains "$TMP_DIR/do-config.out" 'recommended_command: $goalkeeper-config'
"$ROOT_DIR/scripts/goalkeeper-next.sh" "$TMP_DIR" >"$TMP_DIR/next-init.out"
expect_contains "$TMP_DIR/next-init.out" 'recommended_command: $goalkeeper-new-project'

"$ROOT_DIR/scripts/goalkeeper-new-project.sh" "$TMP_DIR" --idea "build TODO" --context7 yes --autonomy A2 >"$TMP_DIR/new.out"
"$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR" >"$TMP_DIR/validate-new.out"
node "$ROOT_DIR/bin/goalkeeper.cjs" config "$TMP_DIR" >"$TMP_DIR/config-new.out"
expect_contains "$TMP_DIR/config-new.out" '"autonomy_level": "A2"'
expect_contains "$TMP_DIR/config-new.out" '"context7": "yes"'
cp "$TMP_DIR/.goalkeeper/config.json" "$TMP_DIR/config.good.json"
perl -0pi -e 's/"autonomy_level": "A2"/"autonomy_level": "Z9"/' "$TMP_DIR/.goalkeeper/config.json"
expect_fails "$TMP_DIR/validate-bad-config.out" "$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR"
expect_contains "$TMP_DIR/validate-bad-config.out" "config.json autonomy_level invalid"
mv "$TMP_DIR/config.good.json" "$TMP_DIR/.goalkeeper/config.json"
node "$ROOT_DIR/bin/goalkeeper.cjs" do "$TMP_DIR" --text "change autonomy to A3" >"$TMP_DIR/do-config-new.out"
expect_contains "$TMP_DIR/do-config-new.out" 'recommended_command: $goalkeeper-config'
node "$ROOT_DIR/bin/goalkeeper.cjs" do "$TMP_DIR" --text "research storage options" >"$TMP_DIR/do-research-new.out"
expect_contains "$TMP_DIR/do-research-new.out" 'recommended_command: $goalkeeper-research'
node "$ROOT_DIR/bin/goalkeeper.cjs" do "$TMP_DIR" --text "map the codebase" >"$TMP_DIR/do-map-codebase-new.out"
expect_contains "$TMP_DIR/do-map-codebase-new.out" 'recommended_command: $goalkeeper-map-codebase'
mkdir -p "$TMP_DIR/.agents/skills/example"
node "$ROOT_DIR/bin/goalkeeper.cjs" map-codebase "$TMP_DIR" >"$TMP_DIR/map-codebase.out"
expect_contains "$TMP_DIR/map-codebase.out" "Goalkeeper codebase map"
expect_contains "$TMP_DIR/map-codebase.out" ".goalkeeper/codebase/structure.md"
expect_contains "$TMP_DIR/.goalkeeper/codebase/structure.md" "# Codebase Structure"
expect_not_contains "$TMP_DIR/.goalkeeper/codebase/structure.md" ".agents/"
expect_contains "$TMP_DIR/.goalkeeper/codebase/stack.md" "# Codebase Stack"
expect_contains "$TMP_DIR/.goalkeeper/codebase/testing.md" "# Codebase Testing"
"$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR" >"$TMP_DIR/validate-codebase.out"
expect_not_contains "$TMP_DIR/validate-codebase.out" "fatal:"
node "$ROOT_DIR/bin/goalkeeper.cjs" do "$TMP_DIR" --text "ship this project" >"$TMP_DIR/do-ship-new.out"
expect_contains "$TMP_DIR/do-ship-new.out" 'recommended_command: $goalkeeper-ship'
node "$ROOT_DIR/bin/goalkeeper.cjs" ship "$TMP_DIR" >"$TMP_DIR/ship.out"
expect_contains "$TMP_DIR/ship.out" "Goalkeeper ship"
expect_contains "$TMP_DIR/ship.out" "status: blocked"
expect_contains "$TMP_DIR/ship.out" ".goalkeeper/ship/"
ship_file="$(awk -F': ' '/^ship:/ { print $2 }' "$TMP_DIR/ship.out")"
test -f "$TMP_DIR/$ship_file"
expect_contains "$TMP_DIR/$ship_file" "# Ship Readiness"
"$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR" >"$TMP_DIR/validate-ship.out"
node "$ROOT_DIR/bin/goalkeeper.cjs" do "$TMP_DIR" --text "quick fix typo in README" >"$TMP_DIR/do-quick-new.out"
expect_contains "$TMP_DIR/do-quick-new.out" 'recommended_command: $goalkeeper-quick'
node "$ROOT_DIR/bin/goalkeeper.cjs" quick "$TMP_DIR" --text "fix typo in README" >"$TMP_DIR/quick-run.out"
expect_contains "$TMP_DIR/quick-run.out" "quick:"
expect_contains "$TMP_DIR/quick-run.out" 'recommended_command: $goalkeeper-quick'
quick_slug="$(awk '/^slug:/ { print $2 }' "$TMP_DIR/quick-run.out")"
test -n "$quick_slug"
node "$ROOT_DIR/bin/goalkeeper.cjs" quick "$TMP_DIR" list >"$TMP_DIR/quick-list.out"
expect_contains "$TMP_DIR/quick-list.out" "$quick_slug"
node "$ROOT_DIR/bin/goalkeeper.cjs" quick "$TMP_DIR" status "$quick_slug" >"$TMP_DIR/quick-status.out"
expect_contains "$TMP_DIR/quick-status.out" "Status: ready"
node "$ROOT_DIR/bin/goalkeeper.cjs" quick "$TMP_DIR" resume "$quick_slug" >"$TMP_DIR/quick-resume.out"
expect_contains "$TMP_DIR/quick-resume.out" 'recommended_command: $goalkeeper-quick'
"$ROOT_DIR/scripts/goalkeeper-validate.sh" "$TMP_DIR" >"$TMP_DIR/validate-quick.out"
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
