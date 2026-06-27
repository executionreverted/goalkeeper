# Next Target

Updated: pending
Confidence: low

## Current Active Scope

Phase: PHASE-0000: Bootstrap Goalkeeper
Wave: WAVE-0000-A: Discovery
Step: STEP-0000-A-01: Run new-project discovery

## Next Phase Target

Run `goalkeeper-new-project` with the user's raw idea, then replace the bootstrap plan.

## Why

Goalkeeper has been initialized but no project-specific discovery has been completed yet.

## Required Sync After Each Step Or Commit

- Update active phase/wave/step files under `phases/`.
- Update `phase-plan.md` index statuses.
- Update root `progress-log.md` only as a compact index.
- Update root `verification-log.md` only as a compact index when checks run.
- Update root `decision-log.md` only for cross-phase decisions.
- Update `resume-snapshot.md`.
- Update this file.

## Conflict Policy

If docs and code disagree, inspect git status, git diff, recent commits, then code. If confidence stays low, ask user what to trust or do next.
