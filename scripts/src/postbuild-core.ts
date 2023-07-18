import { renameSync } from 'fs';
import path from 'path';
import { copyFile, pathExist } from './utils/file-system.utils';
import { compileStyle } from './utils/style.utils';
import { readdir } from 'fs/promises';
import { performance } from 'perf_hooks';

const distPath = 'dist/core';
const packagesPath = 'packages/core';
const styleDest = path.join(distPath, '/style');

(async () => {
  const startTime = performance.now();

  fixPackagesThemesImport();

  copyExternalAssets();

  await prebuiltThemes();

  await compileBaseStyle();

  await compileAllBaseStyle();

  printPerformance('Postbuild excuted in', startTime);
})();

async function copyExternalAssets(): Promise<void> {
  const startTime = performance.now();
  const input = 'node_modules/@mdi/angular-material/mdi.svg';
  const output = path.join(distPath, 'assets/icons/mdi.svg');

  await copyFile(input, output);

  printPerformance('Copy external asset in', startTime);
}

// Allow to import styles in production or in local. This will give us the flexibility to extends our style and debug.
function fixPackagesThemesImport(): void {
  const startTime = performance.now();

  const localImport = path.join(distPath, 'packages-import.scss');
  const prodImport = path.join(distPath, 'packages-import.prod.scss');

  // Handle the case when we trigger manually the script
  if (!pathExist(prodImport)) {
    return;
  }

  // Replace the theme-import file by theme-import.prod
  renameSync(prodImport, localImport);

  printPerformance('Fix packages themes import in', startTime);
}

async function compileBaseStyle(): Promise<void> {
  const startTime = performance.now();
  const input = path.join(packagesPath, '/src/style/style.scss');
  await compileStyle(input, styleDest, 'style.css');

  printPerformance('Compile base style in', startTime);
}

async function compileAllBaseStyle(): Promise<void> {
  const startTime = performance.now();
  const input = path.join(packagesPath, '/src/style/all-style.scss');
  await compileStyle(input, styleDest, 'all-style.css');

  printPerformance('Compile all base style in', startTime);
}

async function prebuiltThemes(): Promise<void> {
  const startTime = performance.now();
  const destination = path.join(distPath, '/theming/prebuilt-themes');
  const themeFolder = path.join(
    packagesPath,
    '/src/theming/prebuilt-themes'
  );

  const files = await readdir(themeFolder);
  const themeFiles = files.filter((filePath) =>
    filePath.includes('theme.scss')
  );
  for (const theme of themeFiles) {
    const startBuiltTime = performance.now();
    const input = `${themeFolder}/${theme}`;
    const fileName = theme.replace('scss', 'css');
    await compileStyle(input, destination, fileName);
    printPerformance(`Prebuilt ${theme} in`, startBuiltTime);
  }

  printPerformance('Prebuilt all themes in', startTime);
}

function printPerformance(message: string, start: number): void {
  const duration = getPerformanceDuration(start);
  console.log(`${message} ${duration}ms`);
}

/** Duration in ms */
function getPerformanceDuration(start: number): number {
  return Math.round(performance.now() - start);
}
