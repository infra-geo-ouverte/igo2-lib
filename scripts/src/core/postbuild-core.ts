import { readdir } from 'fs/promises';
import { join } from 'path';
import { performance } from 'perf_hooks';

import { PackageName } from '../config/packages';
import { resolveDist, resolvePackage } from '../config/paths';
import { copyFile, pathExist } from '../utils/file-system.utils';
import * as log from '../utils/log';
import { getDuration } from '../utils/performance.utils';
import { compileStyle } from '../utils/style.utils';
import { copyAssets, copyExternalAssets } from './utils/assets';
import { bundleLocalization } from './utils/localization';

const packageName: PackageName = 'core';
const distPath = resolveDist(packageName);
const distStylePath = join(distPath, 'style');
const packagePath = resolvePackage(packageName);
const srcPath = join(packagePath, 'src');
const baseCmdName = `Postbuild @igo2/${packageName}`;

(async () => {
  const startTime = performance.now();
  log.startMsg(baseCmdName);

  await copyProdImportationFile();

  await prebuiltThemes();

  await compileBaseStyle();

  await compileAllBaseStyle();

  await bundleLocalization();

  await copyExternalAssets();
  await copyAssets();

  const duration = getDuration(startTime);
  log.info(`${baseCmdName} excuted in ${duration}`);
})();

/**
 * We got two files for packages style importation. One for local development and one for production.
 * We need to provide the good file for production.
 */
async function copyProdImportationFile(): Promise<void> {
  const startTime = performance.now();

  const importationFile = join(distPath, 'packages.import.scss');
  const prodImport = join(srcPath, 'packages-prod.import.scss');

  if (pathExist(importationFile)) {
    return;
  }

  // Replace the theme-import file by theme-import.prod
  await copyFile(prodImport, importationFile);

  const duration = getDuration(startTime);
  log.success(
    `✔ Provide packages style importation for production in ${duration}`
  );
}

async function compileBaseStyle(): Promise<void> {
  const startTime = performance.now();
  const input = join(srcPath, '/style/style.scss');
  await compileStyle(input, distStylePath, 'style.css');

  const duration = getDuration(startTime);
  log.success(`✔ Compile base style in ${duration}`);
}

async function compileAllBaseStyle(): Promise<void> {
  const startTime = performance.now();
  const input = join(srcPath, '/style/all-style.scss');
  await compileStyle(input, distStylePath, 'all-style.css');

  const duration = getDuration(startTime);
  log.success(`✔ Compile all base style in ${duration}`);
}

async function prebuiltThemes(): Promise<void> {
  const startTime = performance.now();
  const destination = join(distPath, '/theming/prebuilt-themes');
  const themeFolder = join(srcPath, '/theming/prebuilt-themes');

  const files = await readdir(themeFolder);
  const themeFiles = files.filter((filePath) =>
    filePath.includes('theme.scss')
  );
  for (const theme of themeFiles) {
    const startBuiltTime = performance.now();
    const input = `${themeFolder}/${theme}`;
    const fileName = theme.replace('scss', 'css');
    await compileStyle(input, destination, fileName);

    const duration = getDuration(startBuiltTime);
    log.success(`✔ Prebuilt ${theme} in ${duration}`);
  }

  const duration = getDuration(startTime);
  log.info(`Prebuilt all themes in ${duration}`);
}
