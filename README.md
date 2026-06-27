# Goalkeeper

Goalkeeper is a workflow harness for long-running LLM coding projects.

It gives agents a durable goal loop:

```text
New Project -> Clarify -> Research -> Decide -> Plan -> Execute -> Verify -> Snapshot -> Continue
```

Instead of trusting chat history, Goalkeeper writes the project goal, decisions, phase index, scoped phase/wave/step work files, verification evidence, gaps, and resume state into `.goalkeeper/` files that any later agent session can reload.

## What It Installs

Goalkeeper ships three things:

- `goalkeeper-*` skills for Codex and Claude Code style agents.
- `goalkeeper` CLI for installing skills and bootstrapping `.goalkeeper/`.
- `.goalkeeper/` templates for project-local workflow state.

The package is scoped because `goalkeeper` is already taken on npm. The installed binary is still named `goalkeeper`.

## Quick Start

Install the skills for your agent:

```bash
npx @goalkpr/goalkeeper
```

The wizard asks where to install:

- Codex
- Claude Code
- both
- custom skills path

Non-interactive install:

```bash
npx @goalkpr/goalkeeper install --agent codex --scope user --force
npx @goalkpr/goalkeeper install --agent claude --scope user --force
npx @goalkpr/goalkeeper install --agent both --scope project
```

For a persistent local command:

```bash
npm install -g @goalkpr/goalkeeper
```

## Start A Project

From inside your project folder, continue in your agent chat:

```text
$goalkeeper-new-project

I want to build a simple p2p mobile chat app.
```

The skill initializes `.goalkeeper/` through its internal helper if needed, records the raw idea, and starts discovery. Goalkeeper should interrogate the idea before planning implementation.

## Use Inside Your Agent

After install, invoke Goalkeeper skills directly in chat.

In Codex, use `$skill-name`:

```text
$goalkeeper-next
```

or:

```text
$goalkeeper-loop

Continue while allowed.
```

Typical flow:

```text
$goalkeeper-new-project
$goalkeeper-do
$goalkeeper-add-feature
$goalkeeper-map-codebase
$goalkeeper-intake
$goalkeeper-config
$goalkeeper-research
$goalkeeper-plan
$goalkeeper-execute
$goalkeeper-verify
$goalkeeper-analyze-phase
$goalkeeper-close-gaps
$goalkeeper-ship
$goalkeeper-quick
$goalkeeper-pause
$goalkeeper-resume
```

The LLM performs the work and updates the files. The CLI is only the installer/bootstrapper plus optional state/debug helper.

## CLI Helper Commands

```bash
npx @goalkpr/goalkeeper install --agent codex --scope user
npx @goalkpr/goalkeeper uninstall --agent codex --scope user
npx @goalkpr/goalkeeper init .
npx @goalkpr/goalkeeper do . --text "what should we do next?"
npx @goalkpr/goalkeeper quick . --text "fix typo in README"
npx @goalkpr/goalkeeper map-codebase .
npx @goalkpr/goalkeeper ship .
npx @goalkpr/goalkeeper config .
npx @goalkpr/goalkeeper validate .
npx @goalkpr/goalkeeper doctor
```

Most users only install the skills, then continue in chat with `$goalkeeper-*` skills. When a skill needs `init`, `new`, `loop`, or validation helpers, the agent should run those helper commands internally rather than asking the user to type them.

The CLI also includes shell helpers like `do`, `quick`, `map-codebase`, `ship`, `status`, `config`, `next`, `loop`, `pause`, and `analyze-phase`. They are for skills, debugging, and maintainers. They are not the main user workflow.

Every Goalkeeper skill should end with one clear next command, for example `Next: $goalkeeper-plan`. If a command is called too early, the agent should say why and recommend the valid command instead of doing filler work.

Install options:

```text
--agent codex|claude|both
--scope user|project
--target DIR
--config-dir DIR
--force
--dry-run
--yes
```

Supported install paths:

| Agent | User scope | Project scope |
|---|---|---|
| Codex | `~/.codex/skills/` | `./.agents/skills/` |
| Claude Code | `~/.claude/skills/` | `./.claude/skills/` |

Use `--target DIR` for an exact skills directory. Use `--config-dir DIR` for an agent config root; Goalkeeper installs into `DIR/skills`.

Project options:

```text
--context7 yes|no|unknown
--autonomy A0|A1|A2|A3|A4
--force
--dry-run
```

## The `.goalkeeper/` Folder

Goalkeeper creates small Markdown files so state is human-readable and git-friendly:

```text
.goalkeeper/
  active-goal.md
  always-read.md
  compression-profile.md
  config.json
  project-seed.md
  discovery-log.md
  goal-contract.md
  context-ledger.md
  decision-log.md
  phase-plan.md
  next-target.md
  progress-log.md
  verification-log.md
  resume-snapshot.md
  codebase/
  policies/
    tool-policy.md
    subagent-policy.md
    parallelization.md
  quick/
  ship/
  phases/
    PHASE-0001-short-title/
      phase.md
      waves/
        WAVE-0001-A-short-title/
          wave.md
          steps/
            STEP-0001-A-01-short-title.md
  archive/
  gaps/
  templates/
```

Important files:

- `goal-contract.md`: project goal, project success criteria, non-goals, constraints, and short phase-goal map.
- `phase-plan.md`: compact Phase -> Wave -> Step index.
- `phases/`: detailed phase, wave, and step working files.
- `always-read.md`: rules the agent must read before every loop.
- `config.json`: machine-readable workflow settings for routing, autonomy, research, review, and shipping behavior.
- `compression-profile.md`: built-in terse-output discipline for main-agent replies and subagents.
- `next-target.md`: larger next phase target, not tiny local drift.
- `resume-snapshot.md`: compact recovery state if context is lost.
- `progress-log.md` and `verification-log.md`: compact indexes that point to scoped files.
- `codebase/`: compact repository memory for structure, stack, testing, conventions, integrations, and risks.
- `policies/`: project-local Goalkeeper tool, subagent, and parallelization rules used by skills. Tool notes must redact secrets.
- `quick/`: small ad-hoc tasks that should not become full phases.
- `ship/`: readiness packets and draft PR/release notes before external action.
- `gaps/`: missing work found after phase analysis.
- `archive/`: verified phase completion reports.

When `commit_docs` is enabled, Goalkeeper expects git-backed projects to commit after verification passes for each step or quick task. The commit should include the code change and the matching `.goalkeeper` evidence updates.

## Phase, Wave, Step

Goalkeeper plans work as:

```text
Phase -> Wave -> Step
```

- Phase: milestone-sized body of work.
- Wave: steps that share dependencies and may be parallelized.
- Step: smallest executable and verifiable unit.

Independent wave steps can be sent to subagents. Main-agent replies and subagents use `compression-profile.md` by default, so Goalkeeper does not depend on an external "caveman" skill.

## Autonomy Levels

```text
A0 Analyze only.
A1 Plan and wait for approval.
A2 Execute low-risk local work.
A3 Run local verify/fix loops.
A4 Prepare external actions, but ask before publishing/deploying/PRs.
```

Goalkeeper should stop and ask when the next action changes product direction, requires credentials, is destructive, publishes externally, or skips an open prerequisite phase.

## Example Session

```bash
cd my-app
npx @goalkpr/goalkeeper init .
```

Then tell your agent:

```text
$goalkeeper-new-project

I want a simple p2p mobile chat app.
Ask the next discovery question, update the Goalkeeper files, and stop if product direction is ambiguous.
```

Later:

```text
$goalkeeper-next
$goalkeeper-pause

Reason: end of session.
```

## Walkthrough: TODO App

This is what a real Goalkeeper run can look like for a small TODO app.

### 1. Install Skills

```bash
npx @goalkpr/goalkeeper install --agent codex --scope user
```

This installs skills like:

```text
goalkeeper-new-project
goalkeeper-do
goalkeeper-add-feature
goalkeeper-quick
goalkeeper-map-codebase
goalkeeper-ship
goalkeeper-intake
goalkeeper-config
goalkeeper-plan
goalkeeper-execute
goalkeeper-verify
goalkeeper-next
goalkeeper-pause
goalkeeper-resume
```

### 2. Initialize The Project

Open or create the project folder in your agent. You do not need to type an init command during normal use; `$goalkeeper-new-project` runs the bootstrap helper internally when `.goalkeeper/` is missing.

### 3. Start From A Raw Idea

```text
$goalkeeper-new-project

I want to build a simple TODO app.
Context7 is available.
Autonomy level: A2.
```

The agent reads:

```text
.goalkeeper/project-seed.md
.goalkeeper/discovery-log.md
.goalkeeper/always-read.md
.goalkeeper/config.json
.goalkeeper/resume-snapshot.md
```

The first useful question uses a compact choice format:

```text
Question: Who is the first real user of this TODO app, and what exact job are they trying to finish?
Why: This keeps the MVP tied to one real workflow.
Recommended answer: First user: me, a solo builder. Job: capture tasks quickly, choose what to do today, and keep the list after refresh.
Options:
1. Me, a solo builder - fastest path to a focused MVP.
2. A small household/team - useful if sharing is core.
3. General productivity users - broadest and weakest for a first MVP.
Next: answer with an option number or your own wording
```

You might answer:

```text
Me. I want a local web app where I can add tasks, mark them done, filter active/completed, and keep the list after refresh.
```

The agent records that answer in `discovery-log.md`.
It also updates the active discovery files under:

```text
.goalkeeper/phases/PHASE-0001-new-project-discovery/
```

### 4. Turn Answers Into A Goal Contract

Tell the agent:

```text
$goalkeeper-intake
```

Goalkeeper turns the raw idea into project-level `goal-contract.md`, roughly:

```text
Contract scope:
Project-level. This file defines the whole project goal, not a single phase.

Project goal:
Build a local TODO web app.

Project success criteria:
- User can add a task.
- User can mark a task done.
- User can delete a task.
- User can filter all/active/completed.
- Tasks persist after refresh.

Phase goals:
- PHASE-0001: App Scaffold -> Create the usable local app shell.
- PHASE-0002: TODO Core -> Implement task creation, completion, deletion, and filters.
- PHASE-0003: Persistence And Verification -> Persist tasks and verify acceptance checks.

Non-goals:
- Authentication.
- Team sharing.
- Cloud sync.
```

If the idea is still vague, `goalkeeper-intake` should ask another question instead of forcing a plan.

### 5. Research If Needed

If the stack matters, use:

```text
$goalkeeper-research
```

For example, if the project uses React or Next.js, the agent should use current docs when available and record durable findings in:

```text
.goalkeeper/context-ledger.md
.goalkeeper/decision-log.md
```

For a tiny TODO app, research may decide:

```text
Decision:
Use plain React state plus localStorage.
```

### 6. Map The Existing Codebase

If the project already has code, or after the scaffold exists, ask:

```text
$goalkeeper-map-codebase
```

The agent creates compact repository memory under:

```text
.goalkeeper/codebase/structure.md
.goalkeeper/codebase/architecture.md
.goalkeeper/codebase/stack.md
.goalkeeper/codebase/testing.md
.goalkeeper/codebase/conventions.md
.goalkeeper/codebase/integrations.md
.goalkeeper/codebase/risks.md
```

This keeps later loops from rediscovering the same folder structure, scripts, stack, and risks.

### 7. Create Phases, Waves, And Steps

Tell the agent:

```text
$goalkeeper-plan
```

The agent writes compact `phase-plan.md`:

```text
PHASE-0001: App Scaffold
  WAVE-0001-A: Project setup
    STEP-0001-A-01: Create app shell
    STEP-0001-A-02: Add base styles

PHASE-0002: TODO Core
  WAVE-0002-A: Task behavior
    STEP-0002-A-01: Add create task flow
    STEP-0002-A-02: Add complete/delete behavior
    STEP-0002-A-03: Add filters

PHASE-0003: Persistence And Verification
  WAVE-0003-A: Storage and checks
    STEP-0003-A-01: Persist tasks to localStorage
    STEP-0003-A-02: Verify acceptance criteria
```

If steps are independent, Goalkeeper can mark a wave as `Dispatch: subagents`. Main-agent replies and subagents use `.goalkeeper/compression-profile.md`.

The detailed files live under `phases/`:

```text
.goalkeeper/phases/PHASE-0002-todo-core/phase.md
.goalkeeper/phases/PHASE-0002-todo-core/waves/WAVE-0002-A-task-behavior/wave.md
.goalkeeper/phases/PHASE-0002-todo-core/waves/WAVE-0002-A-task-behavior/steps/STEP-0002-A-01-create-task-flow.md
```

### 8. Execute One Bounded Loop

Ask:

```text
$goalkeeper-loop
```

The skill is the active orchestrator. It reads the current phase, wave, step, mode, dispatch type, and next action, then performs the matching workflow when safe. It may apply the `goalkeeper-execute` workflow for a bounded step, continue into verification, sync artifacts, commit after verification when required, and keep looping while autonomy and stop conditions allow.

It should do only the selected step, then update:

```text
.goalkeeper/phases/<active-phase>/waves/<active-wave>/steps/<active-step>.md
.goalkeeper/phases/<active-phase>/waves/<active-wave>/wave.md
.goalkeeper/phases/<active-phase>/phase.md
.goalkeeper/phase-plan.md
.goalkeeper/progress-log.md
.goalkeeper/resume-snapshot.md
.goalkeeper/next-target.md
```

Root `progress-log.md` stays short; detailed changed files, commands, and notes go into the active step file.

### 9. Verify Before Marking Done

After implementation:

```text
$goalkeeper-verify
```

For the TODO app, verification might run:

```bash
npm test
npm run build
```

or manually inspect behavior if no tests exist yet.

The evidence goes into the scoped step file first, then the compact verification index:

```text
.goalkeeper/phases/<active-phase>/waves/<active-wave>/steps/<active-step>.md
.goalkeeper/verification-log.md
```

Goalkeeper should not mark a step or phase done without evidence.

### 10. Analyze The Phase

When a phase appears complete:

```text
$goalkeeper-analyze-phase

Analyze PHASE-0002.
```

If complete, Goalkeeper writes:

```text
.goalkeeper/archive/phase-0002-report.md
```

If something is missing, it writes:

```text
.goalkeeper/gaps/phase-0002-gaps.md
```

Then ask:

```text
$goalkeeper-close-gaps

Close gaps for PHASE-0002.
```

### 11. Add A Feature Later

For a new product behavior after the first plan exists, ask:

```text
$goalkeeper-add-feature

Add recurring todos.
```

or use the natural-language router:

```text
$goalkeeper-do

Add recurring todos.
```

Goalkeeper classifies the request. Small isolated changes route to `$goalkeeper-quick`; scope-changing features route to `$goalkeeper-plan` so the agent can add a wave/step, create a new phase, or insert a dependency phase without losing current state.

### 12. Prepare To Ship

After phases are verified and gaps are closed:

```text
$goalkeeper-ship
```

Goalkeeper writes a readiness packet under:

```text
.goalkeeper/ship/
```

The packet summarizes open work, gaps, archive evidence, verification records, git state, recent commits, and a draft PR/release body. It must stop for approval before push, publish, deploy, PR creation, merge, or package release.

### 13. Pause And Resume

At the end of a session:

```text
$goalkeeper-pause

Reason: end of session.
```

Later:

```text
$goalkeeper-resume
```

The agent reloads `.goalkeeper/resume-snapshot.md`, checks docs/code/git consistency, and continues from the next safe phase or step.

## Current Status

Goalkeeper `0.1.0` is an alpha workflow package.

It is useful for dogfooding real projects, but it is not a daemon and does not autonomously execute product work by itself. It gives the LLM a durable harness, state files, skills, and guardrails.

## Development

```bash
npm run check
npm run smoke
```

`npm run smoke` covers syntax, package health, init/new-project routing, scoped artifact validation, fake-done evidence blocking, and recommended-command drift.

Publish:

```bash
npm run publish:0.1
```

`publish:0.1` reads `NPM_TOKEN` from `.env` or the environment and uses a temporary npm config file.
