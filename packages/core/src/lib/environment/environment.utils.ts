import { InjectionToken } from '@angular/core';
import { EnvironmentOptions } from './environment.interface';

export const APP_ENVIRONMENT = new InjectionToken<EnvironmentOptions>(
  'Environment'
);
