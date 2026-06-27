# Goalkeeper

Goalkeeper is an artifact-driven workflow harness for long-running LLM coding work.

It installs `goalkeeper-*` skills and provides a small CLI for creating and resuming `.goalkeeper/` project state.

## Install

```bash
npx @goalkpr/goalkeeper
```

The wizard asks whether to install skills for Codex, Claude Code, both, or a custom skills directory.

Non-interactive examples:

```bash
npx @goalkpr/goalkeeper install --agent codex --scope user --force
npx @goalkpr/goalkeeper install --agent claude --scope project
```

For a persistent local command:

```bash
npm install -g @goalkpr/goalkeeper
```

## Project Commands

```bash
npx @goalkpr/goalkeeper init .
npx @goalkpr/goalkeeper new . --idea "build a simple p2p mobile chat app"
npx @goalkpr/goalkeeper status .
npx @goalkpr/goalkeeper next .
npx @goalkpr/goalkeeper loop .
npx @goalkpr/goalkeeper pause . --reason "stopping work"
npx @goalkpr/goalkeeper validate .
npx @goalkpr/goalkeeper analyze-phase . PHASE-0001
```

## Package Contents

```text
docs/
scripts/
skills/
templates/
```

## Notes

The npm package name is scoped because `goalkeeper` is already taken on npm. The installed binary is still named `goalkeeper`.

## Publish

Set `NPM_TOKEN` in `.env`, then run:

```bash
npm run publish:0.1
```
