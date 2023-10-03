import { AnalyticsOptions } from '../analytics';
import { LanguageOptions } from '../language';
import { MessageOptions } from '../message';
import { RegexOptions } from '../regex';

export interface BaseEnvironmentOptions {
  production: boolean;
}

export interface CoreOptions {
  analytics?: AnalyticsOptions;
  emailAddress?: string;
  language?: LanguageOptions;
  message?: MessageOptions;
  regex?: RegexOptions;
  version?: string;
}
