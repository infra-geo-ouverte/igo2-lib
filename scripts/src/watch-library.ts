import { pathExist } from './utils/file-system.utils';
import { PATHS } from './config/paths';
import { rm } from 'fs/promises';
import { PACKAGES_RELATIONS, waitOnPackageRelations } from './config/packages';
import * as log from './utils/log';
import { getDuration } from './utils/performance.utils';
import { execWorkspaceCmd } from './utils/exec.utils';

const baseCmdName = 'Watching all library';

(async () => {
  const startTime = performance.now();
  log.startMsg(baseCmdName);

  if (pathExist(PATHS.dist)) {
    await rm(PATHS.dist, { recursive: true });
  }

  const promises = Array.from(PACKAGES_RELATIONS).map(
    async ([name, { dependsOn, observer }]) => {
      if (dependsOn) {
        await waitOnPackageRelations(dependsOn);
      }

      await execWorkspaceCmd(name, 'Compilation complete', ['run', `watch`]);

      observer.next(true);
    }
  );

  await Promise.all(promises);

  const duration = getDuration(startTime);
  log.info(`${baseCmdName} excuted in ${duration}`);
})();