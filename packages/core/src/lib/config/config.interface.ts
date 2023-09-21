export interface ConfigOptions {
  default?: { [key: string]: any };
  path?: string;
}
export interface DeprecatedConfig {
  key: string;
  deprecationDate?: Date;
  alternativeKey?: string;
}
