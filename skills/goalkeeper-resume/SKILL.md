---
name: goalkeeper-resume
description: Recover Goalkeeper context after interruption, context loss, or a new session. Use before continuing an active goal when chat history is incomplete, stale, compacted, or when the next phase, wave, or step should be selected from persisted artifacts instead of memory.
---

# Goalkeeper Resume

Use this skill to rebuild working context from artifacts.

## Workflow

1. Read `.goalkeeper/always-read.md` and `.goalkeeper/resume-snapshot.md` first.
2. Read the linked active artifacts:
   - `.goalkeeper/active-goal.md`
   - `.goalkeeper/goal-contract.md`
   - `.goalkeeper/phase-plan.md`
   - `.goalkeeper/next-target.md`
   - `.goalkeeper/progress-log.md`
   - `.goalkeeper/decision-log.md`
   - `.goalkeeper/verification-log.md`
3. Compare the snapshot with the phase plan and progress log.
4. If artifacts conflict, inspect git status/diff/recent commits when available, then inspect code/source of truth.
5. Prefer code plus verified artifacts over stale docs.
6. If confidence is low, ask one question before choosing the next step.
7. Identify the current phase, wave, next step, blockers, and approval requirements.
8. Refresh `.goalkeeper/resume-snapshot.md` with a compact continuation brief.

## Resume Rules

- Do not rely on chat memory when artifacts disagree.
- Do not restart planning unless the goal contract changed.
- Continue with the first `ready` step or parallelizable wave when policy allows it.
- Ask one concise question only if no artifact establishes the next safe action.
- Preserve phase-level next target while selecting specific current step.
