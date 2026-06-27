---
name: goalkeeper-new-project
description: Start a new Goalkeeper project from a raw user idea, capture the initial project seed, and run a grill-style discovery interview before goal clarification. Use when the user says they want to create, start, bootstrap, or define a new project, product, framework, harness, app, or long-running goal from an early idea.
---

# Goalkeeper New Project

Use this skill as the first gate before `goalkeeper-intake`.

## Workflow

1. Check whether `.goalkeeper/` exists in the user's project.
2. If missing, initialize it automatically unless the user explicitly forbids edits:
   - prefer `goalkeeper init <project-dir>` when the CLI is on PATH
   - otherwise use `npx --yes @goalkpr/goalkeeper init <project-dir>`
3. If `.goalkeeper/` exists but required root files such as `goal-contract.md`, `phase-plan.md`, or `always-read.md` are missing, run the same init command without `--force` to repair missing files.
4. Read `.goalkeeper/always-read.md` and `.goalkeeper/config.json` when present.
5. Prefer `goalkeeper new <project-dir> --idea "<raw idea>" --context7 yes|no|unknown --autonomy A1` or `npx --yes @goalkpr/goalkeeper new <project-dir> --idea "<raw idea>" --context7 yes|no|unknown --autonomy A1`.
6. Do not hand-create partial `.goalkeeper` state. If both CLI forms fail, stop and tell the user the exact init command to run.
7. If no raw idea was provided, ask for the project idea before running `goalkeeper new`.
8. Ask whether Context7 is installed/configured when unknown. Record answer in `project-seed.md` and `context-ledger.md`.
9. Ask one question at a time, like `grill-me`.
10. For each question, include your recommended answer and why.
11. Resolve one branch of the design tree before opening the next.
12. Prefer inspecting existing project files over asking questions when the answer is discoverable.
13. Keep asking until the project has enough shape for `goalkeeper-intake` to write a durable goal contract.
14. Update `.goalkeeper/context-ledger.md`, the active scoped discovery step file, compact root indexes, and `.goalkeeper/resume-snapshot.md` after each meaningful answer.

## Question Areas

Cover only what matters for the project:

- who the project serves
- what painful problem it solves
- what success looks like
- what the project is not
- first user workflow
- autonomy and approval boundaries
- technical constraints
- Context7 availability
- risks and anti-goals
- first milestone

## First Question

Ask this first unless the answer is already obvious:

```text
Who is the first real user, and what exact job are they trying to finish?
```

Recommended default format:

```text
First user: <specific user/persona>
Job: <observable job they need done>
```

## Output Rules

- Ask one question per turn.
- Make the recommended answer concrete, not generic.
- Challenge vague words such as easy, fast, smart, automatic, minimal, robust, and production-ready.
- Do not plan implementation yet.
- Do not continue with a partial or broken `.goalkeeper`; repair it through the CLI first.
- Handoff to `goalkeeper-intake` when the project boundaries are clear enough to form `goal-contract.md`.
- Keep discovery details in `.goalkeeper/phases/PHASE-0001-new-project-discovery/`, not only root logs.
- Keep user-facing replies concise unless the user asks for detail.
- End with exactly one route:
  - `Next: answer the discovery question` when more discovery is needed.
  - `Next: $goalkeeper-intake` when boundaries are clear enough for a project-level contract.
