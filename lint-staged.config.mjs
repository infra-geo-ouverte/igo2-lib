/** Maps Angular project names to their root directories and npm workspace names. */
const PROJECTS = [
  { name: 'demo', root: 'projects/demo', workspace: 'demo' },
  { name: 'auth', root: 'packages/auth', workspace: '@igo2/auth' },
  { name: 'common', root: 'packages/common', workspace: '@igo2/common' },
  { name: 'core', root: 'packages/core', workspace: '@igo2/core' },
  { name: 'geo', root: 'packages/geo', workspace: '@igo2/geo' },
  { name: 'utils', root: 'packages/utils', workspace: '@igo2/utils' },
  { name: 'context', root: 'packages/context', workspace: '@igo2/context' },
  {
    name: 'integration',
    root: 'packages/integration',
    workspace: '@igo2/integration'
  }
];

const PARALLEL = 'node scripts/src/lint-staged-parallel.mjs';

/** Returns only the projects that contain at least one staged file. */
function getAffectedProjects(files) {
  const normalized = files.map((f) => f.replace(/\\/g, '/'));
  return PROJECTS.filter(({ root }) =>
    normalized.some((f) => f.includes(`/${root}/`))
  );
}

export default {
  // Format staged files with Prettier
  '*.{ts,html,scss,css,json,md,mts,mjs,js}':
    'prettier --write --config .prettierrc',

  // Lint only the packages that have staged files, running them in parallel.
  // Returns a shell command so lint-staged captures stdout/stderr
  '*.{ts,html}': (files) => {
    const affected = getAffectedProjects(files);
    if (!affected.length) return [];
    return `${PARALLEL} lint ${affected.map((p) => p.name).join(' ')}`;
  },

  // Type-check only the packages that have staged TypeScript files, in parallel.
  '*.ts': (files) => {
    const affected = getAffectedProjects(files);
    if (!affected.length) return [];
    return `${PARALLEL} types ${affected.map((p) => p.workspace).join(' ')}`;
  }
};
