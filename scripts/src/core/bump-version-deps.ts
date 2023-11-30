import { readdirSync } from 'fs';
import { resolve } from 'path';

import { PATHS, getPackageJson } from '../config/paths';
import { writeFile2 } from '../utils/file-system.utils';

(async () => {
  const rootPackageJson = getPackageJson('root');
  const version = rootPackageJson.version;

  const folders = readdirSync(PATHS.packages);
  for (const folder of folders) {
    const packageJSON = getPackageJson('dist', folder);
    Object.keys(packageJSON.peerDependencies).forEach((key) => {
      if (key.includes('@igo2')) {
        packageJSON.peerDependencies[key] = `^${version}`;
      }
    });
    await writeFile2(resolve(PATHS.dist, folder, 'package.json'), packageJSON);
  }
})();
