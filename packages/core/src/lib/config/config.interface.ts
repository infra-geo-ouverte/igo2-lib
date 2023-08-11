import { CoreOptions } from '../environment';

export interface ConfigOptions<T = {[key: string]: any}> {
  default?: BaseConfigOptions<T>;
  path?: string;
}

export type BaseConfigOptions<T> = CoreOptions & T;
