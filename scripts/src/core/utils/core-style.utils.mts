import { readdir } from 'fs/promises';
import { join } from 'path';
import { performance } from 'perf_hooks';

import { PackageName } from '../../config/packages.mts';
import { resolveDist, resolvePackage } from '../../config/paths.mts';
import * as log from '../../utils/log.mts';
import { getDuration } from '../../utils/performance.utils.mts';
import { compileStyle } from '../../utils/style.utils.mts';

const packageName: PackageName = 'core';
const distPath = resolveDist(packageName);
const distStylePath = join(distPath, 'style');
const packagePath = resolvePackage(packageName);
const srcPath = join(packagePath, 'src');

export async function compileBaseStyle(): Promise<void> {
  const startTime = performance.now();
  const input = join(srcPath, '/style/style.scss');
  await compileStyle(input, distStylePath, 'style.css');

  const duration = getDuration(startTime);
  log.success(`✔ Compile base style in ${duration}`);
}

export async function compileAllBaseStyle(): Promise<void> {
  const startTime = performance.now();
  const input = join(srcPath, '/style/all-style.scss');
  await compileStyle(input, distStylePath, 'all-style.css');

  const duration = getDuration(startTime);
  log.success(`✔ Compile all base style in ${duration}`);
}

export async function prebuiltThemes(): Promise<void> {
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
