import { resolve } from 'path';
import { readFileContentSync } from '../utils/file-system.utils';

const ROOT_LEVEL = '../../../';

interface IPackageJson {
  name: string;
  version: string;
  dependencies: { [key: string]: string };
  peerDependencies: { [key: string]: string };
}

const resolveRoot = (relativePath: string): string => {
  return resolve(__dirname, ROOT_LEVEL, relativePath);
};

export const PATHS: { [index: string]: string } = {
  dist: resolveRoot('dist'),
  packages: resolveRoot('packages'),
  nodeModules: resolveRoot('node_modules')
};

export const resolvePackage = (name: string): string => {
  return resolve(PATHS.packages, name);
};

export const getPackageJson = (name: string): IPackageJson => {
  const path = resolve(resolvePackage(name), 'package.json');
  return readFileContentSync(path);
};

export const resolveDist = (name: string): string => {
  return resolve(PATHS.dist, name);
};
