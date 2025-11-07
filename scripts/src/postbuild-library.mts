import { cleanPackageExports } from './config/packages.mts';
import { executor } from './utils/executor.mts';
import * as log from './utils/log.mts';

executor('Postbuild library', async () => {
  const [_nodePath, _scriptPath, name] = process.argv;

  await cleanPackageExports(name);
  log.success(`✔ Cleaning package.json exports`);
});
