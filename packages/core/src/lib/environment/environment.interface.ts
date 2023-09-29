import { LanguageOptions } from '../language';

export interface BaseEnvironmentOptions {
  production: boolean;
  igo: CoreOptions;
}

export interface CoreOptions {
  language?: LanguageOptions;
}
