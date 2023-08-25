import path, { join } from 'path';
import { copyFile, pathExist } from '../utils/file-system.utils';
import { compileStyle } from '../utils/style.utils';
import { readdir } from 'fs/promises';
import { performance } from 'perf_hooks';
import { printPerformance } from '../utils/performance.utils';
import { PATHS } from '../paths';

(async () => {
  const startTime = performance.now();

  copyProdImportationFile();

  copyExternalAssets();

  await prebuiltThemes();

  await compileBaseStyle();

  await compileAllBaseStyle();

  printPerformance('Postbuild excuted in', startTime);
})();

/**
 * We got two files for packages style importation. One for local development and one for production.
 * We need to provide the good file for production.
 */
async function copyProdImportationFile(): Promise<void> {
  const startTime = performance.now();

  const importationFile = join(PATHS.distCore, 'packages.import.scss');
  const prodImport = join(PATHS.coreSrc, 'packages-prod.import.scss');

  if (pathExist(importationFile)) {
    return;
  }

  // Replace the theme-import file by theme-import.prod
  await copyFile(prodImport, importationFile);

  printPerformance('Provide packages style importation for production in', startTime);
}

async function copyExternalAssets(): Promise<void> {
  const startTime = performance.now();
  const input = 'node_modules/@mdi/angular-material/mdi.svg';
  const output = path.join(PATHS.distCore, 'assets/icons/mdi.svg');

  await copyFile(input, output);

  printPerformance('Copy external asset in', startTime);
}

async function compileBaseStyle(): Promise<void> {
  const startTime = performance.now();
  const input = path.join(PATHS.coreSrc, '/style/style.scss');
  await compileStyle(input, PATHS.distCoreStyle, 'style.css');

  printPerformance('Compile base style in', startTime);
}

async function compileAllBaseStyle(): Promise<void> {
  const startTime = performance.now();
  const input = path.join(PATHS.coreSrc, '/style/all-style.scss');
  await compileStyle(input, PATHS.distCoreStyle, 'all-style.css');

  printPerformance('Compile all base style in', startTime);
}

async function prebuiltThemes(): Promise<void> {
  const startTime = performance.now();
  const destination = path.join(PATHS.distCore, '/theming/prebuilt-themes');
  const themeFolder = path.join(PATHS.coreSrc, '/theming/prebuilt-themes');

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
