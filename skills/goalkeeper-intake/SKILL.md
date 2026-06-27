---
name: goalkeeper-intake
description: Clarify rough user ideas into durable Goalkeeper goal contracts. Use when a user starts a new long-running goal, changes the objective, asks to keep goal mode open, or needs success criteria, constraints, autonomy level, non-goals, and approval boundaries captured before planning or execution.
---

# Goalkeeper Intake

Use this skill to turn an ambiguous request or completed `goalkeeper-new-project` discovery into project-level `.goalkeeper/goal-contract.md`.

## Workflow

1. Read existing `.goalkeeper/config.json`, `.goalkeeper/project-seed.md`, `.goalkeeper/discovery-log.md`, `.goalkeeper/active-goal.md`, `.goalkeeper/goal-contract.md`, `.goalkeeper/context-ledger.md`, and `.goalkeeper/resume-snapshot.md` if they exist.
2. Extract the user's actual project objective, non-goals, constraints, project success criteria, user preferences, and approval boundaries.
3. Ask at most one concise clarification question only when the missing answer materially changes the plan.
4. Set an autonomy level:
   - `A0`: analyze only.
   - `A1`: plan and wait for approval.
   - `A2`: execute low-risk local work.
   - `A3`: run local verify/fix loops.
   - `A4`: prepare external actions, but request approval before publishing.
5. Update the Goalkeeper artifacts:
   - `.goalkeeper/active-goal.md`
   - `.goalkeeper/goal-contract.md`
   - `.goalkeeper/context-ledger.md`
   - active scoped phase/wave/step files under `.goalkeeper/phases/`
   - `.goalkeeper/progress-log.md` as a compact index
   - `.goalkeeper/resume-snapshot.md`

## Output Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- If discovery is still too vague, do not force a contract; explain the missing input and end with `Next: $goalkeeper-new-project`.
- Keep the contract concrete enough that another agent can resume without chat history.
- `goal-contract.md` is project-level, not phase-level.
- Include short `Phase goals` entries for every known or planned phase.
- Keep phase goal entries high-level; put detailed phase purpose and acceptance checks in `.goalkeeper/phases/<phase>/phase.md`.
- Prefer explicit project success criteria over broad aspiration.
- Put durable facts in `context-ledger.md`, not only in the final answer.
- Never store secrets, tokens, API keys, passwords, cookies, private keys, or credential material in `.goalkeeper/`, docs, source, logs, reports, commits, or any file that may be pushed to GitHub.
- If the user mentions a tool plus a secret, record only redacted capability evidence and route durable tool notes to `.goalkeeper/policies/tool-policy.md`.
- If the raw idea is still too vague, hand back to `goalkeeper-new-project` instead of forcing a contract.
- Do not create a phase/wave/step plan here unless the contract is stable; use `goalkeeper-plan` next.
- Keep user-facing replies within the compression budget unless the user asks for detail.
- End with exactly one route:
  - `Next: $goalkeeper-research` when there is a concrete open research question.
  - `Next: $goalkeeper-plan` when the contract is stable and no research is needed.
