---
name: goalkeeper-do
description: Route freeform user intent to the valid next Goalkeeper skill. Use when the user asks in natural language what to do, wants Goalkeeper to handle a request without knowing commands, or calls a workflow step too early.
---

# Goalkeeper Do

Use this skill as the natural-language router for Goalkeeper.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/config.json`, `.goalkeeper/resume-snapshot.md`, `.goalkeeper/next-target.md`, `.goalkeeper/goal-contract.md`, and `.goalkeeper/phase-plan.md`.
2. Prefer running `goalkeeper do <project-dir> --text "<user intent>"` when available.
3. Compare the user's intent with current Goalkeeper state.
4. If the requested action is invalid, do not do filler work; explain the blocking state and route to the valid command.
5. If the helper recommends a command, follow that route unless direct artifact evidence proves a safer route.

## Routing Rules

- Raw project idea or initialized bootstrap state -> `Next: $goalkeeper-new-project`
- Vague or pending goal contract -> `Next: $goalkeeper-intake`
- Workflow setting changes -> `Next: $goalkeeper-config`
- New feature or product behavior change -> `Next: $goalkeeper-add-feature`
- Research/comparison/current docs request -> `Next: $goalkeeper-research`
- Plan/roadmap/phase/wave request -> `Next: $goalkeeper-plan`
- Ready executable step -> `Next: $goalkeeper-execute`
- `needs_review` item -> `Next: $goalkeeper-verify`
- Completed phase or suspected gaps -> `Next: $goalkeeper-analyze-phase`
- Pause/save/sync request -> `Next: $goalkeeper-pause`
- Context loss/resume request -> `Next: $goalkeeper-resume`
- Status/progress request -> `Next: $goalkeeper-status`

## Output Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget.
- Include why the route is valid.
- End with exactly one `Next: $goalkeeper-...` route or `Stop: <question>`.
- Never execute product work inside this skill; route first.
