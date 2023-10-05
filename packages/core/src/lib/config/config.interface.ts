import { EnvironmentOptions } from '../environment';

export type BaseConfigOptions<T> = EnvironmentOptions & T;

export interface ConfigOptions<T = { [key: string]: any }> {
  default?: BaseConfigOptions<T>;
  path?: string;
}

export interface DeprecatedOptions {
  alternativeKey?: string;
  mayBeRemoveIn: Date;
}

export interface AlternateConfigOptions {
  deprecatedKey: string;
}
