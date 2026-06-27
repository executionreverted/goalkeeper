# Decision Log

Root decision log is for cross-phase decisions. Phase-local decisions belong in `.goalkeeper/phases/<phase-slug>/phase.md`; step-local decisions belong in the step file.

## DEC-0000: Initialize Goalkeeper

Date:
Status: accepted
Context: Goalkeeper initialized in this project.
Options:
Decision: Use Goalkeeper artifacts as the workflow state source.
Rationale: Persistent Markdown state lets later agent sessions resume without relying on chat history.
Consequences: Keep root decisions cross-phase; put phase-local decisions in scoped phase files.
