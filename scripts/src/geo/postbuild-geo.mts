import { join } from 'path';

import { PackageName, cleanPackageExports } from '../config/packages.mts';
import { resolveDist, resolvePackage } from '../config/paths.mts';
import * as log from '../utils/log.mts';
import { getDuration } from '../utils/performance.utils.mts';
import { compileStyle } from '../utils/style.utils.mts';

const packageName: PackageName = 'geo';
const baseCmdName = `Postbuild @igo2/${packageName}`;
const distPath = resolveDist(packageName);
const packagesPath = resolvePackage(packageName);

(async () => {
  const startTime = performance.now();
  log.startMsg(baseCmdName);

  await cleanPackageExports('geo');
  log.success(`✔ Cleaning package.json exports`);

  await compileBaseStyle();

  const duration = getDuration(startTime);
  log.info(`${baseCmdName} excuted in ${duration}`);
})();

async function compileBaseStyle() {
  const input = join(packagesPath, '/src/style/style.scss');
  await compileStyle(input, join(distPath, '/style'), 'style.css');

  log.success(`✔ Compiling base style`);
}
