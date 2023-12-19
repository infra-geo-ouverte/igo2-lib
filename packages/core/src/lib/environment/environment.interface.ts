import { AnalyticsOptions } from '../analytics';
import { Version } from '../config';
import { LanguageOptions } from '../language';
import { MessageOptions } from '../message';
import { AnyMonitoringOptions } from '../monitoring';
import { RegexOptions } from '../regex';

export interface BaseEnvironmentOptions {
  production: boolean;
}

export interface EnvironmentOptions {
  analytics?: AnalyticsOptions;
  emailAddress?: string;
  language?: LanguageOptions;
  message?: MessageOptions;
  monitoring?: AnyMonitoringOptions;
  regex?: RegexOptions;
  version?: Version;
}
