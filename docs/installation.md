# Installation

Goalkeeper v0.1 has local install, init, and harness scripts.

## Install Skills

Install Goalkeeper skills into Codex:

```bash
bash scripts/install-skills.sh
```

Options:

```bash
bash scripts/install-skills.sh --dry-run
bash scripts/install-skills.sh --force
bash scripts/install-skills.sh --target "$HOME/.codex/skills"
```

## Initialize Project

Create `.goalkeeper/` in a target project:

```bash
bash scripts/goalkeeper-init.sh /path/to/project
```

Options:

```bash
bash scripts/goalkeeper-init.sh . --dry-run
bash scripts/goalkeeper-init.sh . --force
```

`goalkeeper-init.sh` creates:

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
  quick/
  phases/
  archive/
  gaps/
  templates/
```

## Inspect Harness

After init:

```bash
bash scripts/goalkeeper-new-project.sh /path/to/project --idea "build a p2p mobile chat app" --context7 unknown
node bin/goalkeeper.cjs do /path/to/project --text "what next?"
node bin/goalkeeper.cjs quick /path/to/project --text "fix typo in README"
node bin/goalkeeper.cjs map-codebase /path/to/project
bash scripts/goalkeeper-status.sh /path/to/project
node scripts/goalkeeper-state.cjs config /path/to/project
bash scripts/goalkeeper-next.sh /path/to/project
bash scripts/goalkeeper-loop.sh /path/to/project
bash scripts/goalkeeper-pause.sh /path/to/project --reason "stopping work"
bash scripts/goalkeeper-validate.sh /path/to/project
bash scripts/goalkeeper-analyze-phase.sh /path/to/project PHASE-0001
```
