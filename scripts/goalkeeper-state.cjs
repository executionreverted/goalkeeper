#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

function fail(message, code = 1) {
  console.error(`error: ${message}`);
  process.exit(code);
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function parseJson(raw, label) {
  if (!raw.trim()) return { value: null, error: `${label} is empty or missing` };
  try {
    return { value: JSON.parse(raw), error: '' };
  } catch (error) {
    return { value: null, error: `${label} is invalid JSON: ${error.message}` };
  }
}

function firstLineAfter(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  let found = false;
  for (const line of lines) {
    if (line.trim() === heading) {
      found = true;
      continue;
    }
    if (found && line.startsWith('## ')) return '';
    if (found && line.trim()) return line.trim();
  }
  return '';
}

function parseKeyValue(line) {
  const match = line.match(/^([A-Za-z][A-Za-z /-]*):\s*(.*)$/);
  if (!match) return null;
  return [match[1].trim().toLowerCase().replace(/[ /-]+/g, '_'), match[2].trim()];
}

function normalizeStatus(value) {
  return (value || '').trim().toLowerCase();
}

function isClosed(status) {
  return ['done', 'verified', 'skipped', 'complete'].includes(normalizeStatus(status));
}

function isActionable(status) {
  return ['ready', 'in_progress', 'needs_review', 'blocked'].includes(normalizeStatus(status));
}

function parsePhasePlan(markdown) {
  const phases = [];
  let phase = null;
  let wave = null;
  let step = null;
  let current = null;
  let multilineKey = '';

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    let match = line.match(/^## (PHASE-\d+):\s*(.+)$/);
    if (match) {
      phase = { id: match[1], title: match[2].trim(), status: '', waves: [], fields: {} };
      phases.push(phase);
      wave = null;
      step = null;
      current = phase;
      multilineKey = '';
      continue;
    }

    match = line.match(/^### (WAVE-\d+-[A-Z]):\s*(.+)$/);
    if (match && phase) {
      wave = { id: match[1], title: match[2].trim(), status: '', parallelizable: '', dispatch: '', steps: [], fields: {} };
      phase.waves.push(wave);
      step = null;
      current = wave;
      multilineKey = '';
      continue;
    }

    match = line.match(/^#### (STEP-\d+-[A-Z]-\d+):\s*(.+)$/);
    if (match && wave) {
      step = { id: match[1], title: match[2].trim(), status: '', owner: '', verification_evidence: '', fields: {} };
      wave.steps.push(step);
      current = step;
      multilineKey = '';
      continue;
    }

    if (!current) continue;
    if (multilineKey && line.trim() && !parseKeyValue(line)) {
      current.fields[multilineKey] = [current.fields[multilineKey], line.trim()].filter(Boolean).join('\n');
      if (multilineKey === 'verification_evidence') current.verification_evidence = current.fields[multilineKey];
      continue;
    }
    const kv = parseKeyValue(line);
    if (!kv) {
      if (!line.trim()) multilineKey = '';
      continue;
    }
    const [key, value] = kv;
    current.fields[key] = value;
    multilineKey = value ? '' : key;
    if (key === 'status') current.status = value;
    if (key === 'parallelizable') current.parallelizable = value;
    if (key === 'dispatch') current.dispatch = value;
    if (key === 'owner') current.owner = value;
    if (key === 'verification_evidence') current.verification_evidence = value;
  }

  return phases;
}

function parseNextTarget(markdown) {
  const phaseLine = firstLineAfter(markdown, '## Current Active Scope');
  const nextPhaseTarget = firstLineAfter(markdown, '## Next Phase Target');
  const recommendedCommand = firstLineAfter(markdown, '## Recommended Command');
  const phaseMatch = markdown.match(/^Phase:\s*(PHASE-\d+)(?::\s*(.*))?$/m);
  const waveMatch = markdown.match(/^Wave:\s*(WAVE-\d+-[A-Z])(?::\s*(.*))?$/m);
  const stepMatch = markdown.match(/^Step:\s*(STEP-\d+-[A-Z]-\d+)(?::\s*(.*))?$/m);
  const confidenceMatch = markdown.match(/^Confidence:\s*(.*)$/m);
  return {
    current_scope_line: phaseLine,
    phase_id: phaseMatch ? phaseMatch[1] : '',
    wave_id: waveMatch ? waveMatch[1] : '',
    step_id: stepMatch ? stepMatch[1] : '',
    next_phase_target: nextPhaseTarget,
    recommended_command: recommendedCommand,
    confidence: confidenceMatch ? confidenceMatch[1].trim() : '',
  };
}

function loadProject(targetArg) {
  const targetDir = path.resolve(targetArg || '.');
  const gkDir = path.join(targetDir, '.goalkeeper');
  if (!fs.existsSync(gkDir)) fail(`.goalkeeper not found in ${targetDir}`);
  const phasePlanPath = path.join(gkDir, 'phase-plan.md');
  if (!fs.existsSync(phasePlanPath)) fail(`phase-plan.md not found in ${gkDir}`);
  const phasePlan = read(phasePlanPath);
  const nextTarget = read(path.join(gkDir, 'next-target.md'));
  const configRaw = read(path.join(gkDir, 'config.json'));
  const configParsed = parseJson(configRaw, 'config.json');
  return {
    targetDir,
    gkDir,
    phasePlanPath,
    config: configParsed.value,
    configError: configParsed.error,
    phases: parsePhasePlan(phasePlan),
    nextTarget: parseNextTarget(nextTarget),
    goalContract: read(path.join(gkDir, 'goal-contract.md')),
    contextLedger: read(path.join(gkDir, 'context-ledger.md')),
    decisionLog: read(path.join(gkDir, 'decision-log.md')),
    resume: read(path.join(gkDir, 'resume-snapshot.md')),
    verification: read(path.join(gkDir, 'verification-log.md')),
    progress: read(path.join(gkDir, 'progress-log.md')),
  };
}

function findPhase(phases, id) {
  return phases.find((phase) => phase.id === id) || null;
}

function phaseNumber(phaseOrId) {
  const id = typeof phaseOrId === 'string' ? phaseOrId : phaseOrId?.id;
  const match = (id || '').match(/^PHASE-(\d+)$/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function slugTitle(title) {
  return (title || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .filter(Boolean)
    .slice(0, 4)
    .join('-') || 'untitled';
}

function scopedArtifactPaths(project, next) {
  if (!next?.phase) return [];
  return scopedPathsFor(next.phase, next.wave, next.step);
}

function scopedPathsFor(phase, wave = null, step = null) {
  if (!phase) return [];
  const phaseSlug = `${phase.id}-${slugTitle(phase.title)}`;
  const paths = [`.goalkeeper/phases/${phaseSlug}/phase.md`];
  if (wave) {
    const waveSlug = `${wave.id}-${slugTitle(wave.title)}`;
    paths.push(`.goalkeeper/phases/${phaseSlug}/waves/${waveSlug}/wave.md`);
    if (step) {
      const stepSlug = `${step.id}-${slugTitle(step.title)}`;
      paths.push(`.goalkeeper/phases/${phaseSlug}/waves/${waveSlug}/steps/${stepSlug}.md`);
    }
  }
  return paths;
}

function relToAbs(project, relPath) {
  return path.join(project.targetDir, relPath);
}

function expectedScopedArtifactsForPhase(phase) {
  const paths = [...scopedPathsFor(phase)];
  for (const wave of phase.waves) {
    paths.push(...scopedPathsFor(phase, wave).slice(1));
    for (const step of wave.steps) {
      paths.push(...scopedPathsFor(phase, wave, step).slice(2));
    }
  }
  return paths;
}

function scopedStepPath(phase, wave, step) {
  return scopedPathsFor(phase, wave, step).at(-1);
}

function hasRealEvidenceText(markdown) {
  const match = markdown.match(/Verification evidence:\s*([\s\S]*?)(?:\n[A-Z][A-Za-z ]+:\s*|\n## |\n#### |\n### |$)/);
  if (!match) return false;
  const evidence = match[1]
    .split(/\r?\n/)
    .map((line) => line.replace(/^-\s*/, '').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
  if (!evidence) return false;
  return !/^(TBD|Pending|Pending discovery|Pending discovery-log evidence|\[?\s*\]?)\.?$/i.test(evidence);
}

function stepHasScopedEvidence(project, phase, wave, step) {
  const relPath = scopedStepPath(phase, wave, step);
  if (!relPath) return false;
  const absPath = relToAbs(project, relPath);
  if (!fs.existsSync(absPath)) return false;
  const markdown = read(absPath);
  const status = (markdown.match(/^Status:\s*(.*)$/m) || [])[1] || '';
  return isClosed(status) && hasRealEvidenceText(markdown);
}

function parseStructuredRecords(markdown, headingRegex) {
  const records = [];
  let record = null;
  let currentKey = '';
  let inFence = false;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const heading = line.match(headingRegex);
    if (heading) {
      record = { id: heading[1], title: heading[2].trim(), fields: {} };
      records.push(record);
      currentKey = '';
      continue;
    }
    if (!record) continue;
    if (/^#{1,3}\s+/.test(line)) {
      currentKey = '';
      continue;
    }
    const kv = parseKeyValue(line);
    if (kv) {
      const [key, value] = kv;
      record.fields[key] = value;
      currentKey = key;
      continue;
    }
    if (currentKey && line.trim()) {
      const nextValue = line.trim();
      record.fields[currentKey] = [record.fields[currentKey], nextValue].filter(Boolean).join('\n');
    }
  }

  return records;
}

function parseDecisions(markdown) {
  return parseStructuredRecords(markdown, /^## (DEC-\d+):\s*(.+)$/);
}

function parseResearchRecords(markdown) {
  return parseStructuredRecords(markdown, /^### (RSR-\d+):\s*(.+)$/);
}

function normalizeResearchQuestion(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function linkedDecisionIds(record) {
  const value = record.fields.decision_links || record.fields.decision_link || '';
  return value.match(/DEC-\d+/g) || [];
}

function suggestPhase(project, requestedId) {
  const requestedNum = phaseNumber(requestedId);
  const phases = project.phases.slice().sort((a, b) => {
    const numDiff = Math.abs(phaseNumber(a) - requestedNum) - Math.abs(phaseNumber(b) - requestedNum);
    return numDiff || a.id.localeCompare(b.id);
  });
  return phases.slice(0, 3).map((phase) => `${phase.id}: ${phase.title}`);
}

function findWave(phase, id) {
  return phase?.waves.find((wave) => wave.id === id) || null;
}

function findStep(wave, id) {
  return wave?.steps.find((step) => step.id === id) || null;
}

function actionableInPhase(phase) {
  for (const wave of phase.waves) {
    for (const step of wave.steps) {
      if (isActionable(step.status)) return { phase, wave, step };
    }
    if (isActionable(wave.status)) return { phase, wave, step: null };
  }
  if (isActionable(phase.status)) return { phase, wave: null, step: null };
  return null;
}

function selectNext(project) {
  const hinted = findPhase(project.phases, project.nextTarget.phase_id);
  if (hinted) {
    const hintedAction = actionableInPhase(hinted);
    if (hintedAction) return hintedAction;
  }

  for (const phase of project.phases) {
    if (isClosed(phase.status)) continue;
    const found = actionableInPhase(phase);
    if (found) return found;
  }

  return null;
}

function directPhaseDeps(phase) {
  const value = phase?.fields?.depends_on || '';
  if (!value || /^none$/i.test(value)) return [];
  return (value.match(/PHASE-\d+/g) || []);
}

function openPhaseGuards(project, phase) {
  if (!phase) return [];
  const guards = [];
  for (const depId of directPhaseDeps(phase)) {
    const dep = findPhase(project.phases, depId);
    if (!dep) {
      guards.push(`dependency_missing: ${phase.id} depends on ${depId}, but ${depId} is not in phase-plan.md`);
    } else if (!isClosed(dep.status)) {
      guards.push(`dependency_open: ${phase.id} depends on ${dep.id}, but ${dep.id} is ${dep.status || 'missing status'}`);
    }
  }

  const currentNum = phaseNumber(phase);
  const earlierOpen = project.phases
    .filter((candidate) => phaseNumber(candidate) < currentNum)
    .filter((candidate) => !isClosed(candidate.status));
  if (earlierOpen.length > 0) {
    guards.push(`earlier_phase_open: requested ${phase.id}, but ${earlierOpen.map((p) => `${p.id}(${p.status || 'missing'})`).join(', ')} still open`);
  }
  return guards;
}

function printGuards(project, next) {
  const guards = openPhaseGuards(project, next?.phase);
  for (const guard of guards) console.log(`guard: ${guard}`);
  if (guards.length > 0) {
    console.log('ask_user: You are asking for a later phase while an earlier/dependency phase is still open. Continue anyway, or handle the open phase first?');
  }
  return guards;
}

function gitInfo(targetDir) {
  const gitDir = path.join(targetDir, '.git');
  if (!fs.existsSync(gitDir)) return { hasGit: false, dirty: '', commits: '' };
  const status = spawnSync('git', ['status', '--short'], { cwd: targetDir, encoding: 'utf8' });
  const log = spawnSync('git', ['log', '--oneline', '-20'], { cwd: targetDir, encoding: 'utf8' });
  const dirty = status.status === 0 ? status.stdout.trim() : '';
  const commits = log.status === 0 ? log.stdout.trim() : '';
  return { hasGit: true, dirty, commits };
}

function printStatus(project) {
  const next = selectNext(project);
  const status = (project.resume.match(/^Status:\s*(.*)$/m) || [])[1] || 'unknown';
  const currentPhase = (project.resume.match(/^Current phase:\s*(.*)$/m) || [])[1] || 'unknown';
  const blocker = firstLineAfter(project.resume, '## Blockers') || 'none';
  const verificationHeadings = project.verification.match(/^## VER-[^\n]*/gm) || [];
  const lastVerification = verificationHeadings.at(-1) || 'none';

  console.log('Goalkeeper status');
  console.log(`status: ${status}`);
  console.log(`autonomy: ${project.config?.autonomy_level || 'unknown'}`);
  console.log(`context7: ${project.config?.context7 || 'unknown'}`);
  console.log(`current_phase: ${currentPhase}`);
  console.log(`always_read: ${fs.existsSync(path.join(project.gkDir, 'always-read.md')) ? 'present' : 'missing'}`);
  console.log(`phase: ${next?.phase ? `## ${next.phase.id}: ${next.phase.title}` : 'none'}`);
  console.log(`wave: ${next?.wave ? `### ${next.wave.id}: ${next.wave.title}` : 'none'}`);
  console.log(`step: ${next?.step ? `#### ${next.step.id}: ${next.step.title}` : 'none'}`);
  console.log(`next_phase_target: ${project.nextTarget.next_phase_target || 'unknown'}`);
  console.log(`blockers: ${blocker}`);
  console.log(`verification: ${lastVerification}`);
  const paths = scopedArtifactPaths(project, next);
  if (paths.length) console.log(`active_artifacts: ${paths.join(', ')}`);
  console.log(`recommended_command: ${recommendedCommand(project, next)}`);
}

function printConfig(project) {
  console.log('Goalkeeper config');
  if (project.configError) {
    console.log(`error: ${project.configError}`);
    process.exit(1);
  }
  console.log(JSON.stringify(project.config, null, 2));
}

function printDo(project, intent = '') {
  const text = (intent || '').trim();
  const lower = text.toLowerCase();
  const next = selectNext(project);
  const guards = openPhaseGuards(project, next?.phase);
  const mode = guards.length > 0 ? 'blocked' : modeFor(next);
  let command = recommendedCommand(project, next, mode);
  let reason = 'fallback to current Goalkeeper state';

  if (/\b(config|setting|settings|autonomy|context7|model profile|branch strategy|verifier|review required)\b/.test(lower)) {
    command = '$goalkeeper-config';
    reason = 'intent changes or inspects workflow settings';
  } else if (/\b(status|progress|where are we|current state|blocker|blockers)\b/.test(lower)) {
    command = '$goalkeeper-status';
    reason = 'intent asks for state without advancing work';
  } else if (/\b(pause|stop here|save state|sync docs|leave work)\b/.test(lower)) {
    command = '$goalkeeper-pause';
    reason = 'intent asks to stop without advancing';
  } else if (/\b(resume|continue after|context loss|pick up|recover)\b/.test(lower)) {
    command = '$goalkeeper-resume';
    reason = 'intent asks to recover context before continuing';
  } else if (/\b(research|compare|investigate|look up|docs|documentation|which library|which framework)\b/.test(lower)) {
    command = '$goalkeeper-research';
    reason = 'intent asks for evidence before planning or deciding';
  } else if (/\b(map codebase|map the codebase|codebase map|repo map|repository map|map repo|analyze codebase|understand repo|scan repo)\b/.test(lower)) {
    command = '$goalkeeper-map-codebase';
    reason = 'intent asks to create durable repository context';
  } else if (/\b(ship|shipping|release|publish|deploy|pr|pull request|merge|ready to go live)\b/.test(lower)) {
    command = '$goalkeeper-ship';
    reason = 'intent asks to prepare external shipping';
  } else if (/\b(quick|small|tiny|typo|one[- ]?line|minor|hotfix)\b/.test(lower)) {
    command = '$goalkeeper-quick';
    reason = 'intent asks for a small self-contained task';
  } else if (/\b(plan|phase|wave|roadmap|break down|split)\b/.test(lower)) {
    command = hasPendingGoalContract(project) ? '$goalkeeper-intake' : '$goalkeeper-plan';
    reason = command === '$goalkeeper-intake' ? 'goal contract is still pending' : 'intent asks to create or revise the plan';
  } else if (/\b(verify|test|check|review|validate)\b/.test(lower)) {
    command = mode === 'verify' ? '$goalkeeper-verify' : '$goalkeeper-next';
    reason = mode === 'verify' ? 'current item is ready for verification' : 'no current needs_review item was detected';
  } else if (/\b(gap|archive|complete phase|phase complete|analyze phase)\b/.test(lower)) {
    command = '$goalkeeper-analyze-phase';
    reason = 'intent asks for phase completion or gap analysis';
  } else if (isBootstrapPlan(project)) {
    command = '$goalkeeper-new-project';
    reason = 'project is initialized but discovery has not started';
  } else if (/\b(execute|implement|build|fix|add|change|update|continue|next)\b/.test(lower)) {
    command = recommendedCommand(project, next, mode);
    reason = `intent asks to advance work; current mode is ${mode}`;
  }

  console.log('Goalkeeper do');
  console.log(`intent: ${text || 'none'}`);
  if (next?.phase) console.log(`phase: ${next.phase.id}: ${next.phase.title}`);
  if (next?.wave) console.log(`wave: ${next.wave.id}: ${next.wave.title}`);
  if (next?.step) console.log(`step: ${next.step.id}: ${next.step.title}`);
  for (const guard of guards) console.log(`guard: ${guard}`);
  console.log(`reason: ${reason}`);
  console.log(`recommended_command: ${command}`);
}

function printNext(project) {
  const next = selectNext(project);
  console.log('Goalkeeper next');
  if (!next) {
    console.log('mode: none');
    console.log('next: no actionable phase/wave/step found');
    if (project.nextTarget.next_phase_target) console.log(`next_phase_target: ${project.nextTarget.next_phase_target}`);
    console.log(`recommended_command: ${recommendedCommand(project, next, 'none')}`);
    return;
  }
  console.log(`phase: ## ${next.phase.id}: ${next.phase.title}`);
  if (next.wave) console.log(`wave: ### ${next.wave.id}: ${next.wave.title}`);
  if (next.step) console.log(`step: #### ${next.step.id}: ${next.step.title}`);
  const paths = scopedArtifactPaths(project, next);
  if (paths.length) console.log(`active_artifacts: ${paths.join(', ')}`);
  const status = next.step?.status || next.wave?.status || next.phase.status;
  console.log(`status: Status: ${status}`);
  if (next.wave) {
    console.log(`parallel: Parallelizable: ${next.wave.parallelizable || 'unknown'}`);
    console.log(`dispatch: Dispatch: ${next.wave.dispatch || 'main-agent'}`);
  }
  const guards = printGuards(project, next);
  const mode = guards.length > 0 ? 'blocked' : modeFor(next);
  console.log(`mode: ${mode}`);
  if (project.nextTarget.next_phase_target) console.log(`next_phase_target: ${project.nextTarget.next_phase_target}`);
  console.log(`recommended_command: ${recommendedCommand(project, next, mode)}`);
}

function modeFor(next) {
  if (!next) return 'none';
  if (next.phase.id === 'PHASE-0001' && /new project discovery/i.test(next.phase.title)) return 'interrogate';
  const status = normalizeStatus(next.step?.status || next.wave?.status || next.phase.status);
  if (status === 'needs_review') return 'verify';
  if (status === 'blocked') return 'blocked';
  if ((next.wave?.dispatch || '').includes('subagents')) return 'subagents';
  return 'main-agent';
}

function isBootstrapPlan(project) {
  return project.phases.length === 1 && project.phases[0]?.id === 'PHASE-0000';
}

function hasPendingGoalContract(project) {
  const contract = project.goalContract || '';
  return /Pending discovery/i.test(contract) || /Current phase:\s*new_project/i.test(contract);
}

function recommendedCommand(project, next, mode = modeFor(next)) {
  if (isBootstrapPlan(project)) return '$goalkeeper-new-project';
  if (mode === 'interrogate') return '$goalkeeper-new-project';
  if (!next && hasPendingGoalContract(project)) return '$goalkeeper-intake';
  if (mode === 'verify') return '$goalkeeper-verify';
  if (mode === 'subagents' || mode === 'main-agent') return '$goalkeeper-execute';
  if (mode === 'blocked') return '$goalkeeper-status';
  if (!next) return '$goalkeeper-plan';
  return '$goalkeeper-next';
}

function printLoop(project) {
  const next = selectNext(project);
  console.log('Goalkeeper loop');
  console.log('intent: run one bounded goal-loop cycle');
  console.log(`config: autonomy=${project.config?.autonomy_level || 'unknown'}, context7=${project.config?.context7 || 'unknown'}, review_required=${project.config?.review_required_before_done ?? 'unknown'}`);
  console.log('required_read: .goalkeeper/always-read.md, .goalkeeper/config.json, .goalkeeper/compression-profile.md, .goalkeeper/resume-snapshot.md, .goalkeeper/next-target.md, .goalkeeper/goal-contract.md, .goalkeeper/phase-plan.md, active scoped files under .goalkeeper/phases/');
  console.log('preflight: run goalkeeper-validate before edits when available');
  if (!next) {
    console.log('mode: none');
    console.log('action: no actionable phase/wave/step found; inspect goal-contract and archive/done state');
    console.log('stop: ask user whether to create a new phase or finish the goal');
    console.log(`recommended_command: ${recommendedCommand(project, next, 'none')}`);
    return;
  }

  const status = next.step?.status || next.wave?.status || next.phase.status;
  const guards = openPhaseGuards(project, next.phase);
  const mode = guards.length > 0 ? 'blocked' : modeFor(next);
  console.log(`phase: ${next.phase.id}: ${next.phase.title}`);
  if (next.wave) console.log(`wave: ${next.wave.id}: ${next.wave.title}`);
  if (next.step) console.log(`step: ${next.step.id}: ${next.step.title}`);
  const paths = scopedArtifactPaths(project, next);
  if (paths.length) console.log(`active_artifacts: ${paths.join(', ')}`);
  console.log(`status: ${status}`);
  console.log(`mode: ${mode}`);
  console.log(`dispatch: ${next.wave?.dispatch || 'main-agent'}`);
  console.log(`parallelizable: ${next.wave?.parallelizable || 'unknown'}`);
  for (const guard of guards) console.log(`guard: ${guard}`);

  if (mode === 'verify') {
    console.log('action: verify acceptance checks, record evidence, then mark done or return to ready/in_progress');
  } else if (mode === 'interrogate') {
    console.log('action: ask one grill-style discovery question, record the answer, then keep clarifying or hand off to intake');
  } else if (mode === 'blocked') {
    if (guards.length > 0) {
      console.log('action: ask user whether to continue the requested later phase or handle the open earlier/dependency phase first');
    } else {
      console.log('action: inspect blockers, git status, recent commits, and source; ask user only if confidence stays low');
    }
  } else if (mode === 'subagents') {
    console.log('action: split independent steps into subagent briefs using compression-profile, integrate results, then verify');
  } else {
    console.log('action: execute the bounded step, update artifacts, then run verification');
  }

  console.log('after_action: update active scoped phase/wave/step files, phase-plan index, compact root logs, resume-snapshot, and next-target');
  console.log('continue_rule: continue automatically only while autonomy and stop conditions allow');
  console.log(`next_phase_target: ${project.nextTarget.next_phase_target || 'unknown'}`);
  console.log(`recommended_command: ${recommendedCommand(project, next, mode)}`);
}

function validate(project) {
  const requiredFiles = [
    'active-goal.md',
    'always-read.md',
    'compression-profile.md',
    'config.json',
    'project-seed.md',
    'discovery-log.md',
    'goal-contract.md',
    'context-ledger.md',
    'decision-log.md',
    'phase-plan.md',
    'next-target.md',
    'progress-log.md',
    'verification-log.md',
    'resume-snapshot.md',
  ];
  let failCount = 0;
  for (const file of requiredFiles) {
    if (fs.existsSync(path.join(project.gkDir, file))) console.log(`OK ${file}`);
    else {
      console.log(`FAIL missing ${file}`);
      failCount += 1;
    }
  }
  for (const dir of ['archive', 'codebase', 'gaps', 'phases', 'quick', 'ship', 'templates']) {
    if (fs.existsSync(path.join(project.gkDir, dir))) console.log(`OK ${dir}/`);
    else {
      console.log(`FAIL missing ${dir}/`);
      failCount += 1;
    }
  }
  if (project.phases.length === 0) {
    console.log('FAIL no phases parsed');
    failCount += 1;
  }
  if (project.configError) {
    console.log(`FAIL ${project.configError}`);
    failCount += 1;
  } else {
    const validAutonomy = new Set(['A0', 'A1', 'A2', 'A3', 'A4']);
    const validContext7 = new Set(['yes', 'no', 'unknown']);
    const validSubagentPolicy = new Set(['main_only', 'safe_parallel', 'aggressive_parallel']);
    const validModelProfiles = new Set(['inherit', 'budget', 'balanced', 'quality']);
    const validBranchStrategies = new Set(['current_branch', 'phase_branch', 'worktree']);
    if (project.config.version !== 1) {
      console.log(`FAIL config.json version must be 1, got ${project.config.version || 'missing'}`);
      failCount += 1;
    }
    if (!validAutonomy.has(project.config.autonomy_level)) {
      console.log(`FAIL config.json autonomy_level invalid: ${project.config.autonomy_level || 'missing'}`);
      failCount += 1;
    }
    if (!validContext7.has(project.config.context7)) {
      console.log(`FAIL config.json context7 invalid: ${project.config.context7 || 'missing'}`);
      failCount += 1;
    }
    if (!validSubagentPolicy.has(project.config.subagent_policy)) {
      console.log(`FAIL config.json subagent_policy invalid: ${project.config.subagent_policy || 'missing'}`);
      failCount += 1;
    }
    if (!validModelProfiles.has(project.config.model_profile)) {
      console.log(`FAIL config.json model_profile invalid: ${project.config.model_profile || 'missing'}`);
      failCount += 1;
    }
    if (!validBranchStrategies.has(project.config.branch_strategy)) {
      console.log(`FAIL config.json branch_strategy invalid: ${project.config.branch_strategy || 'missing'}`);
      failCount += 1;
    }
    for (const key of ['research_enabled', 'verifier_enabled', 'review_required_before_done', 'commit_docs', 'ship_requires_approval']) {
      if (typeof project.config[key] !== 'boolean') {
        console.log(`FAIL config.json ${key} must be boolean`);
        failCount += 1;
      }
    }
  }
  const validRecordStatuses = new Set(['proposed', 'accepted', 'superseded']);
  const decisions = parseDecisions(project.decisionLog);
  const decisionIds = new Set(decisions.map((decision) => decision.id));
  for (const decision of decisions) {
    const status = normalizeStatus(decision.fields.status);
    if (!validRecordStatuses.has(status)) {
      console.log(`FAIL ${decision.id} invalid decision status: ${decision.fields.status || 'missing'}`);
      failCount += 1;
    }
  }

  const researchRecords = parseResearchRecords(project.contextLedger);
  const activeResearchByQuestion = new Map();
  for (const record of researchRecords) {
    const status = normalizeStatus(record.fields.status);
    if (!validRecordStatuses.has(status)) {
      console.log(`FAIL ${record.id} invalid research status: ${record.fields.status || 'missing'}`);
      failCount += 1;
    }
    const normalizedQuestion = normalizeResearchQuestion(record.fields.normalized_question || record.fields.question);
    if (!normalizedQuestion) {
      console.log(`FAIL ${record.id} missing normalized research question`);
      failCount += 1;
    } else if (status !== 'superseded') {
      const existing = activeResearchByQuestion.get(normalizedQuestion);
      if (existing) {
        console.log(`FAIL duplicate active research question: ${existing} and ${record.id} -> ${normalizedQuestion}`);
        failCount += 1;
      } else {
        activeResearchByQuestion.set(normalizedQuestion, record.id);
      }
    }
    for (const decisionId of linkedDecisionIds(record)) {
      if (!decisionIds.has(decisionId)) {
        console.log(`FAIL ${record.id} links missing decision ${decisionId}`);
        failCount += 1;
      }
    }
  }

  for (const phase of project.phases) {
    if (!phase.status) {
      console.log(`WARN ${phase.id} missing status`);
    }
    for (const relPath of expectedScopedArtifactsForPhase(phase)) {
      if (fs.existsSync(relToAbs(project, relPath))) console.log(`OK ${relPath}`);
      else {
        console.log(`FAIL missing scoped artifact ${relPath}`);
        failCount += 1;
      }
    }
    for (const wave of phase.waves) {
      if (!wave.status) console.log(`WARN ${wave.id} missing status`);
      for (const step of wave.steps) {
        if (!step.status) console.log(`WARN ${step.id} missing status`);
        if (['done', 'verified'].includes(normalizeStatus(step.status))) {
          if (!step.verification_evidence) {
            console.log(`FAIL ${step.id} done/verified without phase-plan verification evidence`);
            failCount += 1;
          }
          if (!stepHasScopedEvidence(project, phase, wave, step)) {
            console.log(`FAIL ${step.id} done/verified without scoped step verification evidence`);
            failCount += 1;
          }
        }
      }
    }
  }
  if (!project.nextTarget.next_phase_target) {
    console.log('FAIL next-target missing Next Phase Target content');
    failCount += 1;
  }
  if (project.nextTarget.phase_id && !findPhase(project.phases, project.nextTarget.phase_id)) {
    console.log(`FAIL next-target phase not found: ${project.nextTarget.phase_id}`);
    const suggestions = suggestPhase(project, project.nextTarget.phase_id);
    if (suggestions.length) console.log(`INFO did_you_mean ${suggestions.join(' | ')}`);
    failCount += 1;
  }
  const selected = selectNext(project);
  const selectedGuards = openPhaseGuards(project, selected?.phase);
  const selectedMode = selectedGuards.length > 0 ? 'blocked' : (selected ? modeFor(selected) : 'none');
  const expectedCommand = recommendedCommand(project, selected, selectedMode);
  if (project.nextTarget.recommended_command && project.nextTarget.recommended_command !== expectedCommand) {
    console.log(`FAIL next-target recommended command mismatch: ${project.nextTarget.recommended_command} != ${expectedCommand}`);
    failCount += 1;
  }
  for (const guard of selectedGuards) console.log(`WARN ${guard}`);
  const git = gitInfo(project.targetDir);
  if (git.hasGit) {
    if (git.dirty) {
      console.log('WARN git dirty');
      console.log(git.dirty);
    } else {
      console.log('OK git clean');
    }
    if (git.commits) {
      console.log('INFO recent commits');
      console.log(git.commits);
    }
  } else {
    console.log('INFO no git repo');
  }
  process.exit(failCount ? 1 : 0);
}

function analyzePhase(project, phaseId) {
  const phase = findPhase(project.phases, phaseId);
  if (!phase) {
    const suggestions = suggestPhase(project, phaseId);
    console.log(`phase_not_found: ${phaseId}`);
    if (suggestions.length) console.log(`did_you_mean: ${suggestions.join(' | ')}`);
    console.log('ask_user: This phase does not exist. Which phase should I analyze?');
    process.exit(2);
  }
  const now = new Date().toISOString();
  const archiveDir = path.join(project.gkDir, 'archive');
  const gapsDir = path.join(project.gkDir, 'gaps');
  fs.mkdirSync(archiveDir, { recursive: true });
  fs.mkdirSync(gapsDir, { recursive: true });
  const safe = phaseId.toLowerCase();
  const archiveFile = path.join(archiveDir, `${safe}-report.md`);
  const gapFile = path.join(gapsDir, `${safe}-gaps.md`);
  const git = gitInfo(project.targetDir);

  const gaps = [];
  for (const relPath of expectedScopedArtifactsForPhase(phase)) {
    if (!fs.existsSync(relToAbs(project, relPath))) {
      gaps.push(`- Missing scoped artifact: ${relPath}`);
    }
  }
  for (const wave of phase.waves) {
    if (!isClosed(wave.status)) gaps.push(`- ### ${wave.id}: ${wave.title} -> Status: ${wave.status || 'missing'}`);
    for (const step of wave.steps) {
      if (!isClosed(step.status)) gaps.push(`- #### ${step.id}: ${step.title} -> Status: ${step.status || 'missing'}`);
      if (['done', 'verified'].includes(normalizeStatus(step.status)) && !step.verification_evidence) {
        gaps.push(`- #### ${step.id}: ${step.title} -> Missing verification evidence`);
      }
      if (['done', 'verified'].includes(normalizeStatus(step.status)) && !stepHasScopedEvidence(project, phase, wave, step)) {
        gaps.push(`- #### ${step.id}: ${step.title} -> Missing scoped step verification evidence`);
      }
    }
  }

  if (gaps.length === 0) {
    if (fs.existsSync(archiveFile)) {
      const gapText = read(gapFile);
      const openGap = /^Status:\s*open$/m.test(gapText);
      if (!openGap) {
        console.log(`already_complete: ${phaseId}`);
        console.log(`archive: ${archiveFile}`);
        console.log('gap_status: none');
        console.log('ask_user: This phase is already archived and no open gaps were found. Want a deep verify pass over docs, code, and commits anyway?');
        return;
      }
    }
    const body = `# Phase Archive Report

Phase: ${phaseId}
Date: ${now}
Status: complete
Commit range: recent 20 commits

## Summary

All required waves/steps in ${phaseId} are complete, verified, or skipped.

## Completed Waves

${phase.waves.map((wave) => `- ${wave.id}: ${wave.title} (${wave.status})`).join('\n') || '- none'}

## Completed Steps

${phase.waves.flatMap((wave) => wave.steps.map((step) => `- ${step.id}: ${step.title} (${step.status})`)).join('\n') || '- none'}

## Verification

See the active scoped phase/wave/step files under .goalkeeper/phases/ plus the compact .goalkeeper/verification-log.md index.

## Commit Evidence

\`\`\`text
${git.commits || 'No commits available.'}
\`\`\`

## Working Tree

\`\`\`text
${git.dirty || (git.hasGit ? 'clean' : 'No git repo.')}
\`\`\`

## Residual Risk

- Parser checks statuses and evidence refs; semantic review still recommended.
`;
    fs.writeFileSync(archiveFile, body);
    if (fs.existsSync(gapFile)) {
      const existingGap = read(gapFile).replace(/^Status:\s*open$/m, 'Status: invalidated');
      if (existingGap.includes('## Invalidated')) {
        fs.writeFileSync(gapFile, existingGap);
      } else {
        fs.writeFileSync(gapFile, `${existingGap}\n## Invalidated\n\nDate: ${now}\nReason: Phase archived as complete.\nArchive: ${archiveFile}\n`);
      }
    }
    console.log(`archive: ${archiveFile}`);
    return;
  }

  const body = `# Gap Report

Phase: ${phaseId}
Date: ${now}
Status: open
Source phase plan: .goalkeeper/phase-plan.md
Commit range: recent 20 commits

## Summary

Gaps found in ${phaseId}.

## Missing Waves/Steps

${gaps.join('\n')}

## Evidence Checked

- .goalkeeper/phase-plan.md
- active scoped files under .goalkeeper/phases/
- .goalkeeper/verification-log.md compact index
- git log/status when available

## Commit Evidence

\`\`\`text
${git.commits || 'No commits available.'}
\`\`\`

## Working Tree

\`\`\`text
${git.dirty || (git.hasGit ? 'clean' : 'No git repo.')}
\`\`\`

## Closure Plan

- Convert each missing item into closure steps.
- Execute using normal Goalkeeper rules.
- Verify.
- Re-run phase analysis.

## Closure Verification

- Pending.

## Invalidated By

Not invalidated.
`;
  fs.writeFileSync(gapFile, body);
  console.log(`gaps: ${gapFile}`);
}

const [command, target = '.', arg] = process.argv.slice(2);
if (!command || ['-h', '--help'].includes(command)) {
  console.log('Usage: goalkeeper-state.cjs <status|config|do|next|loop|validate|analyze-phase|phase-json> [target-dir] [arg]');
  process.exit(command ? 0 : 1);
}

const project = loadProject(target);

if (command === 'status') printStatus(project);
else if (command === 'config') printConfig(project);
else if (command === 'do') printDo(project, arg || '');
else if (command === 'next') printNext(project);
else if (command === 'loop') printLoop(project);
else if (command === 'validate') validate(project);
else if (command === 'analyze-phase') analyzePhase(project, arg || fail('phase id required'));
else if (command === 'phase-json') {
  const phase = findPhase(project.phases, arg || fail('phase id required'));
  if (!phase) {
    const suggestions = suggestPhase(project, arg);
    console.log(`phase_not_found: ${arg}`);
    if (suggestions.length) console.log(`did_you_mean: ${suggestions.join(' | ')}`);
    process.exit(2);
  }
  console.log(JSON.stringify(phase, null, 2));
} else {
  fail(`unknown command: ${command}`);
}
