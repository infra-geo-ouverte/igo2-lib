import { BehaviorSubject, combineLatest, first, firstValueFrom } from 'rxjs';
import { PATHS, getPackageJson } from './paths';
import { readdirSync } from 'fs';

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
    const igoDependencies = Object.keys({...file.peerDependencies, ...file.dependencies})
      .filter((key) => key.includes('@igo2'))
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
