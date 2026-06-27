---
name: goalkeeper-status
description: Summarize current Goalkeeper state from persisted artifacts. Use when user asks status, progress, where we are, blockers, current phase/wave/step, or wants a concise project state without advancing the loop.
---

# Goalkeeper Status

Use this skill to inspect, not mutate.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/resume-snapshot.md`, `.goalkeeper/next-target.md`, `.goalkeeper/active-goal.md`, `.goalkeeper/goal-contract.md`, `.goalkeeper/phase-plan.md`, `.goalkeeper/progress-log.md`, and `.goalkeeper/verification-log.md`.
2. Prefer running `scripts/goalkeeper-status.sh <project-dir>` when available.
3. Report:
   - status
   - current phase/wave/step
   - next action
   - next phase target
   - blockers
   - last verification
4. Keep response terse.

## Rules

- Do not choose new scope.
- Do not advance state.
- Do not ask unless artifacts conflict.
