import { AnalyticsOptions } from '@igo2/core/analytics';
import { Version } from '@igo2/core/config';
import { LanguageOptions } from '@igo2/core/language';
import { MessageOptions } from '@igo2/core/message';
import { AnyMonitoringOptions } from '@igo2/core/monitoring';

export interface BaseEnvironmentOptions {
  production: boolean;
}

export interface EnvironmentOptions {
  analytics?: AnalyticsOptions;
  emailAddress?: string;
  language?: LanguageOptions;
  message?: MessageOptions;
  monitoring?: AnyMonitoringOptions;
  version?: Version;
}
