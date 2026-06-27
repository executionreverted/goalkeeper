---
name: goalkeeper-add-feature
description: Use when the user asks to add, extend, support, enable, or change product behavior in an existing Goalkeeper project.
---

# Goalkeeper Add Feature

Route a feature request into the right planning lane.

## Workflow

1. Infer the requested feature from the user's message.
2. Read `.goalkeeper/always-read.md`, `.goalkeeper/config.json`, `.goalkeeper/goal-contract.md`, `.goalkeeper/phase-plan.md`, `.goalkeeper/next-target.md`, and relevant active phase files.
3. If `.goalkeeper/` is missing, `Next: $goalkeeper-new-project`.
4. If the goal contract is missing or pending discovery, record the feature as a discovery answer or context note, then `Next: $goalkeeper-intake`.
5. Classify the feature:
   - tiny isolated fix -> `Next: $goalkeeper-quick`
   - unclear product intent -> ask one clarification question
   - requires current docs/tech choice -> `Next: $goalkeeper-research`
   - changes project scope or roadmap -> `Next: $goalkeeper-plan`
6. For plan-worthy features, update planning context before routing:
   - append a compact feature request note to `.goalkeeper/context-ledger.md`
   - mention whether it likely belongs in the current phase, a new wave/step, or a new phase
   - if it would skip an open dependency/earlier phase, stop and ask for confirmation
7. Do not implement product code in this skill.

## Planning Guidance

- Prefer adding a wave/step to the current phase when it fits the phase goal.
- Prefer a new phase when the feature changes user-facing scope, data model, architecture, or verification needs.
- Prefer an inserted dependency phase when current work cannot proceed safely without it.
- Keep `goal-contract.md` project-level; update its phase goals only through planning.

## Output Rules

- Keep the answer short.
- State the classification and why.
- End with exactly one route: `Next: $goalkeeper-quick`, `Next: $goalkeeper-intake`, `Next: $goalkeeper-research`, `Next: $goalkeeper-plan`, or `Stop: <question>`.
