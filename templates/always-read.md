# Always Read

Read this before every phase, wave, step, resume, or subagent dispatch.

## Mandatory Loop

1. Load `config.json`, `resume-snapshot.md`, `goal-contract.md`, `phase-plan.md`, `next-target.md`, this file, relevant files from `policies/`, relevant compact files from `codebase/`, and only the active phase/wave/step files needed from `phases/`.
2. Check whether docs and code appear in sync.
3. Use Context7 for current library/framework/SDK/API/CLI/cloud docs when applicable and available.
4. Use subagent-driven development for independent wave steps when safe.
5. Read `compression-profile.md` before any user-facing Goalkeeper reply, loop-card handoff, or subagent dispatch.
6. Apply the main-agent reply budget from `compression-profile.md`; write detail into scoped artifacts, not chat.
7. Require `compression-profile.md` in every subagent brief.
8. After code changes, review the work, record findings, fix actionable issues, then verify.
9. After verification passes for a step or quick task, sync docs first, then commit code plus Goalkeeper artifacts before moving to the next step when the project is a git repo and `commit_docs` is true.
10. If the required verification commit cannot be made, record the blocker and stop instead of marking the step done.
11. After every step and commit, update the active phase/wave/step files, compact root indexes, phase plan, resume snapshot, and next target before stopping.
12. After a phase appears complete, run phase gap analysis before archiving.

## Next Target Policy

Keep `next-target.md` phase-level, not tiny step-level. Track current active phase/wave/step separately from next phase target.

## Resume Conflict Policy

If artifacts conflict, inspect git status/diff/recent commits and code. Trust code plus verified artifacts over stale docs. Update current phase from evidence. If confidence is low, ask user what to trust or do next.
