import { cp } from 'fs/promises';
import { join } from 'path';
import { performance } from 'perf_hooks';

import { PackageName } from '../../config/packages.mts';
import { PATHS, resolveDist, resolvePackage } from '../../config/paths.mts';
import { copyFile } from '../../utils/file-system.utils.mts';
import * as log from '../../utils/log.mts';
import { getDuration } from '../../utils/performance.utils.mts';

const packageName: PackageName = 'core';
const distPath = resolveDist(packageName);

export async function copyExternalAssets(): Promise<void> {
  const startTime = performance.now();

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
