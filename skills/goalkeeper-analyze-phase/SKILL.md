---
name: goalkeeper-analyze-phase
description: Analyze a Goalkeeper phase after it appears complete, compare phase waves/steps against git history and verification evidence, then write either an archive report or a gap report. Use when a phase finishes, before marking it complete, or when docs/code may be out of sync.
---

# Goalkeeper Analyze Phase

Use this skill after a phase is believed complete.

## Workflow

1. Read `.goalkeeper/always-read.md` and `.goalkeeper/config.json`.
2. Read `.goalkeeper/phase-plan.md`, compact root logs, `.goalkeeper/next-target.md`, `.goalkeeper/resume-snapshot.md`, and all scoped files for the target phase under `.goalkeeper/phases/<phase>/`.
3. Accept phase id, phase title, or explicit phase block.
4. Prefer running `goalkeeper analyze-phase <project-dir> <phase-id>` or `npx --yes @goalkpr/goalkeeper analyze-phase <project-dir> <phase-id>` when available.
5. If the phase does not exist, stop and ask which suggested phase the user meant.
6. If the phase is already archived and no open gap exists, say that and ask whether the user wants a deeper docs/code/commit verification pass.
7. If the phase still has open executable steps, do not archive; route to `goalkeeper-execute` or `goalkeeper-verify`.
8. Compare:
   - phase waves
   - phase steps
   - statuses
   - verification evidence
   - scoped step evidence
   - git status/diff/recent commits when available
9. If all required waves/steps are complete and verified:
   - write `.goalkeeper/archive/<phase>-report.md`
   - include commit hashes
   - include scoped artifact paths checked
   - update phase status if needed
   - update resume snapshot and next target
10. If gaps exist:
   - write `.goalkeeper/gaps/<phase>-gaps.md`
   - list missing waves/steps/evidence
   - include closure plan seed
11. If docs conflict with code/commits and confidence is low, ask one user question.

## Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- Do not mark phase complete without evidence.
- Code + verified artifacts beat stale docs.
- Keep output terse.
- Never silently continue past a missing phase, already-archived phase, or phase/dependency mismatch.
- Treat root logs as indexes; gap/archive judgment should inspect scoped phase/wave/step files.
- End with exactly one route: `Next: $goalkeeper-close-gaps`, `Next: $goalkeeper-next`, or `Stop: <question>`.
