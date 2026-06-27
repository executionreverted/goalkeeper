---
name: goalkeeper-new-project
description: Start a new Goalkeeper project from a raw user idea, capture the initial project seed, and run a grill-style discovery interview before goal clarification. Use when the user says they want to create, start, bootstrap, or define a new project, product, framework, harness, app, or long-running goal from an early idea.
---

# Goalkeeper New Project

Use this skill as the first gate before `goalkeeper-intake`.

## Workflow

1. Infer the raw project idea from the user's current message or recent conversation. If the idea is not present, ask one short question for the idea and stop.
2. Check whether `.goalkeeper/` exists in the user's project.
3. If missing, initialize it yourself with the shell/tooling available to the agent unless the user explicitly forbids edits:
   - prefer `goalkeeper init <project-dir>` when the CLI is on PATH
   - otherwise use `npx --yes @goalkpr/goalkeeper init <project-dir>`
4. If `.goalkeeper/` exists but required root files such as `goal-contract.md`, `phase-plan.md`, or `always-read.md` are missing, repair it yourself by running the same init command without `--force`.
5. Read `.goalkeeper/always-read.md` and `.goalkeeper/config.json` when present.
6. Run `goalkeeper new <project-dir> --idea "<raw idea>" --context7 yes|no|unknown --autonomy A1` or `npx --yes @goalkpr/goalkeeper new <project-dir> --idea "<raw idea>" --context7 yes|no|unknown --autonomy A1` yourself.
7. Do not hand-create partial `.goalkeeper` state. If both CLI forms fail, stop with `Stop: Goalkeeper CLI unavailable` and include the exact error, not a manual fallback.
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

## Discovery Question Format

When asking any discovery question, use only this compact block:

```text
Question: <direct next question>
Why: <one short sentence explaining why this matters>
Recommended answer: <concrete answer the user can accept or edit>
Options:
1. <best likely option> - <short tradeoff>
2. <second likely option> - <short tradeoff>
3. <weakest reasonable option> - <short tradeoff>
Next: answer with an option number or your own wording
```

Rules:

- Use options only when the question can be meaningfully multiple-choice.
- Order options from most sensible for MVP/focus to least sensible.
- Do not add greetings, recap, long rationale, or extra sections around the question block.
- If no useful multiple-choice set exists, omit `Options:` and keep the other lines.

## Output Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget after `.goalkeeper/` exists; before that, use the same budget from the package template.
- Do not ask the user to run `goalkeeper init`, `goalkeeper new`, `npx`, or shell commands; run them yourself through tools.
- Do not expose CLI commands as the main next action. The user-facing workflow is skill-first.
- Ask one question per turn.
- Use the Discovery Question Format for every discovery question.
- Make the recommended answer concrete, not generic.
- Challenge vague words such as easy, fast, smart, automatic, minimal, robust, and production-ready.
- Do not plan implementation yet.
- Do not continue with a partial or broken `.goalkeeper`; repair it through the CLI first.
- Handoff to `goalkeeper-intake` when the project boundaries are clear enough to form `goal-contract.md`.
- Keep discovery details in `.goalkeeper/phases/PHASE-0001-new-project-discovery/`, not only root logs.
- Keep user-facing replies within the compression budget unless the user asks for detail.
- End with exactly one route:
  - `Next: answer the discovery question` when more discovery is needed.
  - `Next: $goalkeeper-intake` when boundaries are clear enough for a project-level contract.
  - `Stop: Goalkeeper CLI unavailable` only when the agent cannot run either CLI form.
