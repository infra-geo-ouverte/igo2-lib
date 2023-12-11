import { readdirSync } from 'fs';

import { PackageName } from '../config/packages';
import { PATHS } from '../config/paths';
import {
  setDistributionVersion,
  setPackageVersion,
  setVersionFile
} from '../core/utils/version.utils';
import * as log from '../utils/log';
import { getDuration } from '../utils/performance.utils';
import { ALL_DIST_TAG } from './release.interface';

const baseCmdName = 'Library publishing';

const startTime = performance.now();
log.startMsg(baseCmdName);
(async () => {
  try {
    const { $ } = await import('execa');
    const [_nodePath, _scriptPath, argVersion, type] = process.argv;
    const version = argVersion ?? process.env.npm_new_version;
    const folders = readdirSync(PATHS.packages);

    // Edit packages version and the Core version.ts file
    log.info('Propagate the version to sub-packages and the version.ts file');
    await setVersionFile(version);
    for (const folder of folders) {
      await setPackageVersion(folder, version);
    }

    log.info('Build the lib');
    await $({ stdio: 'inherit' })`npm run build.libs`;

    for (const folder of folders) {
      await setDistributionVersion(folder, version);
      await publishPackage(folder as PackageName, version);
    }

    log.success(`Published ${type} release version ${version}`);

    const duration = getDuration(startTime);
    log.info(`${baseCmdName} excuted in ${duration}.`);
  } catch (err: any) {
    log.error(`The release failed with: ${err?.message}`);
    process.exit(1);
  }
})();

async function publishPackage(
  name: PackageName,
  version: string
): Promise<void> {
  try {
    const { $ } = await import('execa');
    const dist = ALL_DIST_TAG.find((tag) => version.includes(tag));
    const tagArg = dist ? `--tag ${dist}` : '';

    await $({
      stdio: 'inherit'
    })`npm publish ./dist/${name} ${tagArg}`;

    log.success(`Published @igo2/${name} version ${version}`);
  } catch (err: any) {
    log.error(err.message);
    process.exit(1);
  }
}
