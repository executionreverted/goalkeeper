---
name: goalkeeper-plan
description: Break a Goalkeeper goal contract into phases, waves, steps, dependencies, acceptance checks, verification steps, and parallel subagent dispatch groups. Use after intake or research when the objective is clear enough to create an executable Phase/Wave/Step plan for a long-running LLM workflow.
---

# Goalkeeper Plan

Use this skill to create or revise the compact `.goalkeeper/phase-plan.md` index and the scoped files under `.goalkeeper/phases/`.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/config.json`, `.goalkeeper/goal-contract.md`, `.goalkeeper/context-ledger.md`, `.goalkeeper/decision-log.md`, existing `.goalkeeper/phase-plan.md`, `.goalkeeper/next-target.md`, and any active files under `.goalkeeper/phases/`.
2. If the project-level goal contract is missing, vague, or still says `Pending discovery`, do not plan; route to `goalkeeper-intake`.
3. If the existing phase plan already matches the current goal contract and no contract/decision changed, do not rewrite it; route to next execution.
4. Use accepted `DEC-*` records and active `RSR-*` records as planning inputs.
5. If a required technical/product choice has no accepted decision or active research record, route to `goalkeeper-research`.
6. Split the goal into phases.
7. Split each phase into waves.
8. Split each wave into steps.
9. Keep `.goalkeeper/phase-plan.md` as the compact index: ids, titles, statuses, dependencies, dispatch mode, acceptance checks, and verification evidence refs.
10. For each phase, create `.goalkeeper/phases/PHASE-0000-short-title/phase.md` and write:
   - stable phase id
   - status
   - purpose
   - dependencies
   - acceptance checks
   - wave list
   - phase progress, decisions, and verification notes
11. For each wave, create `.goalkeeper/phases/<phase>/waves/WAVE-0000-A-short-title/wave.md` and write:
   - stable wave id
   - status
   - dependencies
   - `Parallelizable: yes | no`
   - `Dispatch: main-agent | subagents`
   - merge requirements
   - step list
   - wave progress and verification notes
12. For each step, create `.goalkeeper/phases/<phase>/waves/<wave>/steps/STEP-0000-A-01-short-title.md` and write:
   - stable step id
   - status
   - owner
   - dependencies
   - inputs
   - expected output
   - acceptance checks
   - verification evidence expected
   - changed files, commands, decisions, and notes placeholders
13. Use 3-4 word lowercase slug suffixes after ids, e.g. `PHASE-0002-todo-core`, `WAVE-0002-A-task-behavior`, `STEP-0002-A-01-create-task-flow.md`.
14. Mark independent steps in the same wave only when they can run without shared file conflicts or output dependencies.
15. Update `Phase goals` in `.goalkeeper/goal-contract.md` with one short goal per phase.
16. Record planning assumptions in `.goalkeeper/context-ledger.md`.
17. Refresh `.goalkeeper/resume-snapshot.md` and `.goalkeeper/next-target.md`.

## Planning Rules

- Keep steps small enough to finish in one focused loop.
- Put decision-making phases before implementation phases.
- Put verification steps after risky implementation work.
- Do not mark a step executable if its inputs or acceptance checks are unclear.
- Prefer revisable phase plans over giant upfront plans.
- Use `docs/parallelization.md` before marking a wave parallelizable.
- Use `docs/subagent-policy.md` for subagent prompt constraints.
- Do not put detailed step progress into root logs; root logs are compact indexes.
- Do not move detailed phase acceptance checks into `goal-contract.md`; keep contract phase goals short.
- Do not ignore accepted decisions or active research records when planning.
- End with `Next: $goalkeeper-loop` or `Next: $goalkeeper-execute`.
