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

- `context-ledger.md`
- `progress-log.md`
- `decision-log.md`
- `verification-log.md`
- `resume-snapshot.md`
