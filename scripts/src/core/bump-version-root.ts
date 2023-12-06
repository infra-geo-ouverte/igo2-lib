import { readFileSync, readdirSync } from 'fs';
import { PATHS, getPackageJson, resolvePackage } from '../config/paths';
import { BUFFER_ENCODING, writeFile2 } from '../utils/file-system.utils';

(async () => {
  const rootPackageJson = getPackageJson('root');
  const version = rootPackageJson.version;

  const folders = readdirSync(PATHS.packages);
  for (const folder of folders) {
    await bumpPackageVersion(folder, version);
  }
  await editVersionFile(version);
})();

async function bumpPackageVersion(folder: string, version: string) {
  const packageJSON = getPackageJson('packages', folder);
  packageJSON.version = version;
  await writeFile2(resolvePackage(folder, 'package.json'), packageJSON);
}

async function editVersionFile(version: string) {
  const versionFilePath = resolvePackage('core', 'src/lib/config/version.ts');
  let body = readFileSync(versionFilePath, BUFFER_ENCODING);
  body = body.replace(/lib: '[A-Za-z0-9\.\-]+'/g, `lib: '${version}'`);
  body = body.replace(/releaseDate: [0-9]+/g, `releaseDate: ${Date.now()}`);
  await writeFile2(versionFilePath, body, false);
}
