import { resolve } from 'path';
import { fileURLToPath } from 'url';

import { readFileContentSync } from '../utils/file-system.utils.mts';

export interface IPackageJson {
  name: string;
  version: string;
  exports: { [key: string]: string | { [key: string]: string } };
  dependencies: { [key: string]: string };
  peerDependencies: { [key: string]: string };
}

type FolderCaterogy = 'packages' | 'projects' | 'dist' | 'root';

type IPaths = Record<FolderCaterogy, string> & { [index: string]: string };

const ROOT_LEVEL = '../../../../';
const ROOT = resolve(fileURLToPath(import.meta.url), ROOT_LEVEL);

const resolveRoot = (relativePath: string): string => {
  return resolve(ROOT, relativePath);
};

export const PATHS: IPaths = {
  dist: resolveRoot('dist'),
  nodeModules: resolveRoot('node_modules'),
  packages: resolveRoot('packages'),
  projects: resolveRoot('projects'),
  root: ROOT
};

export const resolvePackage = (name: string, ...paths: string[]): string => {
  return resolve(PATHS.packages, name, ...paths);
};

export function getPackageJson(type: 'root'): IPackageJson;
export function getPackageJson(
  type: 'packages' | 'projects' | 'dist',
  name: string
): IPackageJson;
export function getPackageJson(
  type: FolderCaterogy,
  name?: string
): IPackageJson {
  const basePath = type === 'root' ? ROOT : resolve(PATHS[type], name!);
  const path = resolve(basePath, 'package.json');
  return readFileContentSync(path);
}

export const resolveDist = (name: string): string => {
  return resolve(PATHS.dist, name);
};
