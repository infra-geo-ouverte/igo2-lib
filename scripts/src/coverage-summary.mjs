import { appendFileSync, existsSync, readFileSync } from 'fs';

const path = 'coverage/coverage-summary.json';
if (!existsSync(path)) process.exit(0);

const summary = JSON.parse(readFileSync(path, 'utf8')).total;
const fmt = (m) => `${m.covered}/${m.total} (${m.pct}%)`;

const md = [
  '## Coverage Summary',
  '| | Statements | Branches | Functions | Lines |',
  '|---|---|---|---|---|',
  `| **Total** | ${fmt(summary.statements)} | ${fmt(summary.branches)} | ${fmt(summary.functions)} | ${fmt(summary.lines)} |`
].join('\n');

appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
