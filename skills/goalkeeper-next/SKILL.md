---
name: goalkeeper-next
description: Find the next ready Goalkeeper phase, wave, or step from persisted artifacts. Use when user asks what to do next, wants to continue goal mode, or needs the next actionable item without executing it.
---

# Goalkeeper Next

Use this skill to select next action, not execute it.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/resume-snapshot.md`, `.goalkeeper/next-target.md`, `.goalkeeper/goal-contract.md`, and `.goalkeeper/phase-plan.md`.
2. Prefer running `scripts/goalkeeper-next.sh <project-dir>` when available.
3. Select first actionable unit:
   - `ready` step
   - `in_progress` step needing continuation
   - `needs_review` step needing verification
   - parallelizable ready wave
4. Report dispatch mode:
   - `main-agent`
   - `subagents`
   - `verify`
   - `blocked`
5. If a requested or hinted later phase skips an open earlier/dependency phase, stop and ask whether to continue later or handle the open phase first.
6. Keep response terse.

## Rules

- Do not execute.
- Do not plan new phases unless no actionable work exists.
- If wave is parallelizable, include subagent split suggestion.
- Keep next target phase-level; do not replace it with a tiny wave/step unless reporting current action.
- Do not silently skip open prerequisite phases.
