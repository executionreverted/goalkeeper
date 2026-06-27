# Always Read

Read this before every phase, wave, step, resume, or subagent dispatch.

## Mandatory Loop

1. Load `config.json`, `resume-snapshot.md`, `goal-contract.md`, `phase-plan.md`, `next-target.md`, this file, relevant compact files from `codebase/`, and only the active phase/wave/step files needed from `phases/`.
2. Check whether docs and code appear in sync.
3. Use Context7 for current library/framework/SDK/API/CLI/cloud docs when applicable and available.
4. Use subagent-driven development for independent wave steps when safe.
5. Read `compression-profile.md` before subagent dispatch and require that profile in every subagent brief.
6. After code changes, review the work, record findings, fix actionable issues, then verify.
7. After every step and commit, update the active phase/wave/step files, compact root indexes, phase plan, resume snapshot, and next target before stopping.
8. After a phase appears complete, run phase gap analysis before archiving.

## Next Target Policy

Keep `next-target.md` phase-level, not tiny step-level. Track current active phase/wave/step separately from next phase target.

## Resume Conflict Policy

If artifacts conflict, inspect git status/diff/recent commits and code. Trust code plus verified artifacts over stale docs. Update current phase from evidence. If confidence is low, ask user what to trust or do next.
