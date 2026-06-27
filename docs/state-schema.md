# Goalkeeper State Schema

Goalkeeper uses Markdown artifacts because they are human-readable, diffable, and easy for an LLM to reload. Runtime code may later mirror these files into JSON.

## Required Active Files

- `.goalkeeper/active-goal.md`: one-line pointer to the active goal and status.
- `.goalkeeper/always-read.md`: mandatory invariant checklist read before each phase/wave/step/resume.
- `.goalkeeper/compression-profile.md`: built-in token discipline profile for subagents and bounded loop cards.
- `.goalkeeper/config.json`: machine-readable workflow settings used by routing, validation, and future tools.
- `.goalkeeper/project-seed.md`: raw project idea before it becomes a goal.
- `.goalkeeper/discovery-log.md`: grill-style questions, answers, recommended defaults, and unresolved branches.
- `.goalkeeper/goal-contract.md`: project-level objective, project success criteria, phase goal summary, constraints, autonomy, and approval boundaries.
- `.goalkeeper/context-ledger.md`: durable facts learned during intake and research.
- `.goalkeeper/decision-log.md`: cross-phase decisions with rationale and date.
- `.goalkeeper/phase-plan.md`: compact canonical Phase/Wave/Step index with dependencies and parallelization.
- `.goalkeeper/next-target.md`: phase-level next target plus current active phase/wave/step.
- `.goalkeeper/task-queue.md`: legacy flat task queue; keep only while migrating old goals.
- `.goalkeeper/progress-log.md`: compact chronological index that points to scoped files.
- `.goalkeeper/verification-log.md`: compact verification index that points to scoped evidence.
- `.goalkeeper/resume-snapshot.md`: compact state for context recovery.
- `.goalkeeper/codebase/`: compact repository map used to avoid rediscovering structure every loop.
- `.goalkeeper/quick/`: small tracked ad-hoc tasks outside the phase plan.
- `.goalkeeper/ship/`: ship readiness packets, PR/release drafts, and approval evidence.
- `.goalkeeper/phases/`: detailed phase/wave/step working artifacts.
- `.goalkeeper/archive/`: completed phase reports with commit evidence.
- `.goalkeeper/gaps/`: open or invalidated phase gap reports.

## Scoped Work Artifacts

Detailed work belongs under phase folders, not root logs:

```text
.goalkeeper/phases/
  PHASE-0002-todo-core/
    phase.md
    waves/
      WAVE-0002-A-task-behavior/
        wave.md
        steps/
          STEP-0002-A-01-create-task-flow.md
```

Use ids plus 3-4 word lowercase slugs so files are searchable and cherry-pickable.

Every phase, wave, and step in `phase-plan.md` must have its expected scoped artifact. Closed steps must also have closed status and verification evidence in their scoped step file.

## Quick Task Shape

Quick tasks live outside `phase-plan.md`:

```text
.goalkeeper/quick/
  20260627-120000-fix-readme-typo/
    quick.md
```

`quick.md` carries status, request, changed files, commands, verification, summary, and a next route. Promote quick work to a phase only when it grows beyond one focused loop.

## Codebase Map Shape

Codebase memory lives under `.goalkeeper/codebase/`:

```text
.goalkeeper/codebase/
  structure.md
  architecture.md
  stack.md
  testing.md
  conventions.md
  integrations.md
  risks.md
```

The generated map is intentionally compact and evidence-first. Refresh it after major folder, framework, test, or integration changes.

## Ship Packet Shape

Ship packets live under `.goalkeeper/ship/`:

```text
.goalkeeper/ship/
  20260627-120000-ship-readiness.md
```

Packets record blockers, open work, gaps, archive evidence, verification count, git state, recent commits, draft PR body, and the approval gate. They do not authorize external actions by themselves.

## Work Statuses

```text
todo
ready
in_progress
needs_review
blocked
verified
done
skipped
```

## Config Shape

```json
{
  "version": 1,
  "autonomy_level": "A1",
  "context7": "unknown",
  "research_enabled": true,
  "verifier_enabled": true,
  "review_required_before_done": true,
  "subagent_policy": "safe_parallel",
  "commit_docs": true,
  "model_profile": "inherit",
  "ship_requires_approval": true,
  "branch_strategy": "current_branch"
}
```

Accepted values:

- `autonomy_level`: `A0 | A1 | A2 | A3 | A4`
- `context7`: `yes | no | unknown`
- `subagent_policy`: `main_only | safe_parallel | aggressive_parallel`
- `model_profile`: `inherit | budget | balanced | quality`
- `branch_strategy`: `current_branch | phase_branch | worktree`

`commit_docs: true` means a git-backed project should commit after verification passes for a step or quick task. The commit should include both product changes and the matching `.goalkeeper` evidence updates.

## Project Seed Shape

```text
Raw idea:
User motivation:
Target user:
Problem:
Desired outcome:
Initial constraints:
Unknowns:
Seed status:
```

## Goal Contract Shape

```text
Contract scope:
Project-level. This file defines the whole project goal, not a single phase.

Project goal:

Project success criteria:

Phase goals:
- PHASE-0001:

Non-goals:
Constraints:
User preferences:
Autonomy level:
Approval required for:
Current phase:
Definition of done:
```

Phase goals in `goal-contract.md` are short project-map entries. Detailed phase purpose, acceptance checks, decisions, and verification live in `.goalkeeper/phases/<phase>/phase.md`.

## Next Target Shape

```text
Current Active Scope:
Phase:
Wave:
Step:

Next Phase Target:

Recommended Command:
$goalkeeper-...
```

`Recommended Command` is the single next skill the agent should suggest unless it must stop for user input.

## Decision Record Shape

```text
## DEC-0001: Title

Date:
Status: proposed | accepted | superseded
Context:
Options:
Decision:
Rationale:
Consequences:
Supersedes:
```

## Research Record Shape

Research records live in `context-ledger.md` under `## Research Records`.

```text
### RSR-0001: Title

Status: proposed | accepted | superseded
Question:
Normalized question:
Scope:
Sources:
- source
Decision links:
- DEC-0001
Last checked:
Freshness:
Result:
```

`Normalized question` is a lowercase canonical form used to prevent duplicate research. Active records (`proposed` or `accepted`) must not share the same normalized question. Decision links must point to real `DEC-*` records.

## Phase/Wave/Step Shape

```text
## PHASE-0001: Title

Status:
Goal link:
Depends on:
Purpose:
Acceptance checks:

### WAVE-0001-A: Title

Status:
Parallelizable: yes | no
Depends on:
Dispatch: main-agent | subagents

#### STEP-0001-A-01: Title

Status:
Owner:
Inputs:
Expected output:
Acceptance checks:
Verification evidence:
Notes:
Changed files:
Commands:
Decisions:
```
