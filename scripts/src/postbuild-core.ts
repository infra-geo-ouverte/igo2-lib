import { renameSync } from 'fs';
import path from 'path';
import { copyFile, pathExist } from './utils/file-system.utils';
import { compileStyle } from './utils/style.utils';
import { readdir } from 'fs/promises';

const distPath = 'dist/core';
const packagesPath = 'packages/core';

(() => {
  fixPackagesThemesImport();

  copyExternalAssets();

  prebuiltThemes();

  compileBaseStyle();

  compileAllBaseStyle();
})();

function copyExternalAssets() {
  const input = 'node_modules/@mdi/angular-material/mdi.svg';
  const output = path.join(distPath, 'assets/icons/mdi.svg');
  copyFile(input, output);
}

function fixPackagesThemesImport() {
  const fileName = 'themes-import';
  const indexPath = path.join(distPath, `${fileName}.scss`);
  const indexProdPath = path.join(distPath, `${fileName}.prod.scss`);

  // Handle the case when we trigger manually the script
  if (!pathExist(indexProdPath)) {
    return;
  }

  if (!pathExist(distPath)) {
    throw new Error("Dist folder doesn't exist");
  }

  renameSync(indexProdPath, indexPath);
}

async function compileBaseStyle() {
  const input = path.join(packagesPath, '/src/style/style.scss');
  await compileStyle(input, path.join(distPath, '/style'), 'style.css');
}

async function compileAllBaseStyle() {
  const input = path.join(packagesPath, '/src/style/all-style.scss');
  await compileStyle(input, path.join(distPath, '/style'), 'all-style.css');
}

async function prebuiltThemes() {
  const destination = path.join(distPath, '/style/theming/prebuilt-themes');
  const themeFolder = path.join(
    packagesPath,
    '/src/style/theming/prebuilt-themes'
  );

  const files = await readdir(themeFolder);
  const themeFiles = files.filter((filePath) =>
    filePath.includes('theme.scss')
  );
  for (const theme of themeFiles) {
    const input = `${themeFolder}/${theme}`;
    const fileName = theme.replace('scss', 'css');
    await compileStyle(input, destination, fileName);
  }
}
