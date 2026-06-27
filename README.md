# Goalkeeper

Goalkeeper is a workflow harness for long-running LLM coding projects.

It gives agents a durable goal loop:

```text
New Project -> Clarify -> Research -> Decide -> Plan -> Execute -> Verify -> Snapshot -> Continue
```

Instead of trusting chat history, Goalkeeper writes the project goal, decisions, phase plan, verification evidence, gaps, and resume state into `.goalkeeper/` files that any later agent session can reload.

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

From inside your project folder:

```bash
npx @goalkpr/goalkeeper init .
```

`init` creates `.goalkeeper/`.

Then continue in your agent chat:

```text
$goalkeeper-new-project

I want to build a simple p2p mobile chat app.
```

The skill records the raw idea and starts discovery. Goalkeeper should interrogate the idea before planning implementation.

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
$goalkeeper-intake
$goalkeeper-research
$goalkeeper-plan
$goalkeeper-execute
$goalkeeper-verify
$goalkeeper-analyze-phase
$goalkeeper-close-gaps
$goalkeeper-pause
$goalkeeper-resume
```

The LLM performs the work and updates the files. The CLI is only the installer/bootstrapper plus optional state/debug helper.

## CLI Helper Commands

```bash
npx @goalkpr/goalkeeper install --agent codex --scope user
npx @goalkpr/goalkeeper uninstall --agent codex --scope user
npx @goalkpr/goalkeeper init .
npx @goalkpr/goalkeeper validate .
npx @goalkpr/goalkeeper doctor
```

Most users only need `install` and `init`, then continue in chat with `$goalkeeper-*` skills.

The CLI also includes shell helpers like `status`, `next`, `loop`, `pause`, and `analyze-phase`. They are for skills, debugging, and maintainers. They are not the main user workflow.

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
  archive/
  gaps/
  templates/
```

Important files:

- `goal-contract.md`: what success means.
- `phase-plan.md`: Phase -> Wave -> Step plan.
- `always-read.md`: rules the agent must read before every loop.
- `compression-profile.md`: built-in token discipline for subagents.
- `next-target.md`: larger next phase target, not tiny local drift.
- `resume-snapshot.md`: compact recovery state if context is lost.
- `gaps/`: missing work found after phase analysis.
- `archive/`: verified phase completion reports.

## Phase, Wave, Step

Goalkeeper plans work as:

```text
Phase -> Wave -> Step
```

- Phase: milestone-sized body of work.
- Wave: steps that share dependencies and may be parallelized.
- Step: smallest executable and verifiable unit.

Independent wave steps can be sent to subagents. Subagents use `compression-profile.md` by default, so Goalkeeper does not depend on an external "caveman" skill.

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
goalkeeper-intake
goalkeeper-plan
goalkeeper-execute
goalkeeper-verify
goalkeeper-next
goalkeeper-pause
goalkeeper-resume
```

### 2. Initialize The Project

```bash
mkdir todo-app
cd todo-app
npx @goalkpr/goalkeeper init .
```

Goalkeeper creates `.goalkeeper/` with bootstrap state files.

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
.goalkeeper/resume-snapshot.md
```

The first useful question should be narrow, for example:

```text
Who is the first real user of this TODO app, and what exact job are they trying to finish?
```

You might answer:

```text
Me. I want a local web app where I can add tasks, mark them done, filter active/completed, and keep the list after refresh.
```

The agent records that answer in `discovery-log.md`.

### 4. Turn Answers Into A Goal Contract

Tell the agent:

```text
$goalkeeper-intake
```

Goalkeeper turns the raw idea into `goal-contract.md`, roughly:

```text
Goal:
Build a local TODO web app.

Success criteria:
- User can add a task.
- User can mark a task done.
- User can delete a task.
- User can filter all/active/completed.
- Tasks persist after refresh.

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

### 6. Create Phases, Waves, And Steps

Tell the agent:

```text
$goalkeeper-plan
```

The agent writes `phase-plan.md`:

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

If steps are independent, Goalkeeper can mark a wave as `Dispatch: subagents`. Subagents use `.goalkeeper/compression-profile.md`.

### 7. Execute One Bounded Loop

Ask:

```text
$goalkeeper-loop
```

The skill reads the current phase, wave, step, mode, dispatch type, and next action. It may call the local CLI helper internally when useful. The agent then uses:

```text
$goalkeeper-execute
```

It should do only the selected step, then update:

```text
.goalkeeper/progress-log.md
.goalkeeper/phase-plan.md
.goalkeeper/resume-snapshot.md
.goalkeeper/next-target.md
```

### 8. Verify Before Marking Done

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

The evidence goes into:

```text
.goalkeeper/verification-log.md
```

Goalkeeper should not mark a step or phase done without evidence.

### 9. Analyze The Phase

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

### 10. Pause And Resume

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

Publish:

```bash
npm run publish:0.1
```

`publish:0.1` reads `NPM_TOKEN` from `.env` or the environment and uses a temporary npm config file.
