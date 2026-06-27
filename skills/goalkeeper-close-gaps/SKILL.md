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

1. Read `.goalkeeper/always-read.md` and `.goalkeeper/config.json`.
2. Read the gap report.
3. If no gap report exists or the target phase is not known, do not invent gaps; route to `goalkeeper-analyze-phase`.
4. If the gap report is already invalidated and archive exists, do not redo closure; route to `goalkeeper-next`.
5. Read `.goalkeeper/phase-plan.md`, compact root logs, `.goalkeeper/next-target.md`, and scoped files for the target phase under `.goalkeeper/phases/`.
6. Convert gaps into closure phase/wave/step plan and create/update scoped step files for each closure item.
7. Execute missing work using normal `goalkeeper-execute` rules.
8. Verify using `goalkeeper-verify`.
9. Re-run `goalkeeper-analyze-phase`.
10. If all gaps are closed:
   - write/archive phase report in `.goalkeeper/archive/`
   - mark phase complete
   - update gap report `Status: invalidated`
   - record archive path and commit hashes
11. If gaps remain, update same gap file with remaining items and next closure target.
12. Sync scoped phase/wave/step files first, then root indexes.

## Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- Do not bypass `always-read.md`.
- Do not skip review after code changes.
- Do not invalidate gap report until archive exists.
- Ask user only if evidence conflict remains low-confidence after git/code inspection.
- Keep closure details in scoped step files; root gap file is the missing-work summary.
- End with exactly one route: `Next: $goalkeeper-execute`, `Next: $goalkeeper-verify`, `Next: $goalkeeper-analyze-phase`, or `Next: $goalkeeper-next`.
