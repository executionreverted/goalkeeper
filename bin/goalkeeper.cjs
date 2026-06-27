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
  goalkeeper uninstall [options]     remove Goalkeeper skills
  goalkeeper init [dir] [options]    create .goalkeeper artifacts
  goalkeeper new [dir] --idea TEXT   helper: write new-project intake packet
  goalkeeper status [dir]            helper: show current Goalkeeper state
  goalkeeper next [dir]              helper: show next action card
  goalkeeper loop [dir]              helper: print one bounded loop card
  goalkeeper pause [dir] [options]   pause and sync state
  goalkeeper validate [dir]          validate artifacts
  goalkeeper analyze-phase <dir> <PHASE-ID>
  goalkeeper doctor                  inspect package and install targets

Install options:
  --agent codex|claude|both          target agent, default: prompt
  --scope user|project               install scope, default: user
  --target DIR                       custom skills directory
  --force                            overwrite existing goalkeeper-* skills
  --config-dir DIR                   custom agent config root; uses DIR/skills
  --dry-run                          print actions only
  --yes                              use defaults without prompting

Project options:
  --force                            overwrite generated Goalkeeper files
  --dry-run                          init only: print actions only
  --context7 yes|no|unknown          new only, default: unknown
  --autonomy A0|A1|A2|A3|A4          new only, default: A1
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
  if (command === 'uninstall' || command === 'remove' || command === 'rm') return uninstallCommand(rest);
  if (command === 'init') return initCommand(rest);
  if (command === 'new' || command === 'new-project') return newProjectCommand(rest);
  if (command === 'status') return stateCommand('status', rest);
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

    if (['force', 'dryRun', 'yes'].includes(key)) {
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
    if (!['force', 'dryRun', 'yes'].includes(key) && !arg.includes('=')) i += 1;
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
