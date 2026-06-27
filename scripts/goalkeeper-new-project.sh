#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: goalkeeper-new-project.sh [target-dir] --idea TEXT [--context7 yes|no|unknown] [--autonomy A0|A1|A2|A3|A4] [--force]

Create the initial Goalkeeper intake packet from a raw project idea.

Options:
  --idea TEXT       raw user project idea
  --context7 VALUE  Context7 availability: yes, no, or unknown
  --autonomy VALUE  initial autonomy level, default A1
  --force           overwrite existing seed/intake packet
EOF
}

TARGET="."
IDEA=""
CONTEXT7="unknown"
AUTONOMY="A1"
FORCE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --idea)
      IDEA="${2:-}"
      shift 2
      ;;
    --context7)
      CONTEXT7="${2:-unknown}"
      shift 2
      ;;
    --autonomy)
      AUTONOMY="${2:-A1}"
      shift 2
      ;;
    --force)
      FORCE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      TARGET="$1"
      shift
      ;;
  esac
done

if [[ -z "$IDEA" ]]; then
  echo "error: --idea is required" >&2
  usage >&2
  exit 1
fi

case "$CONTEXT7" in
  yes|no|unknown) ;;
  *) echo "error: --context7 must be yes, no, or unknown" >&2; exit 1 ;;
esac

case "$AUTONOMY" in
  A0|A1|A2|A3|A4) ;;
  *) echo "error: --autonomy must be A0, A1, A2, A3, or A4" >&2; exit 1 ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_DIR="$ROOT_DIR/templates"
TARGET_DIR="$(cd "$TARGET" && pwd)"
GK_DIR="$TARGET_DIR/.goalkeeper"
PHASE_DIR="$GK_DIR/phases/PHASE-0001-new-project-discovery"
WAVE_DIR="$PHASE_DIR/waves/WAVE-0001-A-grill-and-clarify"
STEP_DIR="$WAVE_DIR/steps"
STEP_FILE="$STEP_DIR/STEP-0001-A-01-ask-first-user-question.md"

if [[ ! -d "$GK_DIR" ]]; then
  echo "error: .goalkeeper not found in $TARGET_DIR. Run goalkeeper-init.sh first." >&2
  exit 1
fi

mkdir -p "$STEP_DIR"

if [[ ! -f "$GK_DIR/compression-profile.md" && -f "$TEMPLATE_DIR/compression-profile.md" ]]; then
  cp "$TEMPLATE_DIR/compression-profile.md" "$GK_DIR/compression-profile.md"
  echo "write: .goalkeeper/compression-profile.md"
fi

write_file() {
  local file="$1"
  if [[ -e "$file" && "$FORCE" -ne 1 ]]; then
    local template="$TEMPLATE_DIR/$(basename "$file")"
    if [[ -f "$template" ]] && cmp -s "$file" "$template"; then
      echo "overwrite placeholder: ${file#$TARGET_DIR/}"
      return 0
    fi
    echo "skip: ${file#$TARGET_DIR/} exists. use --force to overwrite"
    return 1
  fi
  return 0
}

now="$(date '+%Y-%m-%d %H:%M:%S %z')"

if write_file "$GK_DIR/project-seed.md"; then
  cat > "$GK_DIR/project-seed.md" <<EOF
# Project Seed

Created: $now
Seed status: interrogating

## Raw Idea

$IDEA

## User Motivation

Unknown. Ask during discovery.

## Target User

Unknown. Ask during discovery.

## Problem

Unknown. Ask during discovery.

## Desired Outcome

Unknown. Ask during discovery.

## Initial Constraints

- Context7 available: $CONTEXT7
- Autonomy level: $AUTONOMY

## Unknowns

- Who exactly uses this first?
- What is the smallest useful outcome?
- What must not be built?
- What technical stack or platform constraints exist?
- What evidence proves the first version works?
EOF
fi

if write_file "$GK_DIR/discovery-log.md"; then
  cat > "$GK_DIR/discovery-log.md" <<EOF
# Discovery Log

## Questions Asked

- Q1 pending: Who is the first real user, and what exact job are they trying to finish?

## User Answers

- Raw idea: $IDEA

## Recommended Defaults

- Start with one narrow first-user workflow.
- Keep autonomy at $AUTONOMY until goal contract is stable.
- Treat Context7 as $CONTEXT7 for library/framework docs.

## Resolved Boundaries

- Project exists as a raw idea only.

## Open Branches

- User/persona
- Core workflow
- Non-goals
- Platform/stack
- Success evidence
EOF
fi

if write_file "$GK_DIR/active-goal.md"; then
  cat > "$GK_DIR/active-goal.md" <<EOF
# Active Goal

Status: new_project
Autonomy level: $AUTONOMY

## Goal

Clarify raw idea into a durable Goalkeeper goal contract.

## Raw Idea

$IDEA

## Current Gate

New Project -> Interrogate -> Clarify
EOF
fi

if write_file "$GK_DIR/goal-contract.md"; then
  cat > "$GK_DIR/goal-contract.md" <<EOF
# Goal Contract

Goal:
Pending discovery.

Non-goals:
- Pending discovery.

Success criteria:
- Pending discovery.

Constraints:
- Context7 available: $CONTEXT7

User preferences:
- Keep questions concise.
- Ask one grill-style question at a time.

Autonomy level:
$AUTONOMY

Approval required for:
- Product direction choices.
- External publishing/deploy/account/payment actions.
- Destructive operations.

Current phase:
new_project

Definition of done:
- Goal contract is concrete enough to plan phases, waves, and steps.
EOF
fi

if write_file "$GK_DIR/phase-plan.md"; then
  cat > "$GK_DIR/phase-plan.md" <<EOF
# Phase Plan

## PHASE-0001: New Project Discovery

Status: in_progress
Goal link: Active Goal
Depends on: none
Purpose: Turn raw idea into a clear goal contract.
Acceptance checks:
- First user is defined.
- Core workflow is defined.
- Non-goals are defined.
- Success evidence is defined.

### WAVE-0001-A: Grill and Clarify

Status: ready
Parallelizable: no
Depends on: none
Dispatch: main-agent

#### STEP-0001-A-01: Ask first-user question

Status: ready
Owner: main-agent
Inputs: project-seed.md, discovery-log.md
Expected output: first-user answer recorded
Acceptance checks:
- One concrete first user/persona is selected.
- The user job is described in observable terms.
Verification evidence:
- discovery-log.md contains the answer.
EOF
fi

if write_file "$PHASE_DIR/phase.md"; then
  cat > "$PHASE_DIR/phase.md" <<EOF
# Phase

## PHASE-0001: New Project Discovery

Status: in_progress
Goal link: Active Goal
Depends on: none
Purpose: Turn raw idea into a clear goal contract.
Acceptance checks:
- First user is defined.
- Core workflow is defined.
- Non-goals are defined.
- Success evidence is defined.
Waves:
- WAVE-0001-A: Grill and Clarify

## Working Files

\`\`\`text
waves/
  WAVE-0001-A-grill-and-clarify/
    wave.md
    steps/
      STEP-0001-A-01-ask-first-user-question.md
\`\`\`

## Phase Progress

- $now: Raw idea captured; discovery started.

## Phase Decisions

- Pending discovery.

## Phase Verification

- Pending discovery answers.
EOF
fi

if write_file "$WAVE_DIR/wave.md"; then
  cat > "$WAVE_DIR/wave.md" <<EOF
# Wave

### WAVE-0001-A: Grill and Clarify

Status: ready
Parallelizable: no
Depends on: none
Dispatch: main-agent
Steps:
- STEP-0001-A-01: Ask first-user question
Merge requirements:
- Discovery answer is recorded before intake.

## Working Files

\`\`\`text
steps/
  STEP-0001-A-01-ask-first-user-question.md
\`\`\`

## Wave Progress

- $now: Ready to ask the first discovery question.

## Wave Verification

- Pending discovery-log evidence.
EOF
fi

if write_file "$STEP_FILE"; then
  cat > "$STEP_FILE" <<EOF
# Step

#### STEP-0001-A-01: Ask first-user question

Status: ready
Owner: main-agent
Inputs: project-seed.md, discovery-log.md
Expected output: first-user answer recorded
Acceptance checks:
- One concrete first user/persona is selected.
- The user job is described in observable terms.
Verification evidence:
- discovery-log.md contains the answer.
Changed files:
- .goalkeeper/project-seed.md
- .goalkeeper/discovery-log.md
- .goalkeeper/phase-plan.md
- .goalkeeper/phases/PHASE-0001-new-project-discovery/phase.md
- .goalkeeper/phases/PHASE-0001-new-project-discovery/waves/WAVE-0001-A-grill-and-clarify/wave.md
- .goalkeeper/phases/PHASE-0001-new-project-discovery/waves/WAVE-0001-A-grill-and-clarify/steps/STEP-0001-A-01-ask-first-user-question.md
Commands:
- goalkeeper new --idea "..."
Decisions:
- Use grill-style discovery before intake.
Notes:
- Ask one concise question before planning implementation.
EOF
fi

if write_file "$GK_DIR/next-target.md"; then
  cat > "$GK_DIR/next-target.md" <<EOF
# Next Target

Updated: $now
Confidence: high

## Current Active Scope

Phase: PHASE-0001: New Project Discovery
Wave: WAVE-0001-A: Grill and Clarify
Step: STEP-0001-A-01: Ask first-user question

## Next Phase Target

Clarify the project enough to write goal-contract.md, then run goalkeeper-plan.

## Why

The project is still a raw idea. Goalkeeper must interrogate before planning or execution.

## Required Sync After Each Step Or Commit

- Update active files under phases/ for the current phase/wave/step.
- Update phase-plan.md index statuses.
- Update progress-log.md only as a compact index.
- Update verification-log.md only as a compact index when checks run.
- Update decision-log.md only for cross-phase decisions.
- Update resume-snapshot.md.
- Update this file.

## Conflict Policy

If docs and code disagree, inspect git status, git diff, recent commits, then code. If confidence stays low, ask user what to trust or do next.
EOF
fi

if write_file "$GK_DIR/resume-snapshot.md"; then
  cat > "$GK_DIR/resume-snapshot.md" <<EOF
# Resume Snapshot

Updated: $now
Status: new_project
Current phase: PHASE-0001
Autonomy level: $AUTONOMY

## Current Objective

Clarify raw project idea into a Goalkeeper goal contract.

## Latest Known State

- Raw idea captured.
- Discovery has not yet resolved first user, workflow, non-goals, stack, or success evidence.
- Context7 available: $CONTEXT7

## Next Action

Ask: Who is the first real user, and what exact job are they trying to finish?

## Next Phase Target

Clarify enough to write goal-contract.md, then run goalkeeper-plan.

## Blockers

- Awaiting first discovery answer.
EOF
fi

cat >> "$GK_DIR/progress-log.md" <<EOF

## $now

- Index: started new Goalkeeper project intake.
- Raw idea: $IDEA
- Detail: .goalkeeper/phases/PHASE-0001-new-project-discovery/
EOF

echo "ok: new project intake packet written to $GK_DIR"
echo "next question: Who is the first real user, and what exact job are they trying to finish?"
