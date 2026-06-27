# Goalkeeper Loop Spec

## Loop States

```text
inactive
new_project
interrogating
intake
clarifying
researching
deciding
planning
executing
verifying
snapshotting
waiting_for_user
blocked
done
```

## Loop Contract

Every iteration must:

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/resume-snapshot.md`, and the relevant active artifacts.
2. Select the next phase, wave, and step from `.goalkeeper/phase-plan.md`.
3. Load only the context required for that state.
4. Perform one bounded unit of work.
5. Write progress, decisions, wave dispatch results, and verification evidence.
6. Refresh `.goalkeeper/resume-snapshot.md`.
7. Continue automatically when policy allows it.

`scripts/goalkeeper-loop.sh <project-dir>` emits the deterministic loop card for the current iteration. The LLM performs the work; the script does not edit product code.

## Stop Conditions

Stop and ask the user when:

- The goal contract is incomplete.
- The project seed is still too vague to form a goal contract.
- The requested phase does not exist.
- A requested phase is already archived and the user may only want confirmation.
- A later phase is requested while an earlier/dependency phase is still open.
- The next step changes product direction.
- A destructive action is needed.
- External publishing, deploy, PR creation, payment, email, or account change is required.
- Credentials or private access are missing.
- Verification fails repeatedly and a new strategy is required.
- The active autonomy level does not allow the next action.

## Done Conditions

Mark a goal done only when:

- Every success criterion in `goal-contract.md` is satisfied.
- Required verification is recorded in `verification-log.md`.
- `phase-plan.md` has no open required phases, waves, or steps.
- `resume-snapshot.md` includes the final state and no dangling blockers.

## Autonomy Levels

- `A0`: Analyze only. Do not edit files or run side-effectful tools.
- `A1`: Plan and wait for approval before execution.
- `A2`: Execute low-risk local work and report.
- `A3`: Run local verify/fix loops automatically.
- `A4`: Prepare external actions but request approval before publishing.

## Phase/Wave/Step Planning

Plan execution as:

```text
Phase -> Wave -> Step
```

- `Phase`: milestone-like body of work.
- `Wave`: group of steps that can start after same dependencies.
- `Step`: smallest executable and verifiable unit.

Parallel waves may dispatch independent steps to subagents. Main agent must integrate and verify results before marking the wave done.

## New Project Gate

Before a goal contract exists, run:

```text
New Project -> Interrogate -> Clarify
```

- `New Project`: capture the raw project idea in `.goalkeeper/project-seed.md`.
- `Interrogate`: ask one grill-style question at a time and record answers in `.goalkeeper/discovery-log.md`.
- `Clarify`: hand off to `goalkeeper-intake` once boundaries are stable enough for `.goalkeeper/goal-contract.md`.

In a user's project, `New Project` starts after `scripts/goalkeeper-init.sh` has created `.goalkeeper/`.

Use `scripts/goalkeeper-new-project.sh <project-dir> --idea "<raw idea>"` to write the initial intake packet. The first discovery question should identify the first real user and the exact job they need done.

## Mandatory Always-Read File

Before any phase, wave, step, resume, or subagent dispatch, read `.goalkeeper/always-read.md`. It contains non-negotiable workflow invariants: Context7 policy, Goalkeeper compression profile, review after code, verification, pause/snapshot rules, and resume conflict policy.

## Next Target

After every completed step, verification, pause, or commit, update `.goalkeeper/next-target.md`. This file stays phase-level. It records current active phase/wave/step plus the next larger phase target so the loop does not drift into tiny local step thinking.
