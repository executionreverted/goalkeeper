# Gap Analysis

Goalkeeper analyzes gaps after a phase appears complete.

## Analyze Phase

Run:

```bash
bash scripts/goalkeeper-analyze-phase.sh <project-dir> PHASE-0001
```

Behavior:

- Read `.goalkeeper/always-read.md`.
- Read `.goalkeeper/phase-plan.md`.
- Read scoped files for the requested phase under `.goalkeeper/phases/`.
- Extract requested phase.
- Compare wave/step statuses, scoped artifact existence, scoped step evidence, and git history.
- If all required waves/steps are complete and scoped evidence exists, write `.goalkeeper/archive/<phase>-report.md`.
- If gaps exist, write `.goalkeeper/gaps/<phase>-gaps.md`.

`analyze-phase` must not archive a phase from `phase-plan.md` status alone.

## Close Gaps

Use `goalkeeper-close-gaps` with a phase id or gap file path.

Flow:

1. Read `always-read.md`.
2. Read gap report.
3. Create gap closure phase/wave/step plan with scoped step files.
4. Execute missing work using normal Goalkeeper rules.
5. Verify.
6. Re-run phase analysis.
7. If complete, archive phase and invalidate gap report.

Gap reports summarize missing work. Detailed closure attempts belong in scoped step files.

## Commit Evidence

Reports include recent commit hashes when target project has git.

If docs conflict with git/code:

- inspect `git status`
- inspect `git diff`
- inspect recent commits
- inspect code
- update phase state from evidence
- ask user only if confidence stays low
