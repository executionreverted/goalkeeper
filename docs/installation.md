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
npx @goalkpr/goalkeeper init /path/to/project
```

Options:

```bash
npx @goalkpr/goalkeeper init . --dry-run
npx @goalkpr/goalkeeper init . --force
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
  ship/
  phases/
  archive/
  gaps/
  templates/
```

## Inspect Harness

After init:

```bash
node bin/goalkeeper.cjs new /path/to/project --idea "build a p2p mobile chat app" --context7 unknown
node bin/goalkeeper.cjs do /path/to/project --text "what next?"
node bin/goalkeeper.cjs quick /path/to/project --text "fix typo in README"
node bin/goalkeeper.cjs map-codebase /path/to/project
node bin/goalkeeper.cjs ship /path/to/project
node bin/goalkeeper.cjs status /path/to/project
node bin/goalkeeper.cjs config /path/to/project
node bin/goalkeeper.cjs next /path/to/project
node bin/goalkeeper.cjs loop /path/to/project
node bin/goalkeeper.cjs pause /path/to/project --reason "stopping work"
node bin/goalkeeper.cjs validate /path/to/project
node bin/goalkeeper.cjs analyze-phase /path/to/project PHASE-0001
```
