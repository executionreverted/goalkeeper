---
name: goalkeeper-status
description: Summarize current Goalkeeper state from persisted artifacts. Use when user asks status, progress, where we are, blockers, current phase/wave/step, or wants a concise project state without advancing the loop.
---

# Goalkeeper Status

Use this skill to inspect, not mutate.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/config.json`, `.goalkeeper/resume-snapshot.md`, `.goalkeeper/next-target.md`, `.goalkeeper/active-goal.md`, `.goalkeeper/goal-contract.md`, `.goalkeeper/phase-plan.md`, compact root logs, and the active scoped files under `.goalkeeper/phases/`.
2. Prefer running `goalkeeper status <project-dir>` or `npx --yes @goalkpr/goalkeeper status <project-dir>` when available.
3. Report:
   - status
   - current phase/wave/step
   - next action
   - next phase target
   - blockers
   - last verification
   - active scoped artifact paths
   - recommended command
4. Apply `.goalkeeper/compression-profile.md` main-agent reply budget.

## Rules

- Do not choose new scope.
- Do not advance state.
- Do not ask unless artifacts conflict.
- End with exactly one `Next: $goalkeeper-...` route unless blocked.
