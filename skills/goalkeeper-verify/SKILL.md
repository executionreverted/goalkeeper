---
name: goalkeeper-verify
description: Verify Goalkeeper step, wave, phase, and goal outputs before completion claims. Use after execution, before marking steps, waves, phases, or goals done, when tests, lint, artifact inspection, source checks, acceptance criteria, or residual-risk notes are needed.
---

# Goalkeeper Verify

Use this skill to decide whether a step, wave, phase, or goal can move from `needs_review` to `done`.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/goal-contract.md`, `.goalkeeper/phase-plan.md`, `.goalkeeper/next-target.md`, `.goalkeeper/progress-log.md`, `.goalkeeper/verification-log.md`, and the active scoped phase/wave/step files under `.goalkeeper/phases/`.
2. Identify the step, wave, and phase acceptance checks plus expected evidence.
3. For phase-level verification, prefer `scripts/goalkeeper-analyze-phase.sh <project-dir> <phase-id>` when available.
4. If the phase is already archived and no open gap exists, say it is already complete and ask whether to run a deeper docs/code/commit verification pass.
5. If the phase id is missing or wrong, stop and ask which suggested phase the user meant.
6. Run or inspect the minimum sufficient verification.
7. Record exact evidence in the active step file first.
8. Roll wave/phase verification summaries up only when the evidence is relevant at that level.
9. Update `.goalkeeper/verification-log.md` only as a compact index pointing to scoped evidence.
10. Update statuses:
   - `done` when checks pass.
   - `blocked` when checks cannot run and the missing condition matters.
   - `ready` or `in_progress` when more execution is needed.
11. Mark a wave done only after all required steps pass.
12. Mark a phase done only after all required waves pass.
13. Refresh `.goalkeeper/resume-snapshot.md`.
14. Refresh `.goalkeeper/next-target.md`.

## Verification Rules

- Evidence beats assertion.
- Use concrete outputs: command results, diff summaries, screenshots, source links, or user-visible artifacts.
- Record residual risk when verification is partial.
- Do not mark the overall goal done until all project success criteria and phase goals in `goal-contract.md` are satisfied or explicitly superseded.
- Do not silently re-verify archived phases; ask before spending time on deep verification.
- Root verification log is an index; detailed output belongs in the scoped step/wave/phase files.
