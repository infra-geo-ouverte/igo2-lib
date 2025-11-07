import { $ } from 'execa';
import { rm } from 'fs/promises';

import {
  PACKAGES_RELATIONS,
  waitOnPackageRelations
} from './config/packages.mts';
import { PATHS } from './config/paths.mts';
import { executor } from './utils/executor.mts';
import { pathExist } from './utils/file-system.utils.mts';
import * as log from './utils/log.mts';

executor('Build librairies', async () => {
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
});
