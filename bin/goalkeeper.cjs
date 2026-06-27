#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const STATE_SCRIPT = path.join(ROOT, 'scripts', 'goalkeeper-state.cjs');
const VERSION = readPackageVersion();

function readPackageVersion() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
  } catch {
    return '0.0.0';
  }
}

function usage() {
  console.log(`Goalkeeper ${VERSION}

Usage:
  goalkeeper                         run install wizard
  goalkeeper install [options]       install Goalkeeper skills
  goalkeeper update [options]        update installed skills from npm latest
  goalkeeper uninstall [options]     remove Goalkeeper skills
  goalkeeper init [dir] [options]    create .goalkeeper artifacts
  goalkeeper new [dir] --idea TEXT   helper: write new-project intake packet
  goalkeeper do [dir] --text TEXT    helper: route freeform intent to a skill
  goalkeeper quick [dir] [options]   helper: create/list/status/resume quick tasks
  goalkeeper map-codebase [dir]      helper: write compact .goalkeeper/codebase docs
  goalkeeper ship [dir] [options]    helper: write ship readiness packet
  goalkeeper status [dir]            helper: show current Goalkeeper state
  goalkeeper config [dir]            helper: print project config JSON
  goalkeeper next [dir]              helper: show next action card
  goalkeeper loop [dir]              helper: print one bounded loop card
  goalkeeper pause [dir] [options]   pause and sync state
  goalkeeper validate [dir]          validate artifacts
  goalkeeper analyze-phase <dir> <PHASE-ID>
  goalkeeper doctor                  inspect package and install targets

Install/update options:
  --agent codex|claude|both          target agent, default: prompt
  --scope user|project               install scope, default: user
  --target DIR                       custom skills directory
  --force                            overwrite existing goalkeeper-* skills
  --config-dir DIR                   custom agent config root; uses DIR/skills
  --dry-run                          print actions only
  --yes                              use defaults without prompting
  --global                           update global npm package too
  --skills-only                      update skills only, skip global npm package

Project options:
  --force                            overwrite generated Goalkeeper files
  --dry-run                          init only: print actions only
  --context7 yes|no|unknown          new only, default: unknown
  --autonomy A0|A1|A2|A3|A4          new only, default: A1
  --text TEXT                        do/quick text
  --research                         quick only: request research before execution
  --validate                         quick only: request validation/review before done
  --full                             quick only: request research + validation
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) return wizard(args);
  if (command === '-h' || command === '--help' || command === 'help') return usage();
  if (command === '-v' || command === '--version' || command === 'version') {
    console.log(VERSION);
    return;
  }

  const rest = args.slice(1);
  if (command === 'install') return installCommand(rest);
  if (command === 'update' || command === 'upgrade') return updateCommand(rest);
  if (command === 'uninstall' || command === 'remove' || command === 'rm') return uninstallCommand(rest);
  if (command === 'init') return initCommand(rest);
  if (command === 'new' || command === 'new-project') return newProjectCommand(rest);
  if (command === 'do') return doCommand(rest);
  if (command === 'quick') return quickCommand(rest);
  if (command === 'map-codebase' || command === 'map') return mapCodebaseCommand(rest);
  if (command === 'ship') return shipCommand(rest);
  if (command === 'status') return stateCommand('status', rest);
  if (command === 'config') return stateCommand('config', rest);
  if (command === 'next') return stateCommand('next', rest);
  if (command === 'loop') return stateCommand('loop', rest);
  if (command === 'validate') return stateCommand('validate', rest);
  if (command === 'analyze-phase') return analyzePhaseCommand(rest);
  if (command === 'pause') return pauseCommand(rest);
  if (command === 'doctor') return doctorCommand();

  fail(`unknown command: ${command}\nRun "goalkeeper --help" for usage.`);
}

async function wizard(args) {
  console.log(`Goalkeeper ${VERSION}`);
  console.log('Install workflow skills for your LLM coding agent.\n');

  const defaults = parseOptions(args);
  const agent = defaults.agent || await choose('Install for:', [
    ['codex', 'Codex'],
    ['claude', 'Claude Code'],
    ['both', 'Both'],
    ['custom', 'Custom skills path'],
  ], 'codex');

  const scope = agent === 'custom'
    ? 'custom'
    : defaults.scope || await choose('Scope:', [
      ['user', 'User/global'],
      ['project', 'Current project'],
    ], 'user');

  let target = defaults.target;
  if (agent === 'custom' && !target) {
    target = await ask('Custom skills directory: ');
    if (!target.trim()) fail('custom skills directory is required');
  }

  const force = defaults.force || await confirm('Overwrite existing goalkeeper-* skills if present?', false);
  installSkills({ agent, scope, target, force, dryRun: defaults.dryRun });

  const shouldInit = await confirm('Initialize .goalkeeper in this directory too?', false);
  if (shouldInit) runShellScript('goalkeeper-init.sh', [process.cwd(), force ? '--force' : '']);
}

function installCommand(args) {
  const options = parseOptions(args);
  const target = resolveCustomTarget(options);
  const agent = target ? 'custom' : options.agent || (options.yes ? 'codex' : null);
  const scope = options.scope || 'user';

  if (!agent) {
    console.log('No --agent provided. Running wizard.\n');
    return wizard(args);
  }

  installSkills({
    agent,
    scope,
    target,
    force: options.force,
    dryRun: options.dryRun,
  });
}

function updateCommand(args) {
  const options = parseOptions(args);
  const target = resolveCustomTarget(options);
  const agent = target ? 'custom' : options.agent || (options.yes ? 'codex' : null);
  const scope = options.scope || 'user';

  if (!agent) {
    fail('update requires --agent codex|claude|both, --target DIR, or --yes for the Codex default');
  }

  if (options.global && options.skillsOnly) fail('use either --global or --skills-only, not both');

  const installArgs = ['@goalkpr/goalkeeper@latest', 'install', '--force'];
  if (target) installArgs.push('--target', path.resolve(expandHome(target)));
  else installArgs.push('--agent', agent, '--scope', scope);
  if (options.dryRun) installArgs.push('--dry-run');
  if (options.yes) installArgs.push('--yes');

  if (options.dryRun) {
    if (options.global) console.log('dry-run: npm install -g @goalkpr/goalkeeper@latest');
    console.log(`dry-run: npx --yes ${installArgs.join(' ')}`);
    return;
  }

  if (options.global) {
    console.log('update: npm install -g @goalkpr/goalkeeper@latest');
    runCommand('npm', ['install', '-g', '@goalkpr/goalkeeper@latest']);
    if (process.exitCode) return;
  }

  console.log('update: installing latest Goalkeeper skills from npm');
  runCommand('npx', ['--yes', ...installArgs]);
}

function uninstallCommand(args) {
  const options = parseOptions(args);
  const target = resolveCustomTarget(options);
  const agent = target ? 'custom' : options.agent || (options.yes ? 'codex' : null);
  const scope = options.scope || 'user';

  if (!agent) {
    fail('uninstall requires --agent codex|claude|both, --target DIR, or --yes for the Codex default');
  }

  uninstallSkills({
    agent,
    scope,
    target,
    dryRun: options.dryRun,
  });
}

function initCommand(args) {
  const options = parseOptions(args);
  const target = firstPositional(args) || '.';
  const scriptArgs = [target];
  if (options.force) scriptArgs.push('--force');
  if (options.dryRun) scriptArgs.push('--dry-run');
  runShellScript('goalkeeper-init.sh', scriptArgs);
}

function newProjectCommand(args) {
  const options = parseOptions(args);
  const target = firstPositional(args) || '.';
  if (!options.idea) fail('new requires --idea TEXT');

  const scriptArgs = [
    target,
    '--idea', options.idea,
    '--context7', options.context7 || 'unknown',
    '--autonomy', options.autonomy || 'A1',
  ];
  if (options.force) scriptArgs.push('--force');
  runShellScript('goalkeeper-new-project.sh', scriptArgs);
}

function doCommand(args) {
  const options = parseOptions(args);
  const positionals = positionalArgs(args);
  const target = positionals[0] || '.';
  const text = options.text || positionals.slice(1).join(' ');
  runNode(STATE_SCRIPT, ['do', target, text]);
}

function quickCommand(args) {
  const options = parseOptions(args);
  const positionals = positionalArgs(args);
  const subcommands = new Set(['run', 'list', 'status', 'resume']);
  let target = '.';
  let subcommand = 'run';
  let subArgs = [];

  if (positionals[0] && subcommands.has(positionals[0])) {
    subcommand = positionals[0];
    subArgs = positionals.slice(1);
  } else {
    target = positionals[0] || '.';
    if (positionals[1] && subcommands.has(positionals[1])) {
      subcommand = positionals[1];
      subArgs = positionals.slice(2);
    } else {
      subArgs = positionals.slice(1);
    }
  }

  const targetDir = path.resolve(expandHome(target));
  const gkDir = path.join(targetDir, '.goalkeeper');
  if (!fs.existsSync(gkDir)) fail(`.goalkeeper not found in ${targetDir}`);
  const quickRoot = path.join(gkDir, 'quick');
  fs.mkdirSync(quickRoot, { recursive: true });

  if (subcommand === 'list') return quickList(quickRoot);
  if (subcommand === 'status') return quickStatus(quickRoot, subArgs[0]);
  if (subcommand === 'resume') return quickResume(quickRoot, subArgs[0]);
  return quickRun({ targetDir, gkDir, quickRoot, text: options.text || subArgs.join(' '), options });
}

function quickRun({ targetDir, gkDir, quickRoot, text, options }) {
  if (!text || !text.trim()) fail('quick requires --text TEXT or a task description');
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
  const shortSlug = slugify(text).slice(0, 48) || 'quick-task';
  const slug = `${stamp}-${shortSlug}`;
  const dir = path.join(quickRoot, slug);
  const file = path.join(dir, 'quick.md');
  const research = Boolean(options.research || options.full);
  const validate = Boolean(options.validate || options.full);
  fs.mkdirSync(dir, { recursive: true });
  const body = `# Quick Task

Slug: ${slug}
Status: ready
Created: ${now.toISOString()}
Mode: quick
Research requested: ${research ? 'yes' : 'no'}
Validation requested: ${validate ? 'yes' : 'no'}

## Request

${text.trim()}

## Acceptance Checks

- Define the smallest safe change before editing.
- Record changed files and commands.
- Verify the result before marking done.

## Changed Files

- pending

## Commands

- pending

## Verification

- pending

## Summary

Pending execution.

## Next

recommended_command: $goalkeeper-quick
`;
  fs.writeFileSync(file, body);
  appendProgress(gkDir, `- Index: created quick task ${slug}\n- Detail: .goalkeeper/quick/${slug}/quick.md\n`);
  console.log('Goalkeeper quick');
  console.log(`quick: .goalkeeper/quick/${slug}/quick.md`);
  console.log(`slug: ${slug}`);
  console.log('status: ready');
  console.log('recommended_command: $goalkeeper-quick');
}

function quickList(quickRoot) {
  console.log('Goalkeeper quick tasks');
  const entries = quickEntries(quickRoot);
  if (entries.length === 0) {
    console.log('none');
    return;
  }
  for (const entry of entries) {
    const markdown = fs.readFileSync(path.join(entry.path, 'quick.md'), 'utf8');
    console.log(`${entry.slug}\t${field(markdown, 'Status') || 'unknown'}\t${field(markdown, 'Created') || 'unknown'}`);
  }
}

function quickStatus(quickRoot, slug) {
  const entry = requireQuickEntry(quickRoot, slug);
  const markdown = fs.readFileSync(path.join(entry.path, 'quick.md'), 'utf8');
  console.log(`Quick Task: ${entry.slug}`);
  console.log(`Status: ${field(markdown, 'Status') || 'unknown'}`);
  console.log(`Created: ${field(markdown, 'Created') || 'unknown'}`);
  console.log(`File: .goalkeeper/quick/${entry.slug}/quick.md`);
  console.log(`Request: ${firstSectionLine(markdown, '## Request') || 'unknown'}`);
}

function quickResume(quickRoot, slug) {
  const entry = requireQuickEntry(quickRoot, slug);
  const markdown = fs.readFileSync(path.join(entry.path, 'quick.md'), 'utf8');
  console.log('Goalkeeper quick resume');
  console.log(`slug: ${entry.slug}`);
  console.log(`status: ${field(markdown, 'Status') || 'unknown'}`);
  console.log(`file: .goalkeeper/quick/${entry.slug}/quick.md`);
  console.log(`request: ${firstSectionLine(markdown, '## Request') || 'unknown'}`);
  console.log('recommended_command: $goalkeeper-quick');
}

function mapCodebaseCommand(args) {
  const target = firstPositional(args) || '.';
  const targetDir = path.resolve(expandHome(target));
  const gkDir = path.join(targetDir, '.goalkeeper');
  if (!fs.existsSync(gkDir)) fail(`.goalkeeper not found in ${targetDir}`);
  const codebaseDir = path.join(gkDir, 'codebase');
  fs.mkdirSync(codebaseDir, { recursive: true });

  const now = new Date().toISOString();
  const snapshot = inspectCodebase(targetDir);
  const docs = codebaseDocs(snapshot, now);
  for (const [filename, body] of Object.entries(docs)) {
    fs.writeFileSync(path.join(codebaseDir, filename), body);
  }
  appendProgress(gkDir, `- Index: refreshed codebase map\n- Detail: .goalkeeper/codebase/structure.md\n`);

  console.log('Goalkeeper codebase map');
  for (const filename of Object.keys(docs).sort()) {
    console.log(`write: .goalkeeper/codebase/${filename}`);
  }
  console.log('recommended_command: $goalkeeper-next');
}

function shipCommand(args) {
  const options = parseOptions(args);
  const target = firstPositional(args) || '.';
  const targetDir = path.resolve(expandHome(target));
  const gkDir = path.join(targetDir, '.goalkeeper');
  if (!fs.existsSync(gkDir)) fail(`.goalkeeper not found in ${targetDir}`);
  const shipRoot = path.join(gkDir, 'ship');
  fs.mkdirSync(shipRoot, { recursive: true });

  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
  const file = path.join(shipRoot, `${stamp}-ship-readiness.md`);
  const readiness = inspectShipReadiness(targetDir, gkDir);
  const status = readiness.blockers.length === 0 ? 'ready' : 'blocked';
  const recommended = status === 'ready' ? '$goalkeeper-ship' : recommendedShipFollowup(readiness);
  const body = shipReadinessBody({ now: now.toISOString(), status, recommended, readiness });

  if (!options.dryRun) {
    fs.writeFileSync(file, body);
    appendProgress(gkDir, `- Index: wrote ship readiness packet\n- Detail: .goalkeeper/ship/${path.basename(file)}\n`);
  }

  console.log('Goalkeeper ship');
  console.log(`status: ${status}`);
  if (!options.dryRun) console.log(`ship: .goalkeeper/ship/${path.basename(file)}`);
  else console.log('ship: dry-run');
  for (const blocker of readiness.blockers) console.log(`blocker: ${blocker}`);
  console.log(`recommended_command: ${recommended}`);
}

function quickEntries(quickRoot) {
  if (!fs.existsSync(quickRoot)) return [];
  return fs.readdirSync(quickRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ slug: entry.name, path: path.join(quickRoot, entry.name) }))
    .filter((entry) => /^[a-zA-Z0-9-]+$/.test(entry.slug) && fs.existsSync(path.join(entry.path, 'quick.md')))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function inspectCodebase(targetDir) {
  const ignore = new Set([
    '.git',
    '.goalkeeper',
    '.agents',
    '.claude',
    '.docs',
    '.vscode',
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.next',
    '.turbo',
    '.cache',
  ]);
  const entries = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter((entry) => !ignore.has(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const manifests = readManifests(targetDir);
  const scripts = manifests.packageJson?.scripts || {};
  return {
    targetDir,
    dirs,
    files,
    manifests,
    scripts,
    git: gitSnapshot(targetDir),
  };
}

function inspectShipReadiness(targetDir, gkDir) {
  const phasePlan = readText(path.join(gkDir, 'phase-plan.md'));
  const verification = readText(path.join(gkDir, 'verification-log.md'));
  const openWork = openWorkItems(phasePlan);
  const verificationCount = (verification.match(/^## VER-/gm) || []).length;
  const openGaps = listMarkdownFiles(path.join(gkDir, 'gaps'))
    .filter((file) => /^Status:\s*open$/m.test(readText(file)));
  const archives = listMarkdownFiles(path.join(gkDir, 'archive'));
  const git = gitSnapshot(targetDir);
  const blockers = [];
  if (openWork.length > 0) blockers.push(`${openWork.length} open phase/wave/step item(s)`);
  if (openGaps.length > 0) blockers.push(`${openGaps.length} open gap report(s)`);
  if (verificationCount === 0) blockers.push('no verification records found');
  if (git.dirty) blockers.push('working tree has uncommitted changes');
  return {
    openWork,
    openGaps: openGaps.map((file) => path.relative(targetDir, file)),
    archives: archives.map((file) => path.relative(targetDir, file)),
    verificationCount,
    git,
    blockers,
  };
}

function openWorkItems(phasePlan) {
  const items = [];
  let current = '';
  for (const line of phasePlan.split(/\r?\n/)) {
    const heading = line.match(/^(#{2,4})\s+((?:PHASE|WAVE|STEP)-[A-Z0-9-]+):\s*(.+)$/);
    if (heading) {
      current = `${heading[2]}: ${heading[3].trim()}`;
      continue;
    }
    const status = line.match(/^Status:\s*(.*)$/);
    if (!status || !current) continue;
    const value = status[1].trim().toLowerCase();
    if (!['done', 'verified', 'skipped', 'complete'].includes(value)) {
      items.push(`${current} (${value || 'missing status'})`);
    }
  }
  return items;
}

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function readText(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function recommendedShipFollowup(readiness) {
  if (readiness.openGaps.length > 0) return '$goalkeeper-close-gaps';
  if (readiness.verificationCount === 0) return '$goalkeeper-verify';
  return '$goalkeeper-next';
}

function shipReadinessBody({ now, status, recommended, readiness }) {
  return `# Ship Readiness

Date: ${now}
Status: ${status}
Recommended command: ${recommended}

## Blockers

${readiness.blockers.map((blocker) => `- ${blocker}`).join('\n') || '- none'}

## Open Work

${readiness.openWork.map((item) => `- ${item}`).join('\n') || '- none'}

## Open Gaps

${readiness.openGaps.map((file) => `- ${file}`).join('\n') || '- none'}

## Archive Evidence

${readiness.archives.map((file) => `- ${file}`).join('\n') || '- none'}

## Verification Records

- Count: ${readiness.verificationCount}

## Working Tree

\`\`\`text
${readiness.git.dirty || (readiness.git.hasGit ? 'clean' : 'No git repo.')}
\`\`\`

## Recent Commits

\`\`\`text
${readiness.git.commits || 'No commits available.'}
\`\`\`

## Draft PR Body

### Summary

- Pending final verified summary.

### Verification

- Pending final verification evidence.

### Risks

- Review blockers above before external action.

## Approval Gate

Do not push, publish, deploy, or open a PR without explicit user approval.
`;
}

function readManifests(targetDir) {
  const out = {};
  const packagePath = path.join(targetDir, 'package.json');
  if (fs.existsSync(packagePath)) {
    try {
      out.packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    } catch {
      out.packageJson = null;
    }
  }
  out.present = [
    'package.json',
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    'tsconfig.json',
    'vite.config.ts',
    'vite.config.js',
    'next.config.js',
    'next.config.mjs',
    'pyproject.toml',
    'requirements.txt',
    'Cargo.toml',
    'go.mod',
  ].filter((file) => fs.existsSync(path.join(targetDir, file)));
  return out;
}

function gitSnapshot(targetDir) {
  if (!fs.existsSync(path.join(targetDir, '.git'))) return { hasGit: false, dirty: '', commits: '' };
  const status = spawnSync('git', ['status', '--short'], { cwd: targetDir, encoding: 'utf8' });
  const log = spawnSync('git', ['log', '--oneline', '-5'], { cwd: targetDir, encoding: 'utf8' });
  return {
    hasGit: true,
    dirty: status.status === 0 ? status.stdout.trim() : '',
    commits: log.status === 0 ? log.stdout.trim() : '',
  };
}

function codebaseDocs(snapshot, now) {
  const packageName = snapshot.manifests.packageJson?.name || 'unknown';
  const deps = Object.keys(snapshot.manifests.packageJson?.dependencies || {});
  const devDeps = Object.keys(snapshot.manifests.packageJson?.devDependencies || {});
  const scripts = Object.entries(snapshot.scripts);
  const manifestLines = snapshot.manifests.present.map((file) => `- ${file}`).join('\n') || '- none detected';
  const dirLines = snapshot.dirs.map((dir) => `- ${dir}/`).join('\n') || '- none detected';
  const fileLines = snapshot.files.slice(0, 40).map((file) => `- ${file}`).join('\n') || '- none detected';
  const scriptLines = scripts.map(([name, command]) => `- \`${name}\`: \`${command}\``).join('\n') || '- none detected';
  const depLines = deps.slice(0, 30).map((name) => `- ${name}`).join('\n') || '- none detected';
  const devDepLines = devDeps.slice(0, 30).map((name) => `- ${name}`).join('\n') || '- none detected';
  const dirtyLines = snapshot.git.dirty || 'clean or unavailable';
  const commitLines = snapshot.git.commits || 'none available';

  return {
    'structure.md': `# Codebase Structure

Generated: ${now}
Package: ${packageName}

## Top-Level Directories

${dirLines}

## Top-Level Files

${fileLines}

## Manifests

${manifestLines}
`,
    'architecture.md': `# Codebase Architecture

Generated: ${now}

## Current Read

- Architecture summary is pending human/agent refinement.
- Start from top-level folders in \`structure.md\`.
- Update this file after the first implementation wave identifies real module boundaries.

## Likely Entry Points

${likelyEntryPoints(snapshot).map((entry) => `- ${entry}`).join('\n') || '- unknown'}
`,
    'stack.md': `# Codebase Stack

Generated: ${now}

## Package

- Name: ${packageName}
- Type: ${snapshot.manifests.packageJson?.type || 'unknown'}

## Dependencies

${depLines}

## Dev Dependencies

${devDepLines}
`,
    'testing.md': `# Codebase Testing

Generated: ${now}

## Scripts

${scriptLines}

## Suggested Verification

- Prefer the narrowest relevant script first.
- Run the full smoke/check command before claiming completion.
`,
    'conventions.md': `# Codebase Conventions

Generated: ${now}

## Observed

- Keep edits consistent with nearby files.
- Prefer existing scripts and project-local helpers.
- Update Goalkeeper artifacts after each bounded work loop.
`,
    'integrations.md': `# Codebase Integrations

Generated: ${now}

## Manifests and External Surfaces

${manifestLines}

## Notes

- Add API, database, deployment, MCP, and cloud integrations here as they are discovered.
`,
    'risks.md': `# Codebase Risks

Generated: ${now}

## Git State

\`\`\`text
${dirtyLines}
\`\`\`

## Recent Commits

\`\`\`text
${commitLines}
\`\`\`

## Open Risks

- Generated map is structural only; verify architecture assumptions before large changes.
`,
  };
}

function likelyEntryPoints(snapshot) {
  const candidates = [
    'package.json',
    'src/index.ts',
    'src/index.js',
    'src/main.ts',
    'src/main.js',
    'app/page.tsx',
    'pages/index.tsx',
    'bin/goalkeeper.cjs',
    'README.md',
  ];
  return candidates.filter((candidate) => fs.existsSync(path.join(snapshot.targetDir, candidate)));
}

function requireQuickEntry(quickRoot, slug) {
  if (!slug || !/^[a-zA-Z0-9-]+$/.test(slug)) fail('quick status/resume requires a valid slug');
  const entry = quickEntries(quickRoot).find((candidate) => candidate.slug === slug || candidate.slug.endsWith(`-${slug}`));
  if (!entry) fail(`quick task not found: ${slug}`);
  return entry;
}

function field(markdown, name) {
  const match = markdown.match(new RegExp(`^${escapeRegex(name)}:\\s*(.*)$`, 'm'));
  return match ? match[1].trim() : '';
}

function firstSectionLine(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  let found = false;
  for (const line of lines) {
    if (line.trim() === heading) {
      found = true;
      continue;
    }
    if (found && /^##\s+/.test(line)) return '';
    if (found && line.trim()) return line.trim();
  }
  return '';
}

function appendProgress(gkDir, entry) {
  const file = path.join(gkDir, 'progress-log.md');
  const now = new Date().toISOString();
  fs.appendFileSync(file, `\n## ${now}\n\n${entry}`);
}

function stateCommand(command, args) {
  const target = firstPositional(args) || '.';
  runNode(STATE_SCRIPT, [command, target]);
}

function analyzePhaseCommand(args) {
  const positionals = positionalArgs(args);
  const target = positionals[0] || '.';
  const phase = positionals[1];
  if (!phase) fail('analyze-phase requires <dir> <PHASE-ID>');
  runNode(STATE_SCRIPT, ['analyze-phase', target, phase]);
}

function pauseCommand(args) {
  const options = parseOptions(args);
  const target = firstPositional(args) || '.';
  const scriptArgs = [target];
  if (options.reason) scriptArgs.push('--reason', options.reason);
  runShellScript('goalkeeper-pause.sh', scriptArgs);
}

function doctorCommand() {
  const expected = listSkillNames();
  console.log(`Goalkeeper ${VERSION}`);
  console.log(`package_root: ${ROOT}`);
  console.log(`node: ${process.version}`);
  console.log(`skills: ${SKILLS_DIR} (${expected.length} skills)`);
  console.log(`templates: ${TEMPLATES_DIR}`);
  console.log(`state_script: ${fs.existsSync(STATE_SCRIPT) ? 'present' : 'missing'}`);
  for (const agent of ['codex', 'claude']) {
    for (const scope of ['user', 'project']) {
      const target = targetFor(agent, scope);
      const installed = installedSkillNames(target, expected);
      const missing = expected.filter((name) => !installed.includes(name));
      const status = missing.length === 0 ? 'complete' : (installed.length === 0 ? 'missing' : 'partial');
      console.log(`${agent}_${scope}_target: ${target}`);
      console.log(`${agent}_${scope}_installed: ${installed.length}/${expected.length} ${status}`);
      if (missing.length > 0 && installed.length > 0) console.log(`${agent}_${scope}_missing: ${missing.join(', ')}`);
    }
  }
}

function installSkills({ agent, scope, target, force, dryRun }) {
  const targets = resolveTargets(agent, scope, target);
  if (targets.length === 0) fail('no install targets resolved');

  for (const installTarget of targets) {
    copySkillSet(installTarget, { force, dryRun });
  }
}

function uninstallSkills({ agent, scope, target, dryRun }) {
  const targets = resolveTargets(agent, scope, target);
  if (targets.length === 0) fail('no uninstall targets resolved');

  for (const uninstallTarget of targets) {
    removeSkillSet(uninstallTarget, { dryRun });
  }
}

function resolveTargets(agent, scope, target) {
  if (target) return [path.resolve(expandHome(target))];
  if (agent === 'custom') fail('--target is required for custom install');
  if (agent === 'both') return [targetFor('codex', scope), targetFor('claude', scope)];
  if (agent === 'codex' || agent === 'claude') return [targetFor(agent, scope)];
  fail(`unknown agent: ${agent}`);
}

function resolveCustomTarget(options) {
  if (options.target && options.configDir) fail('use either --target or --config-dir, not both');
  if (options.target) return options.target;
  if (options.configDir) return path.join(options.configDir, 'skills');
  return null;
}

function targetFor(agent, scope) {
  if (scope !== 'user' && scope !== 'project') fail(`unknown scope: ${scope}`);
  if (scope === 'project') {
    return path.join(process.cwd(), agent === 'codex' ? '.agents' : '.claude', 'skills');
  }
  if (agent === 'codex') {
    return path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'skills');
  }
  if (agent === 'claude') {
    return path.join(
      process.env.CLAUDE_CONFIG_DIR || process.env.CLAUDE_HOME || path.join(os.homedir(), '.claude'),
      'skills'
    );
  }
  fail(`unknown agent: ${agent}`);
}

function copySkillSet(target, { force, dryRun }) {
  if (!fs.existsSync(SKILLS_DIR)) fail(`skills dir missing: ${SKILLS_DIR}`);
  if (dryRun) console.log(`dry-run: mkdir -p ${target}`);
  else fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(SKILLS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('goalkeeper-')) continue;
    const src = path.join(SKILLS_DIR, entry.name);
    const dst = path.join(target, entry.name);

    if (fs.existsSync(dst) && !force) {
      console.log(`skip: ${entry.name} exists. use --force to overwrite`);
      continue;
    }
    if (dryRun) {
      if (fs.existsSync(dst) && force) console.log(`dry-run: rm -rf ${dst}`);
      console.log(`dry-run: cp -R ${src} ${dst}`);
      continue;
    }
    if (fs.existsSync(dst) && force) fs.rmSync(dst, { recursive: true, force: true });
    fs.cpSync(src, dst, { recursive: true });
    console.log(`install: ${entry.name} -> ${dst}`);
  }
  console.log(`ok: Goalkeeper skills installed to ${target}`);
}

function removeSkillSet(target, { dryRun }) {
  const expected = listSkillNames();
  if (dryRun) console.log(`dry-run: inspect ${target}`);

  let removed = 0;
  for (const name of expected) {
    const dst = path.join(target, name);
    if (!fs.existsSync(dst)) {
      console.log(`skip: ${name} not installed at ${target}`);
      continue;
    }
    if (dryRun) {
      console.log(`dry-run: rm -rf ${dst}`);
      removed += 1;
      continue;
    }
    fs.rmSync(dst, { recursive: true, force: true });
    console.log(`remove: ${name} -> ${dst}`);
    removed += 1;
  }
  console.log(`ok: removed ${removed} Goalkeeper skill${removed === 1 ? '' : 's'} from ${target}`);
}

function runShellScript(name, args) {
  const script = path.join(ROOT, 'scripts', name);
  if (!fs.existsSync(script)) fail(`script missing: ${script}`);
  run('bash', [script, ...args.filter(Boolean)]);
}

function runNode(file, args) {
  if (!fs.existsSync(file)) fail(`script missing: ${file}`);
  run(process.execPath, [file, ...args.filter(Boolean)]);
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) fail(result.error.message);
  process.exitCode = result.status || 0;
}

function runCommand(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) fail(result.error.message);
  process.exitCode = result.status || 0;
}

function parseOptions(args) {
  const options = {
    force: false,
    dryRun: false,
    yes: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;
    const [rawKey, inlineValue] = arg.slice(2).split('=', 2);
    const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

    if (['force', 'dryRun', 'yes', 'research', 'validate', 'full', 'global', 'skillsOnly'].includes(key)) {
      options[key] = true;
      continue;
    }

    const value = inlineValue !== undefined ? inlineValue : args[i + 1];
    if (value === undefined || value.startsWith('--')) fail(`missing value for --${rawKey}`);
    options[key] = value;
    if (inlineValue === undefined) i += 1;
  }
  return options;
}

function positionalArgs(args) {
  const out = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      out.push(arg);
      continue;
    }
    const key = arg.slice(2).split('=', 1)[0].replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    if (!['force', 'dryRun', 'yes', 'research', 'validate', 'full', 'global', 'skillsOnly'].includes(key) && !arg.includes('=')) i += 1;
  }
  return out;
}

function firstPositional(args) {
  return positionalArgs(args)[0];
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function choose(question, choices, defaultValue) {
  console.log(question);
  choices.forEach(([value, label], index) => {
    const marker = value === defaultValue ? ' default' : '';
    console.log(`  ${index + 1}) ${label}${marker}`);
  });
  const answer = (await ask('Select: ')).trim();
  if (!answer) return defaultValue;
  const numeric = Number(answer);
  if (Number.isInteger(numeric) && choices[numeric - 1]) return choices[numeric - 1][0];
  const match = choices.find(([value]) => value === answer);
  if (match) return match[0];
  fail(`invalid selection: ${answer}`);
}

async function confirm(question, defaultValue) {
  const suffix = defaultValue ? 'Y/n' : 'y/N';
  const answer = (await ask(`${question} [${suffix}] `)).trim().toLowerCase();
  if (!answer) return defaultValue;
  return answer === 'y' || answer === 'yes';
}

function expandHome(value) {
  if (value === '~') return os.homedir();
  if (value.startsWith('~/')) return path.join(os.homedir(), value.slice(2));
  return value;
}

function slugify(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countSkillDirs() {
  return listSkillNames().length;
}

function listSkillNames() {
  try {
    return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.startsWith('goalkeeper-'))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

function installedSkillNames(target, expected) {
  return expected.filter((name) => fs.existsSync(path.join(target, name, 'SKILL.md')));
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

main().catch((error) => {
  fail(error && error.message ? error.message : String(error));
});
