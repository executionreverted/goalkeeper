---
name: goalkeeper-ship
description: Use when preparing a verified Goalkeeper project, phase, pull request, release, deploy, publish, merge, or external shipping action.
---

# Goalkeeper Ship

Prepare shipping evidence; never perform external actions without approval.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/config.json`, `.goalkeeper/resume-snapshot.md`, `.goalkeeper/phase-plan.md`, `.goalkeeper/verification-log.md`, and relevant archive/gap files.
2. Run `goalkeeper ship <project-dir>` when available.
3. If the ship packet is blocked, route to the recommended command and stop.
4. If ready, review changed files, recent commits, archive reports, and verification evidence.
5. Draft PR/release/deploy notes from recorded evidence only.
6. Ask for explicit approval before push, publish, deploy, PR creation, merge, or package release.
7. After approval and action, record links, command output, and follow-up risk in Goalkeeper artifacts.

## Rules

- Do not ship with open gaps, missing verification, or unknown dirty worktree changes.
- Do not invent verification evidence.
- Prefer dry-run or draft output before any external side effect.
- End with `Next: $goalkeeper-next`, `Next: $goalkeeper-verify`, `Next: $goalkeeper-close-gaps`, or `Stop: approval required`.
