export interface ConfigOptions {
  default?: { [key: string]: any };
  path?: string;
}

export interface DeprecatedOptions {
  alternativeKey?: string;
  mayBeRemoveIn: Date;
}

export interface AlternateConfigOptions {
  deprecatedKey: string;
}
