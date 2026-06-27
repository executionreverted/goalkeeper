---
name: goalkeeper-execute
description: Execute the next ready Goalkeeper phase, wave, or step using the active goal contract, phase plan, tool policy, progress artifacts, and subagent dispatch rules. Use when goal mode should continue with minimal user action and the next step or parallel wave is local, bounded, and allowed by the current autonomy level.
---

# Goalkeeper Execute

Use this skill to perform the next bounded step or dispatch a parallel wave.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/config.json`, `.goalkeeper/resume-snapshot.md`, `.goalkeeper/next-target.md`, `.goalkeeper/goal-contract.md`, `.goalkeeper/phase-plan.md`, `.goalkeeper/progress-log.md`, and the active phase/wave/step files under `.goalkeeper/phases/`.
2. If `.goalkeeper/policies/tool-policy.md`, `.goalkeeper/policies/subagent-policy.md`, or `.goalkeeper/policies/parallelization.md` is missing, repair with `goalkeeper init <project-dir>` or `npx --yes @goalkpr/goalkeeper init <project-dir>` before continuing.
3. Select the first `ready` or `in_progress` step whose phase and wave dependencies are satisfied.
4. If no phase plan exists or only bootstrap planning exists, do not execute; route to `goalkeeper-new-project` or `goalkeeper-plan`.
5. If no executable step exists, do not perform filler work; run/consult `goalkeeper-next` and route to the recommended command.
6. If the next actionable item is `needs_review`, do not execute; route to `goalkeeper-verify`.
7. Check `.goalkeeper/goal-contract.md` autonomy level and `.goalkeeper/policies/tool-policy.md`.
8. If the next action requires approval, stop and ask one clear question.
9. If the wave is parallelizable, dispatch independent steps to subagents using `.goalkeeper/policies/subagent-policy.md` and `.goalkeeper/compression-profile.md`.
10. Mark selected step or wave `in_progress`.
11. Execute only the work needed for that step or integrate subagent results for that wave.
12. Update the active step file with changed files, commands, artifacts, decisions, failed attempts, and subagent results.
13. Update the active wave and phase files only with wave/phase-level progress, merge notes, or verification summaries.
14. Update `.goalkeeper/phase-plan.md` statuses/evidence refs and root `.goalkeeper/progress-log.md` only as a compact index pointing to scoped files.
15. Move the step or wave to `needs_review` or `blocked`; use `goalkeeper-verify` before `done`.
16. Refresh `.goalkeeper/resume-snapshot.md` and `.goalkeeper/next-target.md`.

## Execution Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- Do not expand scope opportunistically.
- Do not hide failed attempts; log them briefly.
- Do not claim completion without verification evidence.
- If context is stale, use `goalkeeper-resume` before continuing.
- Subagents must use `.goalkeeper/compression-profile.md` by default.
- Do not fallback to package-root `docs/` paths when project-local policies are missing; repair `.goalkeeper/policies/` first.
- After code changes, review findings, fix actionable issues, then verify.
- Do not mark a step `done` or advance to the next step from execute; route to verify first.
- Leave final step commits to `goalkeeper-verify` after verification passes, unless the user explicitly asks for a WIP commit.
- After each step or commit, sync active docs before continuing.
- Never dump long execution details into root logs; put them in the scoped step file.
- End with exactly one route: `Next: $goalkeeper-verify`, `Next: $goalkeeper-next`, or `Stop: <approval/blocker>`.
