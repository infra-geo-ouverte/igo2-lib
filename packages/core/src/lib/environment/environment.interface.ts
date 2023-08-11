import { LanguageOptions } from "../language";
import { AnyMonitoringOptions } from "../monitoring";

export interface BaseEnvironmentOptions {
  production: boolean;
  igo: CoreOptions;
}

export interface CoreOptions {
  monitoring?: AnyMonitoringOptions;
  language?: LanguageOptions;
}
