import { performance } from 'perf_hooks';

import { PackageName } from '../config/packages';
import * as log from '../utils/log';
import { getDuration } from '../utils/performance.utils';
import { copyAssets, copyExternalAssets } from './utils/assets';
import { bundleLocalization } from './utils/localization';

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
