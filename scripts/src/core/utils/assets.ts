import { join } from 'path';
import { copyFile } from '../../utils/file-system.utils';
import { performance } from 'perf_hooks';
import { getDuration } from '../../utils/performance.utils';
import { PATHS, resolveDist, resolvePackage } from '../../config/paths';
import * as log from '../../utils/log';
import { cp } from 'fs/promises';
import { PackageName } from '../../config/packages';

const packageName: PackageName = 'core';
const distPath = resolveDist(packageName);

export async function copyExternalAssets(): Promise<void> {
  const startTime = performance.now();
  const input = join(PATHS.nodeModules, '@mdi/angular-material/mdi.svg');
  const output = join(distPath, 'assets/icons/mdi.svg');

  await copyFile(input, output);

  const duration = getDuration(startTime);
  log.success(`✔ Copy external asset in ${duration}`);
}

export async function copyAssets(): Promise<void> {
  const startTime = performance.now();
  const input = join(resolvePackage('core'), 'src/assets');
  const output = join(distPath, 'assets');

  await cp(input, output, { recursive: true });

  const duration = getDuration(startTime);
  log.success(`✔ Copy asset in ${duration}`);
}
