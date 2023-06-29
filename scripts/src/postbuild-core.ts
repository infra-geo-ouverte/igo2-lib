import { renameSync } from 'fs';
import path from 'path';
import { copyFile, pathExist } from './utils/file-system.utils';
import { compileStyle } from './utils/style.utils';
import { readdir } from 'fs/promises';

const distPath = 'dist/core';
const packagesPath = 'packages/core';
const styleDest = path.join(distPath, '/style');

(async () => {
  fixPackagesThemesImport();

  copyExternalAssets();

  await prebuiltThemes();

  await compileBaseStyle();

  await compileAllBaseStyle();
})();

async function copyExternalAssets(): Promise<void> {
  const input = 'node_modules/@mdi/angular-material/mdi.svg';
  const output = path.join(distPath, 'assets/icons/mdi.svg');
  await copyFile(input, output);
}

// Allow to import styles in production or in local. This will give us the flexibility to extends our style and debug.
function fixPackagesThemesImport(): void {
  const localImport = path.join(distPath, 'themes-import.scss');
  const prodImport = path.join(distPath, 'themes-import.prod.scss');

  // Handle the case when we trigger manually the script
  if (!pathExist(prodImport)) {
    return;
  }

  // Replace the theme-import file by theme-import.prod
  renameSync(prodImport, localImport);
}

async function compileBaseStyle(): Promise<void> {
  const input = path.join(packagesPath, '/src/style/style.scss');
  await compileStyle(input, styleDest, 'style.css');
}

async function compileAllBaseStyle(): Promise<void> {
  const input = path.join(packagesPath, '/src/style/all-style.scss');
  await compileStyle(input, styleDest, 'all-style.css');
}

async function prebuiltThemes(): Promise<void> {
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
