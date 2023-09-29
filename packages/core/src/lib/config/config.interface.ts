import { IgoOptions } from '../environment/environment.interface';

export interface ConfigOptions {
  default?: IgoOptions;
  path?: string;
}

export interface DeprecatedOptions {
  alternativeKey?: string;
  mayBeRemoveIn: Date;
}

export interface AlternateConfigOptions {
  deprecatedKey: string;
}
