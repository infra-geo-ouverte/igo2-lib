import { InjectionToken, Provider } from '@angular/core';

import { provideSentryMonitoring } from './sentry/sentry.provider';
import { AnyMonitoringOptions, MonitoringOptions } from './shared';

export const MONITORING_OPTIONS = new InjectionToken<MonitoringOptions | null>(
  'monitoring.options'
);

export function provideMonitoring(
  options: AnyMonitoringOptions | null
): Provider[] {
  if (!options) {
    return [];
  }

  const providers: Provider[] = [
    { provide: MONITORING_OPTIONS, useValue: options }
  ];

  switch (options.provider) {
    case 'sentry':
      providers.push(...provideSentryMonitoring(options));
      break;
    default:
      break;
  }

  return providers;
}
