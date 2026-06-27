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

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/config.json`, `.goalkeeper/resume-snapshot.md`, relevant compact files under `.goalkeeper/codebase/`, and the relevant active scoped artifacts under `.goalkeeper/phases/`.
2. Select the next phase, wave, and step from `.goalkeeper/phase-plan.md`.
3. Load only the context required for that state.
4. Perform one bounded unit of work.
5. Write progress, decisions, wave dispatch results, and verification evidence into the scoped step/wave/phase files.
6. Refresh `.goalkeeper/resume-snapshot.md`.
7. End with exactly one next recommended command or stop reason.
8. Continue automatically when policy allows it.

`goalkeeper loop <project-dir>` emits the deterministic loop card for the current iteration. The LLM performs the work; the CLI does not edit product code.

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

## Invalid Command Handling

If a user invokes a skill that does not match current state, Goalkeeper must not perform busywork. It should state the mismatch and recommend the single most valid next skill command.

Examples:

- Execute before planning: `Next: $goalkeeper-plan`.
- Verify before any `needs_review` step: `Next: $goalkeeper-execute`.
- Research repeated with no new question: reuse recorded evidence and `Next: $goalkeeper-plan`.

## Done Conditions

Mark a goal done only when:

- Every project success criterion in `goal-contract.md` is satisfied.
- Every phase goal listed in `goal-contract.md` is complete, skipped with rationale, or superseded by an accepted decision.
- Required verification is recorded in scoped step/wave/phase files and indexed in `verification-log.md`.
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

## Scoped Artifacts

`phase-plan.md` stays compact. Detailed work is stored like this:

```text
.goalkeeper/phases/PHASE-0002-short-title/
  phase.md
  waves/WAVE-0002-A-short-title/
    wave.md
    steps/STEP-0002-A-01-short-title.md
```

Root `progress-log.md` and `verification-log.md` are indexes that point to these files.

## New Project Gate

Before a goal contract exists, run:

```text
New Project -> Interrogate -> Clarify
```

- `New Project`: capture the raw project idea in `.goalkeeper/project-seed.md`.
- `Interrogate`: ask one grill-style question at a time and record answers in `.goalkeeper/discovery-log.md`.
- `Clarify`: hand off to `goalkeeper-intake` once boundaries are stable enough for `.goalkeeper/goal-contract.md`.

In a user's project, `New Project` starts after `goalkeeper init <project-dir>` or `npx --yes @goalkpr/goalkeeper init <project-dir>` has created `.goalkeeper/`.

Use `goalkeeper new <project-dir> --idea "<raw idea>"` to write the initial intake packet. The first discovery question should identify the first real user and the exact job they need done.

## Mandatory Always-Read File

Before any phase, wave, step, resume, or subagent dispatch, read `.goalkeeper/always-read.md` and `.goalkeeper/config.json`. They contain non-negotiable workflow invariants, machine-readable workflow settings, Context7 policy, Goalkeeper compression profile, review after code, verification, pause/snapshot rules, and resume conflict policy.

## Next Target

After every completed step, verification, pause, or commit, update `.goalkeeper/next-target.md`. This file stays phase-level. It records current active phase/wave/step plus the next larger phase target so the loop does not drift into tiny local step thinking.
