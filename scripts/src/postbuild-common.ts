import path from 'path';

import { compileStyle } from './utils/style.utils';

const distPath = 'dist/common';
const packagesPath = 'packages/common';

(() => {
  compileBaseStyle();
})();

async function compileBaseStyle() {
  const input = path.join(packagesPath, '/src/style/style.scss');
  await compileStyle(input, path.join(distPath, '/style'), 'style.css');
}
