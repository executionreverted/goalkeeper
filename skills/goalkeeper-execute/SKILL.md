---
name: goalkeeper-execute
description: Execute the next ready Goalkeeper phase, wave, or step using the active goal contract, phase plan, tool policy, progress artifacts, and subagent dispatch rules. Use when goal mode should continue with minimal user action and the next step or parallel wave is local, bounded, and allowed by the current autonomy level.
---

# Goalkeeper Execute

Use this skill to perform the next bounded step or dispatch a parallel wave.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/resume-snapshot.md`, `.goalkeeper/next-target.md`, `.goalkeeper/goal-contract.md`, `.goalkeeper/phase-plan.md`, `.goalkeeper/progress-log.md`, and the active phase/wave/step files under `.goalkeeper/phases/`.
2. Select the first `ready` step whose phase and wave dependencies are satisfied.
3. Check `.goalkeeper/goal-contract.md` autonomy level and `docs/tool-policy.md`.
4. If the next action requires approval, stop and ask one clear question.
5. If the wave is parallelizable, dispatch independent steps to subagents using `docs/subagent-policy.md` and `.goalkeeper/compression-profile.md`.
6. Mark selected step or wave `in_progress`.
7. Execute only the work needed for that step or integrate subagent results for that wave.
8. Update the active step file with changed files, commands, artifacts, decisions, failed attempts, and subagent results.
9. Update the active wave and phase files only with wave/phase-level progress, merge notes, or verification summaries.
10. Update `.goalkeeper/phase-plan.md` statuses/evidence refs and root `.goalkeeper/progress-log.md` only as a compact index pointing to scoped files.
11. Move the step or wave to `needs_review` or `blocked`; use `goalkeeper-verify` before `done`.
12. Refresh `.goalkeeper/resume-snapshot.md` and `.goalkeeper/next-target.md`.

## Execution Rules

- Do not expand scope opportunistically.
- Do not hide failed attempts; log them briefly.
- Do not claim completion without verification evidence.
- If context is stale, use `goalkeeper-resume` before continuing.
- Subagents must use `.goalkeeper/compression-profile.md` by default.
- After code changes, review findings, fix actionable issues, then verify.
- After each step or commit, sync active docs before continuing.
- Never dump long execution details into root logs; put them in the scoped step file.
