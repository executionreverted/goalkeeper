---
name: goalkeeper-new-project
description: Start a new Goalkeeper project from a raw user idea, capture the initial project seed, and run a grill-style discovery interview before goal clarification. Use when the user says they want to create, start, bootstrap, or define a new project, product, framework, harness, app, or long-running goal from an early idea.
---

# Goalkeeper New Project

Use this skill as the first gate before `goalkeeper-intake`.

## Workflow

1. Check whether `.goalkeeper/` exists in the user's project.
2. If missing, ask the user to run `bash scripts/goalkeeper-init.sh <project-dir>` or run the project-local init script when available and allowed.
3. Read `.goalkeeper/always-read.md`.
4. Prefer `scripts/goalkeeper-new-project.sh <project-dir> --idea "<raw idea>" --context7 yes|no|unknown --autonomy A1` when available.
5. If no script exists, manually capture the raw idea in `.goalkeeper/project-seed.md`, start `discovery-log.md`, set `next-target.md`, and refresh `resume-snapshot.md`.
6. Ask whether Context7 is installed/configured when unknown. Record answer in `project-seed.md` and `context-ledger.md`.
7. Ask one question at a time, like `grill-me`.
8. For each question, include your recommended answer and why.
9. Resolve one branch of the design tree before opening the next.
10. Prefer inspecting existing project files over asking questions when the answer is discoverable.
11. Keep asking until the project has enough shape for `goalkeeper-intake` to write a durable goal contract.
12. Update `.goalkeeper/context-ledger.md` and `.goalkeeper/resume-snapshot.md` after each meaningful answer.

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
- Handoff to `goalkeeper-intake` when the project boundaries are clear enough to form `goal-contract.md`.
- Keep user-facing replies concise unless the user asks for detail.
