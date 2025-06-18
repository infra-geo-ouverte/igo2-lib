import { InjectionToken } from '@angular/core';

import { MonitoringOptions } from './monitoring.interface';

export const MONITORING_OPTIONS = new InjectionToken<MonitoringOptions | null>(
  'monitoring.options'
);
