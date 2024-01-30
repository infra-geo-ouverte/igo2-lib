import { resolve } from 'path';

import { PATHS, getPackageJson } from '../config/paths';
import { writeFile2 } from '../utils/file-system.utils';
import * as log from '../utils/log';
import { getDuration } from '../utils/performance.utils';

const baseCmdName = 'Clean exports';

(async () => {
  const startTime = performance.now();
  const [_nodePath, _scriptPath, name] = process.argv;

  log.startMsg(`${baseCmdName} for ${name}`);

  // Remove any Typescript references for Distribution
  const packageJSON = getPackageJson('dist', name);
  const rootExports = packageJSON.exports['.'];
  if (rootExports && typeof rootExports === 'object' && rootExports?.import) {
    delete rootExports?.import;
  }
  await writeFile2(resolve(PATHS.dist, name, 'package.json'), packageJSON);

  const duration = getDuration(startTime);
  log.info(`${baseCmdName} in ${duration}`);
})();
