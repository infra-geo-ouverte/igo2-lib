import path from 'path';
import { compileStyle } from './utils/style.utils';

const distPath = 'dist/geo';
const packagesPath = 'packages/geo';

(() => {
  compileBaseStyle();
})();

async function compileBaseStyle() {
  const input = path.join(packagesPath, '/src/style/style.scss');
  await compileStyle(input, path.join(distPath, '/style'), 'style.css');
}
