---
name: goalkeeper-close-gaps
description: Close gaps found by Goalkeeper phase analysis. Use with a phase number or .goalkeeper/gaps file path to read missing work, plan closure steps, execute/verify them under normal Goalkeeper rules, archive the phase when complete, and invalidate the gap report.
---

# Goalkeeper Close Gaps

Use this skill to close `.goalkeeper/gaps/*` reports.

## Inputs

Require one:

- phase id, e.g. `PHASE-0004`
- gap file path, e.g. `.goalkeeper/gaps/PHASE-0004-gaps.md`

## Workflow

1. Read `.goalkeeper/always-read.md`.
2. Read the gap report.
3. Read `.goalkeeper/phase-plan.md`, `.goalkeeper/verification-log.md`, `.goalkeeper/progress-log.md`, and `.goalkeeper/next-target.md`.
4. Convert gaps into closure phase/wave/step plan.
5. Execute missing work using normal `goalkeeper-execute` rules.
6. Verify using `goalkeeper-verify`.
7. Re-run `goalkeeper-analyze-phase`.
8. If all gaps are closed:
   - write/archive phase report in `.goalkeeper/archive/`
   - mark phase complete
   - update gap report `Status: invalidated`
   - record archive path and commit hashes
9. If gaps remain, update same gap file with remaining items and next closure target.

## Rules

- Do not bypass `always-read.md`.
- Do not skip review after code changes.
- Do not invalidate gap report until archive exists.
- Ask user only if evidence conflict remains low-confidence after git/code inspection.
