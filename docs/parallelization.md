# Parallelization

Goalkeeper plans work as `Phase -> Wave -> Step`.

## Terms

- `Phase`: coherent milestone with one purpose and acceptance checks.
- `Wave`: set of steps that can run after the same dependencies are satisfied.
- `Step`: smallest executable unit with clear inputs, output, and verification.

## Wave Rules

- Put unrelated steps in the same wave only when they do not edit the same files, rely on each other's outputs, or need the same scarce external context.
- Mark wave `Parallelizable: yes` only when each step has independent inputs and merge requirements are clear.
- Prefer one main-agent integration step after parallel subagent waves.
- Do not parallelize ambiguous product decisions.
- Do not parallelize destructive or external-state actions.

## Dispatch Rules

For each parallel wave, write a subagent brief:

```text
Goal:
Step:
Inputs:
Allowed files/tools:
Expected output:
Acceptance checks:
Return format:
Token mode: compressed
```

Subagents return raw artifact changes, findings, or concise summaries. Main agent integrates results and updates `phase-plan.md`, `progress-log.md`, `verification-log.md`, and `resume-snapshot.md`.
