# Research Notes

This file tracks external ideas Goalkeeper borrows or avoids.

## Patterns to Borrow

- Durable graph execution and explicit interrupts for human review.
- Typed state or schema-backed state, even when stored as Markdown.
- Plan-first task decomposition with reviewable diffs.
- Termination conditions to avoid endless agent loops.
- Local sandboxing and explicit tool risk classes.
- Verification evidence before completion claims.
- Resume snapshots that survive context loss.

## Patterns to Avoid

- Treating chat transcript as durable memory.
- Adding many agents before the workflow is stable.
- Letting the model choose risky tools without policy.
- Marking tasks done without tests, checks, or user-visible evidence.
- Hiding decisions inside progress notes.
- Creating huge state files that become harder to reload than the conversation.

## Candidate References

- LangGraph: durable execution, checkpointing, interrupts, time travel.
- CrewAI: flows, structured state, human feedback.
- AutoGen: team save/load state, termination conditions, human handoff.
- Aider: repo map, git-aware local coding loop.
- Plandex: planning, execution, reviewable accumulated changes.
- OpenHands: sandboxed software agent runtime.
- SWE-agent: simple agent-computer interface and benchmark-driven workflow.
