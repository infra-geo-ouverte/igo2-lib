import { readdirSync } from 'node:fs';

import { PackageName, publishPackage } from './config/packages.mts';
import { PATHS } from './config/paths.mts';
import { executor } from './utils/executor.mts';
import * as log from './utils/log.mts';

executor('Publishing libraries', async () => {
  const [_nodePath, _scriptPath, argVersion] = process.argv;
  const version = argVersion ?? process.env.npm_new_version;

  const folders = readdirSync(PATHS.packages);
  for (const name of folders) {
    log.info(`Start publishing @igo2/${name}@${version}`);
    await publishPackage(name as PackageName, version);
    log.success(`@igo2/${name}@${version} was published successfully`);
  }
});
