---
name: goalkeeper-execute
description: Execute the next ready Goalkeeper phase, wave, or step using the active goal contract, phase plan, tool policy, progress artifacts, and subagent dispatch rules. Use when goal mode should continue with minimal user action and the next step or parallel wave is local, bounded, and allowed by the current autonomy level.
---

# Goalkeeper Execute

Use this skill to perform the next bounded step or dispatch a parallel wave.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/resume-snapshot.md`, `.goalkeeper/next-target.md`, `.goalkeeper/goal-contract.md`, `.goalkeeper/phase-plan.md`, and `.goalkeeper/progress-log.md`.
2. Select the first `ready` step whose phase and wave dependencies are satisfied.
3. Check `.goalkeeper/goal-contract.md` autonomy level and `docs/tool-policy.md`.
4. If the next action requires approval, stop and ask one clear question.
5. If the wave is parallelizable, dispatch independent steps to subagents using `docs/subagent-policy.md` and `.goalkeeper/compression-profile.md`.
6. Mark selected step or wave `in_progress`.
7. Execute only the work needed for that step or integrate subagent results for that wave.
8. Update `.goalkeeper/progress-log.md`, `.goalkeeper/phase-plan.md`, `.goalkeeper/resume-snapshot.md`, and `.goalkeeper/next-target.md` with changed files, commands, artifacts, and subagent results.
9. Move the step or wave to `needs_review` or `blocked`; use `goalkeeper-verify` before `done`.
10. Refresh `.goalkeeper/resume-snapshot.md`.

## Execution Rules

- Do not expand scope opportunistically.
- Do not hide failed attempts; log them briefly.
- Do not claim completion without verification evidence.
- If context is stale, use `goalkeeper-resume` before continuing.
- Subagents must use `.goalkeeper/compression-profile.md` by default.
- After code changes, review findings, fix actionable issues, then verify.
- After each step or commit, sync active docs before continuing.
