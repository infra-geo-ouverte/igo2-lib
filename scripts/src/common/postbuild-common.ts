import { join } from 'path';
import { compileStyle } from '../utils/style.utils';
import { resolveDist, resolvePackage } from '../config/paths';
import { PackageName } from '../config/packages';
import * as log from '../utils/log';
import { getDuration } from '../utils/performance.utils';

const packageName: PackageName = 'common';
const distPath = resolveDist(packageName);
const packagesPath = resolvePackage(packageName);

const baseCmdName = `Postbuild @igo2/${packageName}`;

(async () => {
  const startTime = performance.now();
  log.startMsg(baseCmdName);

  await compileBaseStyle();

  const duration = getDuration(startTime);
  log.info(`${baseCmdName} excuted in ${duration}`);
})();

async function compileBaseStyle() {
  const input = join(packagesPath, 'src/style/style.scss');
  await compileStyle(input, join(distPath, '/style'), 'style.css');
  log.success(`✔ Compiling base style`);
}
