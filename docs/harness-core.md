# Harness Core

Goalkeeper v0.1 harness is introspective, not autonomous runtime.

## Scripts

- `scripts/goalkeeper-status.sh`: summarize persisted state.
- `scripts/goalkeeper-next.sh`: find next actionable phase/wave/step without executing.
- `scripts/goalkeeper-loop.sh`: emit the next bounded goal-loop cycle card.
- `scripts/goalkeeper-new-project.sh`: write the initial intake packet from a raw idea.
- `scripts/goalkeeper-pause.sh`: sync resume snapshot and stop without advancing.
- `scripts/goalkeeper-validate.sh`: check required artifacts and surface git/doc sync risk.
- `scripts/goalkeeper-analyze-phase.sh`: archive completed phases or write gap reports.
- `scripts/goalkeeper-state.cjs`: schema-aware parser used by status, next, validate, and analyze-phase.
- `scripts/goalkeeper-init.sh`: create `.goalkeeper/` in target project.
- `scripts/install-skills.sh`: install Goalkeeper skills.

## Behavior

```text
always-read -> load invariants
status -> inspect
next -> select
new-project -> raw idea intake packet
loop -> one bounded cycle card
pause -> sync and stop
validate -> parse/check required state
analyze-phase -> archive or gap report
```

No script calls LLMs. No script edits product code. Scripts only read/write Goalkeeper artifacts.
`goalkeeper-loop.sh` is an orchestration card for the agent, not an autonomous shell executor.

## Parser Contract

`goalkeeper-state.cjs` parses compact `phase-plan.md` into:

- phases
- waves
- steps
- statuses
- dispatch metadata
- verification evidence refs

Wrappers must use parser output instead of ad hoc grep/awk scanning. Agents then load the matching scoped files under `.goalkeeper/phases/` for detail.

## Always-Read Contract

Every behavior must treat `.goalkeeper/always-read.md` as required context. If missing, `validate` should fail when added, and agents should recreate it from template before continuing.

## Pause Contract

Pause must:

- not advance to next step
- refresh `resume-snapshot.md`
- sync active scoped files
- append compact `progress-log.md` index entries only when useful
- preserve next action for later resume
- preserve phase-level next target
- avoid completion claims without verification

## Next Contract

Next must:

- prefer `ready`
- then `in_progress`
- then `needs_review`
- then `blocked`
- report dispatch mode
- not execute work

## Loop Contract

Loop must:

- run one bounded cycle at a time
- validate state before edits when possible
- follow mode from parser: `interrogate`, `verify`, `main-agent`, `subagents`, `blocked`, or `none`
- block and ask when a hinted/requested phase skips an open earlier or dependency phase
- sync scoped state after action, then root indexes
- continue only while autonomy and stop conditions allow

## Edge Guards

Goalkeeper must avoid silent drift:

- Missing phase id: suggest nearest phases and ask user which one.
- Already archived phase with no open gap: report already complete and offer deeper docs/code/commit verification.
- Later phase requested while earlier/dependency phase is open: block and ask whether to continue later or handle the open phase first.
- Archive/gap conflict: prefer explicit gap status and validation output over assumptions.

## Sync Contract

After each step or commit, sync:

- active files under `.goalkeeper/phases/<phase>/waves/<wave>/steps/`
- parent `wave.md` and `phase.md` when wave/phase state changed
- `phase-plan.md` as compact index
- `progress-log.md` as compact index
- `verification-log.md` as compact index when checks ran
- `decision-log.md` only when cross-phase decisions changed
- `resume-snapshot.md`
- `next-target.md`

If docs conflict with code, inspect git status, diff, recent commits, and source files before deciding. Ask user only when confidence is low.

## Next Target Contract

`next-target.md` is high-level. It must not become just the next step. It records:

- current active phase/wave/step
- next phase target
- confidence
- why this target is correct
- sync requirements after step or commit
