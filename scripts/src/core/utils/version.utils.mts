import { readFileSync } from 'fs';
import { resolve } from 'path';

import { PATHS, getPackageJson, resolvePackage } from '../../config/paths.mts';
import { BUFFER_ENCODING, writeFile2 } from '../../utils/file-system.utils.mts';
import * as log from '../../utils/log.mts';

/**
 * Permet de changer la version du package et remplacer les dépendendances génériques de "@igo2/*"
 */
export async function setDistributionVersion(
  folder: string,
  version: string
): Promise<void> {
  const packageJSON = getPackageJson('dist', folder);
  packageJSON.version = version;

  Object.keys(packageJSON.peerDependencies).forEach((key) => {
    if (key.includes('@igo2')) {
      packageJSON.peerDependencies[key] = `^${version}`;
    }
  });

  await writeFile2(resolve(PATHS.dist, folder, 'package.json'), packageJSON);
  log.success(`Write version ${version} to dist/${folder}/package.json`);
}

export async function setPackageVersion(
  folder: string,
  version: string
): Promise<void> {
  const packageJSON = getPackageJson('packages', folder);
  packageJSON.version = version;
  await writeFile2(resolvePackage(folder, 'package.json'), packageJSON);
  log.success(`Write version ${version} to packages/${folder}/package.json`);
}

export async function setVersionFile(version: string) {
  const versionFilePath = resolvePackage('core', 'config/src/version.ts');
  let body = readFileSync(versionFilePath, BUFFER_ENCODING);
  body = body.replace(/lib: '[A-Za-z0-9\.\-]+'/g, `lib: '${version}'`);
  body = body.replace(/releaseDate: [0-9]+/g, `releaseDate: ${Date.now()}`);
  await writeFile2(versionFilePath, body, false);
  log.success(`Write version ${version} to version.ts`);
}
