export interface ConfigOptions<T = Record<string, any>> {
  /** This is a representation of EnvironmentOptions */
  default?: T;
  path?: string;
}

export interface DeprecatedOptions {
  alternativeKey?: string;
  mayBeRemoveIn: Date;
}

export interface AlternateConfigOptions {
  deprecatedKey: string;
}
