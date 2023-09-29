import { LanguageOptions } from '../language';

export interface BaseEnvironmentOptions {
  production: boolean;
}

export interface CoreOptions {
  language?: LanguageOptions;
  version?: string;
}
