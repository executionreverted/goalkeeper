---
name: goalkeeper-pause
description: Pause Goalkeeper work without advancing to the next step, syncing progress, verification, phase plan status, blockers, and resume snapshot so state is safe after context loss. Use when user says pause, stop here, save state, sync docs, or wants to leave work cleanly.
---

# Goalkeeper Pause

Use this skill to stop safely.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/resume-snapshot.md`, `.goalkeeper/next-target.md`, `.goalkeeper/phase-plan.md`, compact root logs, and the active scoped phase/wave/step files under `.goalkeeper/phases/`.
2. Prefer running `scripts/goalkeeper-pause.sh <project-dir> --reason "..."`
3. Sync:
   - current phase/wave/step
   - next phase target
   - latest completed work
   - blockers
   - next action
   - verification state
   - active scoped artifact paths
4. Do not move to next step.
5. Final response: concise paused state plus `Next: $goalkeeper-resume`.

## Rules

- Pause means no continuation.
- Preserve enough context for `goalkeeper-resume`.
- Do not mark work done unless verification already exists.
- Sync active scoped files before root indexes.
- Pause always ends with `Next: $goalkeeper-resume`.
