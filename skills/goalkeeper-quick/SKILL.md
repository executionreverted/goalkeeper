---
name: goalkeeper-quick
description: Use when the user wants a small self-contained change, typo fix, config tweak, tiny bugfix, or quick follow-up without creating a full phase/wave/step plan.
---

# Goalkeeper Quick

Use this skill for small ad-hoc work with Goalkeeper guarantees.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/config.json`, `.goalkeeper/resume-snapshot.md`, and relevant code/docs.
2. Prefer `goalkeeper quick <project-dir> --text "<task>"` to create the quick task artifact.
3. Keep quick work under `.goalkeeper/quick/<slug>/quick.md`; do not edit `phase-plan.md` unless promoting the task.
4. If the task is broad, risky, cross-cutting, or product-directional, stop and route to `goalkeeper-plan`.
5. Execute the smallest safe change.
6. Update the quick file with changed files, commands, failed attempts, verification, and summary.
7. Run verification before marking `Status: done`.
8. If verification passes and the target project is a git repo with `commit_docs: true`, commit code plus the quick/progress/resume/verification artifacts before reporting completion.
9. Record the commit hash in the quick file and compact logs when available.
10. If the required commit fails, leave the quick task blocked and stop.
11. Refresh `.goalkeeper/resume-snapshot.md` and append a compact `progress-log.md` entry.

## Quick Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- Use quick only when the task fits one focused loop.
- Use `--research`, `--validate`, or `--full` when uncertainty or risk warrants it.
- Keep user-facing output within the compression budget.
- Prefer the final commit after verification, not before.
- End with exactly one route: `Next: $goalkeeper-verify`, `Next: $goalkeeper-next`, `Next: $goalkeeper-plan`, or `Stop: <blocker>`.
