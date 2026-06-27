---
name: goalkeeper-research
description: Research options, comparable systems, docs, and evidence before Goalkeeper decisions. Use when a goal requires external or internal discovery, current library/framework documentation, tradeoff analysis, prior art review, or evidence that should be recorded before planning.
---

# Goalkeeper Research

Use this skill to gather evidence for a Goalkeeper decision or plan.

## Workflow

1. Read `.goalkeeper/goal-contract.md`, `.goalkeeper/context-ledger.md`, `.goalkeeper/decision-log.md`, `.goalkeeper/resume-snapshot.md`, and the active scoped phase/wave/step files when research belongs to a planned step.
2. Identify the research question and scope from the active goal.
3. Check whether the same question is already answered in `context-ledger.md`, `decision-log.md`, or the active scoped step file.
4. If the question is already answered and no new constraint/version/source is requested, do not research again; summarize the existing evidence and route forward.
5. Use appropriate sources:
   - Use Context7 for current library, framework, SDK, API, CLI, or cloud service docs.
   - Use primary sources when technical accuracy matters.
   - Use web search when current ecosystem comparisons, reviews, or external prior art matter.
6. Separate facts from inferences.
7. Record durable findings in `.goalkeeper/context-ledger.md`.
8. Add proposed decisions or tradeoffs to `.goalkeeper/decision-log.md`.
9. Record step-specific research evidence in the active scoped step file.
10. Refresh `.goalkeeper/resume-snapshot.md`.

## Output Rules

- Summarize what matters for the active goal, not everything found.
- Link sources when web or docs research influenced the decision.
- Call out uncertainty and stale information risk.
- End with the decision pressure: what this research makes easier to choose.
- End with exactly one route:
  - `Next: $goalkeeper-plan` when research informs planning.
  - `Next: $goalkeeper-execute` when research was for an active step and execution can continue.
