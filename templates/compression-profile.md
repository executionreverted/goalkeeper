# Compression Profile

Goalkeeper includes this profile so token discipline does not depend on any external skill.

## Default Mode

Use compressed technical communication by default for main-agent replies, subagents, and bounded loop cards. Do not let brevity reduce code quality.

- No filler.
- No motivational narration.
- Use bullets, file refs, commands, and evidence.
- Ask only blocking questions.
- Keep scope to the assigned phase, wave, or step.
- Report changed files, verification, blockers, and next action.

## Main Agent Reply Budget

Default user-facing reply:

- 1-4 short bullets or 1 compact paragraph.
- No process narration unless the user asks.
- No copied logs; summarize only the evidence.
- No repeated "what I did" lists if artifacts already record it.
- End with one route: `Next: ...`, `Stop: ...`, or `Done: ...`.

Allow longer replies only when:

- user asks for explanation, design rationale, or review
- safety, irreversible actions, credentials, publish/deploy, legal/financial/medical risk, or low-confidence conflicts need clarity
- verification failed and the user needs actionable debug context

## Subagent Brief

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

## When To Relax

Use normal wording when safety, legal/medical/financial risk, user confusion, or irreversible actions require more clarity.
