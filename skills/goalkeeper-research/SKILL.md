---
name: goalkeeper-research
description: Research options, comparable systems, docs, and evidence before Goalkeeper decisions. Use when a goal requires external or internal discovery, current library/framework documentation, tradeoff analysis, prior art review, or evidence that should be recorded before planning.
---

# Goalkeeper Research

Use this skill to gather evidence for a Goalkeeper decision or plan.

## Workflow

1. Read `.goalkeeper/goal-contract.md`, `.goalkeeper/context-ledger.md`, `.goalkeeper/decision-log.md`, and `.goalkeeper/resume-snapshot.md`.
2. Identify the research question and scope from the active goal.
3. Use appropriate sources:
   - Use Context7 for current library, framework, SDK, API, CLI, or cloud service docs.
   - Use primary sources when technical accuracy matters.
   - Use web search when current ecosystem comparisons, reviews, or external prior art matter.
4. Separate facts from inferences.
5. Record durable findings in `.goalkeeper/context-ledger.md`.
6. Add proposed decisions or tradeoffs to `.goalkeeper/decision-log.md`.
7. Refresh `.goalkeeper/resume-snapshot.md`.

## Output Rules

- Summarize what matters for the active goal, not everything found.
- Link sources when web or docs research influenced the decision.
- Call out uncertainty and stale information risk.
- End with the decision pressure: what this research makes easier to choose.
