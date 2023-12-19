import { rm } from 'fs/promises';
import { resolve } from 'path';

import { PACKAGES_RELATIONS, waitOnPackageRelations } from './config/packages';
import { PATHS, getPackageJson } from './config/paths';
import { pathExist, writeFile2 } from './utils/file-system.utils';
import * as log from './utils/log';
import { getDuration } from './utils/performance.utils';

const baseCmdName = 'Build all library';

(async () => {
  const startTime = performance.now();
  log.startMsg(baseCmdName);

  const { $ } = await import('execa');

  if (pathExist(PATHS.dist)) {
    log.info('Deleting dist folder...');
    await rm(PATHS.dist, { recursive: true });
  }

  const promises = Array.from(PACKAGES_RELATIONS).map(
    async ([name, { dependsOn, observer }]) => {
      if (dependsOn) {
        await waitOnPackageRelations(dependsOn);
      }

      await $({ stdio: 'inherit' })`npm run build -w @igo2/${name}`;

      observer.next(true);
    }
  );

  await Promise.all(promises);

  // Remove any Typescript references for Distribution
  await removePublicApiExports();

  const duration = getDuration(startTime);
  log.info(`${baseCmdName} in ${duration}`);
})();

async function removePublicApiExports() {
  for (const [packageName] of PACKAGES_RELATIONS) {
    const packageJSON = getPackageJson('dist', packageName);
    const rootExports = packageJSON.exports['.'];
    if (rootExports && typeof rootExports === 'object' && rootExports?.import) {
      delete rootExports?.import;
    }
    await writeFile2(
      resolve(PATHS.dist, packageName, 'package.json'),
      packageJSON
    );
  }
}
