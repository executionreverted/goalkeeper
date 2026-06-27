# Goalkeeper Architecture

Goalkeeper is an artifact-driven harness for long-running LLM work. Its core rule is simple: do not trust chat history as the source of truth. Persist the goal, context, decisions, phase plan, verification evidence, and resume state as small files that any future loop can reload.

## Operating Model

Goalkeeper starts with a project-shaping gate, then runs an artifact-backed goal loop:

```text
New Project -> Interrogate -> Clarify -> Research/Decide -> Plan -> Execute -> Verify -> Snapshot -> Continue
```

Research and decisions are conditional gates, not mandatory commands every cycle. Snapshot means syncing scoped phase/wave/step files, compact root indexes, `resume-snapshot.md`, and `next-target.md` so the next session can continue.

The loop is allowed to continue with minimal user action while the goal remains active. It must stop for user input only when the next step requires product judgment, high-risk action, missing credentials, destructive changes, external publishing, or an ambiguity that would materially change the result.

## Layers

- `docs/`: Design contracts for the harness itself.
- `.goalkeeper/`: Active project seed, discovery notes, and working state for the current goal.
- `templates/`: Copyable artifact shapes for new goals, decisions, phases, waves, steps, and verification records.
- `skills/`: Codex-compatible procedural skills that operate each part of the loop.
- `scripts/`: Local install/init scripts for v0.1.

## Design Principles

- Persist state after every meaningful loop.
- Prefer one project-level goal contract over scattered notes.
- Keep steps small enough to execute and verify independently.
- Group independent steps into waves for parallel subagent dispatch.
- Use compressed subagent prompts by default to reduce token spend.
- Separate decisions from progress logs.
- Require evidence before marking work done.
- Resume from artifacts first, then use chat history only as supporting context.
- Start single-agent and artifact-driven; add multi-agent roles only when bottlenecks are clear.

## Project Start Gate

`goalkeeper-new-project` captures the raw idea in `project-seed.md` and uses a grill-style interview to fill `discovery-log.md`. It does not plan implementation. Its job is to make the project boundaries clear enough for `goalkeeper-intake` to convert them into a durable project-level `goal-contract.md` with a short phase-goal map.

## v0.1 Runtime Surface

Goalkeeper v0.1 is not a daemon or full CLI runtime. It ships:

- `scripts/install-skills.sh`: install `goalkeeper-*` skills into Codex skills dir.
- `scripts/goalkeeper-init.sh`: create `.goalkeeper/` artifacts in a user's project.
- `scripts/goalkeeper-status.sh`: inspect current state.
- `scripts/goalkeeper-next.sh`: select next step or wave without executing.
- `scripts/goalkeeper-pause.sh`: sync state and stop without advancing.
- `scripts/goalkeeper-validate.sh`: check required artifacts and git/doc sync risk.
- Goalkeeper skills: operate over the target project's `.goalkeeper/` folder.

## Inspired Patterns

- LangGraph: durable execution, checkpointing, interrupts, resume/time travel.
- CrewAI: typed flow state and explicit workflow routing.
- AutoGen: termination conditions and save/load state.
- Aider: repository map, git-aware edits, test/lint loop.
- Plandex: plan-first execution and reviewable diffs.
- OpenHands: sandbox boundaries and explicit automation surfaces.
- SWE-agent: simple, hackable, config-driven agent interfaces.
