---
name: goalkeeper-plan
description: Break a Goalkeeper goal contract into phases, waves, steps, dependencies, acceptance checks, verification steps, and parallel subagent dispatch groups. Use after intake or research when the objective is clear enough to create an executable Phase/Wave/Step plan for a long-running LLM workflow.
---

# Goalkeeper Plan

Use this skill to create or revise `.goalkeeper/phase-plan.md`.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/goal-contract.md`, `.goalkeeper/context-ledger.md`, `.goalkeeper/decision-log.md`, existing `.goalkeeper/phase-plan.md`, and `.goalkeeper/next-target.md`.
2. Split the goal into phases.
3. Split each phase into waves.
4. Split each wave into steps.
5. For each phase, write:
   - stable phase id
   - status
   - purpose
   - dependencies
   - acceptance checks
6. For each wave, write:
   - stable wave id
   - status
   - dependencies
   - `Parallelizable: yes | no`
   - `Dispatch: main-agent | subagents`
   - merge requirements
7. For each step, write:
   - stable step id
   - status
   - owner
   - dependencies
   - inputs
   - expected output
   - acceptance checks
   - verification evidence expected
8. Mark independent steps in the same wave only when they can run without shared file conflicts or output dependencies.
9. Record planning assumptions in `.goalkeeper/context-ledger.md`.
10. Refresh `.goalkeeper/resume-snapshot.md` and `.goalkeeper/next-target.md`.

## Planning Rules

- Keep steps small enough to finish in one focused loop.
- Put decision-making phases before implementation phases.
- Put verification steps after risky implementation work.
- Do not mark a task executable if its inputs or acceptance checks are unclear.
- Prefer revisable phase plans over giant upfront plans.
- Use `docs/parallelization.md` before marking a wave parallelizable.
- Use `docs/subagent-policy.md` for subagent prompt constraints.
