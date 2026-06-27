---
name: goalkeeper-research
description: Research options, comparable systems, docs, and evidence before Goalkeeper decisions. Use when a goal requires external or internal discovery, current library/framework documentation, tradeoff analysis, prior art review, or evidence that should be recorded before planning.
---

# Goalkeeper Research

Use this skill to gather evidence for a Goalkeeper decision or plan.

## Workflow

1. Read `.goalkeeper/config.json`, `.goalkeeper/goal-contract.md`, `.goalkeeper/context-ledger.md`, `.goalkeeper/decision-log.md`, `.goalkeeper/resume-snapshot.md`, and the active scoped phase/wave/step files when research belongs to a planned step.
2. Identify the research question and scope from the active goal.
3. Normalize the research question into a lowercase canonical `Normalized question`.
4. Check `## Research Records` in `context-ledger.md` for an active (`proposed` or `accepted`) record with the same normalized question.
5. If the question is already answered and no new constraint/version/source is requested, do not research again; summarize the existing `RSR-*` evidence and route forward.
6. Use appropriate sources:
   - Use Context7 for current library, framework, SDK, API, CLI, or cloud service docs.
   - Use primary sources when technical accuracy matters.
   - Use web search when current ecosystem comparisons, reviews, or external prior art matter.
7. Separate facts from inferences.
8. Add or update one `RSR-*` record in `.goalkeeper/context-ledger.md` with status, question, normalized question, scope, sources, decision links, freshness, and result.
9. Add proposed or accepted `DEC-*` records to `.goalkeeper/decision-log.md` when the research changes direction or planning.
10. Link the research record to every decision it supports.
11. Record step-specific research evidence in the active scoped step file.
12. Refresh `.goalkeeper/resume-snapshot.md`.

## Output Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- Summarize what matters for the active goal, not everything found.
- Link sources when web or docs research influenced the decision.
- Call out uncertainty and stale information risk.
- End with the decision pressure: what this research makes easier to choose.
- Do not leave duplicate active `RSR-*` records for the same normalized question; supersede the older record when research must be redone.
- End with exactly one route:
  - `Next: $goalkeeper-plan` when research informs planning.
  - `Next: $goalkeeper-execute` when research was for an active step and execution can continue.
