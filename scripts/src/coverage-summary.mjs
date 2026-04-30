import { appendFileSync, existsSync, readFileSync, readdirSync } from 'fs';

const coverageDir = 'coverage';
if (!existsSync(coverageDir)) process.exit(0);

const packages = readdirSync(coverageDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => ({
    name: d.name,
    path: `${coverageDir}/${d.name}/coverage-summary.json`
  }))
  .filter((p) => existsSync(p.path));

if (packages.length === 0) process.exit(0);

const fmt = (m) => `${m.covered}/${m.total} (${m.pct}%)`;

const aggregate = {
  statements: { total: 0, covered: 0 },
  branches: { total: 0, covered: 0 },
  functions: { total: 0, covered: 0 },
  lines: { total: 0, covered: 0 }
};
const rows = [];

for (const pkg of packages) {
  const { total } = JSON.parse(readFileSync(pkg.path, 'utf8'));
  for (const key of Object.keys(aggregate)) {
    aggregate[key].total += total[key].total;
    aggregate[key].covered += total[key].covered;
  }
  rows.push(
    `| ${pkg.name} | ${fmt(total.statements)} | ${fmt(total.branches)} | ${fmt(total.functions)} | ${fmt(total.lines)} |`
  );
}

for (const key of Object.keys(aggregate)) {
  const m = aggregate[key];
  m.pct = m.total === 0 ? 100 : Math.round((m.covered / m.total) * 10000) / 100;
}

const md = [
  '## Coverage Summary',
  '| Package | Statements | Branches | Functions | Lines |',
  '|---|---|---|---|---|',
  ...rows,
  `| **Total** | ${fmt(aggregate.statements)} | ${fmt(aggregate.branches)} | ${fmt(aggregate.functions)} | ${fmt(aggregate.lines)} |`
].join('\n');

appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
