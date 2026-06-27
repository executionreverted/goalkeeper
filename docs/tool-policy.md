# Goalkeeper Tool Policy

Goalkeeper treats tools as controlled capabilities, not ambient powers.

## Tool Risk Classes

- `R0`: Read-only local inspection.
- `R1`: Local non-destructive generation or formatting.
- `R2`: Local code/file edits inside the workspace.
- `R3`: Commands that run code, tests, migrations, or package managers.
- `R4`: Destructive local actions, credential access, network writes, deploys, PRs, commits, emails, payments, account changes.

## Approval Defaults

- `A0`: Allow R0 only.
- `A1`: Allow R0 and planning artifacts.
- `A2`: Allow R0-R2 when scoped to the active goal.
- `A3`: Allow R0-R3 when verification requires it.
- `A4`: Allow preparing R4 actions, but require explicit user approval before execution.

## Tool Call Requirements

Before using a tool, identify:

- Why the tool is needed.
- Which artifact will be updated afterward.
- Whether the action changes external state.
- What evidence will prove success or failure.

After using a tool, update at least one of:

- active scoped files under `.goalkeeper/phases/`
- `context-ledger.md`
- `progress-log.md` as a compact index
- `decision-log.md` for cross-phase decisions
- `verification-log.md` as a compact index
- `resume-snapshot.md`

## Project Tool Notes

Agents may update this section when the user says a specific tool, MCP server, connector, CLI, account, service, or local capability is available, preferred, forbidden, or conditionally useful.

Record the tool here only when it is likely to affect future phases, waves, verification, research, design, deployment, or resume behavior. Do not record one-off tool mentions that only apply to the current answer.

## Secret Red Alarm

Never write secrets, tokens, API keys, passwords, private keys, cookies, session values, recovery codes, or credential material into `.goalkeeper/`, docs, source files, logs, reports, commits, or any file that may be pushed to GitHub.

If the user includes a secret in chat:

- Do not quote it back.
- Do not store it verbatim.
- Record only a redacted capability note, such as `Evidence: user says <service> credentials are configured`.
- Ask for explicit approval before writing any credential material anywhere.
- If storage is approved, prefer a gitignored local file, environment variable, OS keychain, or external secret manager; first verify it will not be committed.

Use this compact format:

```text
### TOOL-0000: <tool name>
Status: available | preferred | conditional | forbidden | unknown
Scope: <where this applies>
Use when: <short trigger>
Do not use when: <short limit>
Risk class: R0 | R1 | R2 | R3 | R4
Source: user | detected | inferred
Last checked: YYYY-MM-DD
Evidence: <redacted user statement, command, config path, or connector name>
Notes: <optional short note>
```

If confidence is low, record `Status: unknown` or ask one blocking question only when the next action depends on the tool. External-state tools still follow approval defaults.
