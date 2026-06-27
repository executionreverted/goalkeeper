# Goalkeeper

Goalkeeper is an artifact-driven workflow harness for long-running LLM coding work.

It installs `goalkeeper-*` skills and provides a small CLI for creating and resuming `.goalkeeper/` project state.

## Install

```bash
npx @canersevince/goalkeeper
```

The wizard asks whether to install skills for Codex, Claude Code, both, or a custom skills directory.

Non-interactive examples:

```bash
npx @canersevince/goalkeeper install --agent codex --scope user --force
npx @canersevince/goalkeeper install --agent claude --scope project
```

For a persistent local command:

```bash
npm install -g @canersevince/goalkeeper
```

## Project Commands

```bash
npx @canersevince/goalkeeper init .
npx @canersevince/goalkeeper new . --idea "build a simple p2p mobile chat app"
npx @canersevince/goalkeeper status .
npx @canersevince/goalkeeper next .
npx @canersevince/goalkeeper loop .
npx @canersevince/goalkeeper pause . --reason "stopping work"
npx @canersevince/goalkeeper validate .
npx @canersevince/goalkeeper analyze-phase . PHASE-0001
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
