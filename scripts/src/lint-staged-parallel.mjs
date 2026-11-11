#!/usr/bin/env node
/**
 * Runs lint or type-check in parallel for the specified packages.
 * Used by lint-staged so only affected packages are checked and their
 * output is captured and surfaced by lint-staged on failure.
 *
 * Usage:
 *   node scripts/src/lint-staged-parallel.mjs lint  <ng-project-names...>
 *   node scripts/src/lint-staged-parallel.mjs types <npm-workspace-names...>
 */
import { execa } from 'execa';

const [mode, ...targets] = process.argv.slice(2);

if (!targets.length) process.exit(0);

const spawn = (target) =>
  mode === 'lint'
    ? execa('ng', ['lint', target, '--quiet'], { all: true })
    : execa('npm', ['run', 'types', '-w', target], { all: true });

const results = await Promise.allSettled(targets.map(spawn));

let failed = false;
for (let i = 0; i < results.length; i++) {
  const r = results[i];
  const output =
    r.status === 'fulfilled'
      ? r.value.all
      : (r.reason.all ?? r.reason.stderr ?? r.reason.message);

  if (output?.trim()) {
    process.stdout.write(`\n[${targets[i]}]\n${output.trim()}\n`);
  }
  if (r.status === 'rejected') failed = true;
}

process.exit(failed ? 1 : 0);
