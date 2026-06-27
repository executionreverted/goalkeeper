# Goalkeeper State Schema

Goalkeeper uses Markdown artifacts because they are human-readable, diffable, and easy for an LLM to reload. Runtime code may later mirror these files into JSON.

## Required Active Files

- `.goalkeeper/active-goal.md`: one-line pointer to the active goal and status.
- `.goalkeeper/always-read.md`: mandatory invariant checklist read before each phase/wave/step/resume.
- `.goalkeeper/compression-profile.md`: built-in token discipline profile for subagents and bounded loop cards.
- `.goalkeeper/project-seed.md`: raw project idea before it becomes a goal.
- `.goalkeeper/discovery-log.md`: grill-style questions, answers, recommended defaults, and unresolved branches.
- `.goalkeeper/goal-contract.md`: objective, constraints, autonomy, success criteria.
- `.goalkeeper/context-ledger.md`: durable facts learned during intake and research.
- `.goalkeeper/decision-log.md`: decisions with rationale and date.
- `.goalkeeper/phase-plan.md`: canonical Phase/Wave/Step plan with dependencies and parallelization.
- `.goalkeeper/next-target.md`: phase-level next target plus current active phase/wave/step.
- `.goalkeeper/task-queue.md`: legacy flat task queue; keep only while migrating old goals.
- `.goalkeeper/progress-log.md`: chronological work log.
- `.goalkeeper/verification-log.md`: evidence for completed work.
- `.goalkeeper/resume-snapshot.md`: compact state for context recovery.
- `.goalkeeper/archive/`: completed phase reports with commit evidence.
- `.goalkeeper/gaps/`: open or invalidated phase gap reports.

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
```

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
```
