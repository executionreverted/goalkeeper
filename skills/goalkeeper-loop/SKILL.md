---
name: goalkeeper-loop
description: Use when a user wants Goalkeeper to continue work with minimal prompts, run the next goal-loop cycle, keep going safely, or behave like a GSD-style workflow harness in an initialized project.
---

# Goalkeeper Loop

Run one bounded loop cycle at a time; continue only while policy allows.

## Workflow

1. Read `.goalkeeper/always-read.md`, `resume-snapshot.md`, `next-target.md`, `goal-contract.md`, and `phase-plan.md`.
2. Prefer `scripts/goalkeeper-loop.sh <project-dir>` when available.
3. Run `scripts/goalkeeper-validate.sh <project-dir>` before edits when available.
4. Follow the loop card:
   - `verify`: run checks, record evidence, update statuses.
   - `interrogate`: ask one discovery question, record answer, continue or hand off to intake.
   - `main-agent`: execute one bounded step, then verify.
   - `subagents`: dispatch independent briefs with `.goalkeeper/compression-profile.md`, integrate, then verify.
   - `blocked`: inspect docs, git, commits, and code before asking user.
   - skipped dependency guard: ask whether to continue later or handle the open phase first.
5. Sync `phase-plan.md`, `progress-log.md`, `verification-log.md`, `resume-snapshot.md`, and `next-target.md`.
6. Repeat from step 2 only if autonomy allows and no stop condition fired.

## Stop Conditions

- Goal contract is vague or missing.
- Direction/product decision changed.
- Destructive, external, paid, deploy, publish, PR, account, email, or credential action is needed.
- Verification fails repeatedly.
- Docs and code conflict and confidence remains low after inspection.

## Rules

- Keep user updates short.
- Do not claim done without evidence.
- Do not bury pause requests; use `goalkeeper-pause`.
- Keep next target phase-level.
- Do not continue when the loop card says an earlier/dependency phase is open unless the user confirms.
