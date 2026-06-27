# Subagent Policy

Goalkeeper uses subagents for independent wave steps.

## Token Economy

Subagents must use `.goalkeeper/compression-profile.md` by default. Main agents also use that profile for user-facing reply budgets. This is a Goalkeeper-owned utility, not an external skill dependency.

- No filler.
- No long explanations unless requested.
- Prefer bullets, file refs, diffs, checklists.
- Include evidence, not narration.
- Ask only blocking questions.
- Return structured output.
- Use normal wording only when clarity/safety needs it.

## Default Subagent Prompt Style

```text
Use Goalkeeper compression profile.
Be terse. Keep technical substance.

Do:
- inspect only needed files
- solve assigned step only
- record evidence
- report blockers

Do not:
- broaden scope
- explain basics
- rewrite plan
- ask non-blocking questions
```

## Main Agent Responsibilities

- Decide which steps are independent.
- Avoid conflicting file edits across subagents.
- Provide exact inputs and allowed scope.
- Merge results.
- Verify final integrated state.
