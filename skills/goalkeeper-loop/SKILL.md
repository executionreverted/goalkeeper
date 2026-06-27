---
name: goalkeeper-loop
description: Use when a user wants Goalkeeper to continue work with minimal prompts, run the next goal-loop cycle, keep going safely, or behave like a GSD-style workflow harness in an initialized project.
---

# Goalkeeper Loop

Act as the Goalkeeper orchestrator: find the next valid action, perform it when safe, sync state, verify/commit when required, then continue while policy allows.

## Workflow

1. Read `.goalkeeper/always-read.md`, `config.json`, `resume-snapshot.md`, `next-target.md`, `goal-contract.md`, `phase-plan.md`, and the active scoped phase/wave/step files under `.goalkeeper/phases/`.
2. If `.goalkeeper/` is missing, do not ask the user to run CLI commands; stop with `Next: $goalkeeper-new-project`.
3. If required root files or `.goalkeeper/policies/*.md` are missing, repair them yourself with `goalkeeper init <project-dir>` or `npx --yes @goalkpr/goalkeeper init <project-dir>` before deciding the loop is blocked.
4. Prefer running `goalkeeper loop <project-dir>` or `npx --yes @goalkpr/goalkeeper loop <project-dir>` yourself.
5. Run `goalkeeper validate <project-dir>` or `npx --yes @goalkpr/goalkeeper validate <project-dir>` yourself before edits when available.
6. Follow the loop card by applying the matching workflow directly; do not merely recommend another skill when the action is safe:
   - `verify`: run checks, record evidence, update statuses.
   - `interrogate`: ask one discovery question, record answer, continue or hand off to intake.
   - `main-agent`: apply the `goalkeeper-execute` workflow for one bounded step, then continue into verify when policy allows.
   - `subagents`: dispatch independent briefs with `.goalkeeper/compression-profile.md`, integrate, then verify.
   - `blocked`: inspect docs, git, commits, and code before asking user.
   - skipped dependency guard: ask whether to continue later or handle the open phase first.
7. Sync active scoped files first, then `phase-plan.md`, compact root logs, `resume-snapshot.md`, and `next-target.md`.
8. In `verify` mode, after checks pass and docs are synced, commit code plus Goalkeeper artifacts before moving to the next step when the project is a git repo and `commit_docs` is true.
9. End with exactly one recommended command or stop reason.
10. Repeat from step 4 only if autonomy allows and no stop condition fired.

## Stop Conditions

- Goal contract is vague or missing after CLI repair.
- Direction/product decision changed.
- Destructive, external, paid, deploy, publish, PR, account, email, or credential action is needed.
- Verification fails repeatedly.
- Docs and code conflict and confidence remains low after inspection.

## Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- Keep user updates short.
- Do not claim done without evidence.
- Do not bury pause requests; use `goalkeeper-pause`.
- Keep next target phase-level.
- Do not continue when the loop card says an earlier/dependency phase is open unless the user confirms.
- Keep root logs compact; detailed loop output belongs in the scoped step file.
- `goalkeeper-next` is read-only routing; `goalkeeper-loop` is active orchestration.
- Do not stop just to say `Next: $goalkeeper-execute` or `Next: $goalkeeper-verify` when the action is local, safe, and allowed. Run the corresponding workflow inside the loop.
- Only recommend another skill instead of acting when the required action is blocked by missing context, approval, unsafe scope, failed verification, or autonomy limits.
- Use exact skill syntax in replies, e.g. `Next: $goalkeeper-new-project`, not prose labels like `Goalkeeper New Project`.
- Do not tell the user to run `goalkeeper`, `npx`, or shell commands as the next step; those are internal helper calls for the agent.
- Do not advance past a verified step in a git repo until the post-verification commit has succeeded or the blocker is recorded.
