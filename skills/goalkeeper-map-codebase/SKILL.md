---
name: goalkeeper-map-codebase
description: Use when starting Goalkeeper in an existing repository, after major structural changes, or when the agent needs durable codebase context before planning or execution.
---

# Goalkeeper Map Codebase

Create compact repository memory under `.goalkeeper/codebase/`.

## Workflow

1. Read `.goalkeeper/always-read.md`, `.goalkeeper/config.json`, and `.goalkeeper/resume-snapshot.md`.
2. Run `goalkeeper map-codebase <project-dir>` when available.
3. Review generated files for false assumptions.
4. Add concise human/agent refinements only where evidence is clear.
5. Keep files small and factual; link to source paths instead of copying code.
6. Run `goalkeeper validate <project-dir>`.
7. End with `Next: $goalkeeper-new-project`, `Next: $goalkeeper-plan`, or `Next: $goalkeeper-next`.

## Files

- `structure.md`: top-level folders/files and manifests.
- `architecture.md`: entry points and real module boundaries.
- `stack.md`: package, dependencies, runtime hints.
- `testing.md`: scripts and verification commands.
- `conventions.md`: local style and edit rules.
- `integrations.md`: APIs, databases, deployment, MCP, cloud surfaces.
- `risks.md`: git state, fragile areas, stale assumptions.

## Rules

- Apply `.goalkeeper/compression-profile.md` main-agent reply budget to every user-facing reply.
- Do not invent architecture beyond inspected evidence.
- Refresh after big folder moves, framework changes, or test harness changes.
- Prefer compact bullets over long prose.
- If the repo is too large, map top-level surfaces first and create follow-up steps.
