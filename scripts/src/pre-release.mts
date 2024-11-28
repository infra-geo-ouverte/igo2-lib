import { $ } from 'execa';
import { readdirSync } from 'node:fs';

import { PackageName, publishPackage } from './config/packages.mts';
import { PATHS, getPackageJson, resolvePackage } from './config/paths.mts';
import {
  setDistributionVersion,
  setVersionFile
} from './core/utils/version.utils.mts';
import { executor } from './utils/executor.mts';
import { writeFile2 } from './utils/file-system.utils.mts';
import * as log from './utils/log.mts';

executor('Library Prepublish', async () => {
  const [_nodePath, _scriptPath, argVersion] = process.argv;
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

  log.info(`Setting @igo2/xxx distribution versions to ${version}`);
  for (const folder of folders) {
    await setDistributionVersion(folder, version);
  }

  log.info('Version update complete');
});

async function setPackageVersion(name: string, version: string): Promise<void> {
  const packageJSON = getPackageJson('packages', name);
  packageJSON.version = version;
  await writeFile2(resolvePackage(name, 'package.json'), packageJSON);
  log.success(`Write version ${version} to packages/${name}/package.json`);
}
