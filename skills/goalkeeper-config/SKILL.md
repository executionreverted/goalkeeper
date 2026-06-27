---
name: goalkeeper-config
description: Read or update Goalkeeper project workflow settings. Use when the user wants to inspect or change autonomy, Context7, research, verifier, review, subagent, commit, model profile, branch, or shipping approval behavior.
---

# Goalkeeper Config

Use this skill to inspect or update `.goalkeeper/config.json`.

## Workflow

1. Read `.goalkeeper/config.json`, `.goalkeeper/always-read.md`, and `.goalkeeper/resume-snapshot.md`.
2. Prefer running `goalkeeper config <project-dir>` or `npx --yes @goalkpr/goalkeeper config <project-dir>` when available.
3. If the config file is missing or invalid, route to `goalkeeper-validate` and repair from `.goalkeeper/templates/config.json` when safe.
4. For requested changes, update only the requested keys.
5. Keep values within the accepted schema:
   - `autonomy_level`: `A0 | A1 | A2 | A3 | A4`
   - `context7`: `yes | no | unknown`
   - `subagent_policy`: `main_only | safe_parallel | aggressive_parallel`
   - `model_profile`: `inherit | budget | balanced | quality`
   - `branch_strategy`: `current_branch | phase_branch | worktree`
   - boolean flags remain booleans, not strings.
6. After editing config, run `goalkeeper validate <project-dir>` or `npx --yes @goalkpr/goalkeeper validate <project-dir>`.
7. Record meaningful config changes in `.goalkeeper/progress-log.md` and refresh `.goalkeeper/resume-snapshot.md` when the change affects the active loop.

## Config Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- Do not change autonomy, shipping approval, branch strategy, or model profile without clear user intent.
- Do not disable review or verifier silently.
- If Context7 is set to `unknown`, agents should ask once when library/framework docs matter.
- End with exactly one route: `Next: $goalkeeper-next`, `Next: $goalkeeper-validate`, or `Stop: <question>`.
