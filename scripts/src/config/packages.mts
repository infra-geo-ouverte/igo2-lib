import { $ } from 'execa';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { BehaviorSubject, combineLatest, first, firstValueFrom } from 'rxjs';

import { writeFile2 } from '../utils/file-system.utils.mts';
import * as log from '../utils/log.mts';
import { PATHS, getPackageJson } from './paths.mts';
import { RELEASE_TAGS } from './release.interface.mts';

export type PackageName =
  | 'auth'
  | 'common'
  | 'context'
  | 'core'
  | 'geo'
  | 'integration'
  | 'utils';

export interface PackageOptions {
  dependsOn: PackageName[];
  observer: BehaviorSubject<boolean>;
}

export const PACKAGES_RELATIONS: Map<PackageName, PackageOptions> =
  getPackagesRelations();

function getPackagesRelations(): Map<PackageName, PackageOptions> {
  const folders = readdirSync(PATHS.packages) as PackageName[];
  const packageRelations = new Map<PackageName, PackageOptions>();
  for (const folder of folders) {
    if (!folder) {
      continue;
    }
    const file = getPackageJson('packages', folder);
    const igoDependencies = Object.keys({
      ...file.peerDependencies,
      ...file.dependencies
    })
      .filter((key) => key.includes('@igo2') && !key.includes('@igo2/sdg'))
      .map((key) => key.split('/')[1]) as PackageName[];
    packageRelations.set(folder, {
      dependsOn: igoDependencies,
      observer: new BehaviorSubject(false)
    });
  }
  return packageRelations;
}

export async function waitOnPackageRelations(
  relations: PackageName[]
): Promise<boolean> {
  const observers = relations.map((relation) =>
    PACKAGES_RELATIONS.get(relation)!.observer.pipe(
      first((value) => value === true)
    )
  );

  if (observers.length) {
    await firstValueFrom(combineLatest(observers));
  }

  return true;
}

export function cleanPackageExports(name: string): Promise<void> {
  const packageJSON = getPackageJson('dist', name);
  const exports = packageJSON.exports;
  Object.keys(exports).forEach((key) => {
    const config = exports[key];

    if (config && typeof config === 'object' && config?.['import']) {
      delete config.import;
      exports[key] = config;
    }
  });
  return writeFile2(resolve(PATHS.dist, name, 'package.json'), packageJSON);
}

export async function publishPackage(
  name: PackageName,
  version: string
): Promise<void> {
  const tag = RELEASE_TAGS.find((tag) => version.includes(tag));

  let command = `npm publish --provenance --access public`;

  if (tag) {
    command += ` --tag ${tag}`;
  }
  log.info(command);

  // shell true is mandotary to publish on Github Actions
  await $({ stdio: 'inherit', shell: true, cwd: `dist/${name}` })`${command}`;
}
