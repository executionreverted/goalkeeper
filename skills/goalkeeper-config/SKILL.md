---
name: goalkeeper-config
description: Read or update Goalkeeper project workflow settings. Use when the user wants to inspect or change autonomy, Context7, research, verifier, review, subagent, commit, model profile, branch, tool policy, available tools, preferred tools, or shipping approval behavior.
---

# Goalkeeper Config

Use this skill to inspect or update `.goalkeeper/config.json` and durable tool policy notes.

## Workflow

1. Read `.goalkeeper/config.json`, `.goalkeeper/always-read.md`, `.goalkeeper/policies/tool-policy.md`, and `.goalkeeper/resume-snapshot.md`.
2. Prefer running `goalkeeper config <project-dir>` or `npx --yes @goalkpr/goalkeeper config <project-dir>` when available.
3. If the config file is missing or invalid, route to `goalkeeper-validate` and repair from `.goalkeeper/templates/config.json` when safe.
4. For requested config changes, update only the requested keys.
5. Keep values within the accepted schema:
   - `autonomy_level`: `A0 | A1 | A2 | A3 | A4`
   - `context7`: `yes | no | unknown`
   - `subagent_policy`: `main_only | safe_parallel | aggressive_parallel`
   - `model_profile`: `inherit | budget | balanced | quality`
   - `branch_strategy`: `current_branch | phase_branch | worktree`
   - boolean flags remain booleans, not strings.
6. If the user mentions a specific tool, MCP server, connector, CLI, account, service, or local capability, decide whether it is durable:
   - durable: likely to affect future phases, research, verification, design, deployment, or resume behavior
   - not durable: only a one-off instruction for the current answer
7. When durable, append or update a `TOOL-*` entry under `.goalkeeper/policies/tool-policy.md` `## Project Tool Notes` using the format in that file.
8. After editing config or tool policy, run `goalkeeper validate <project-dir>` or `npx --yes @goalkpr/goalkeeper validate <project-dir>`.
9. Record meaningful config/tool-policy changes in `.goalkeeper/progress-log.md` and refresh `.goalkeeper/resume-snapshot.md` when the change affects the active loop.

## Config Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- Do not change autonomy, shipping approval, branch strategy, or model profile without clear user intent.
- Do not disable review or verifier silently.
- If Context7 is set to `unknown`, agents should ask once when library/framework docs matter.
- Let the agent decide whether tool information is durable; ask only if the next step depends on uncertain access.
- Never store secrets, tokens, API keys, passwords, cookies, private keys, or credential material in `.goalkeeper/`, docs, source, logs, reports, commits, or any file that may be pushed to GitHub.
- If the user includes a secret, do not quote it back; record only redacted capability evidence and ask explicit approval before writing credential material anywhere.
- Do not store secrets or tokens in `tool-policy.md`; store only capability, scope, trigger, risk, and redacted evidence.
- End with exactly one route: `Next: $goalkeeper-next`, `Next: $goalkeeper-validate`, or `Stop: <question>`.
