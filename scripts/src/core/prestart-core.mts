import { performance } from 'perf_hooks';

import { PackageName } from '../config/packages.mts';
import * as log from '../utils/log.mts';
import { getDuration } from '../utils/performance.utils.mts';
import { copyAssets, copyExternalAssets } from './utils/assets.mts';
import { bundleLocalization } from './utils/localization.mts';

const packageName: PackageName = 'core';
const baseCmdName = `Prepare @igo2/${packageName}`;

(async () => {
  const startTime = performance.now();
  log.startMsg(baseCmdName);

  await bundleLocalization();

  await copyExternalAssets();
  await copyAssets();

  const duration = getDuration(startTime);
  log.info(`${baseCmdName} excuted in ${duration}`);
})();
