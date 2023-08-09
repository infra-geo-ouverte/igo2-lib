import { Provider, InjectionToken } from '@angular/core';
import { EnvironmentOptions } from '../environment';
import { provideSentryMonitoring } from './sentry/sentry.provider';
import { MonitoringOptions } from './shared';

export const MONITORING_OPTIONS = new InjectionToken<MonitoringOptions | null>(
  'monitoring.options'
);

export function provideMonitoring(environment: EnvironmentOptions): Provider[] {
  const options = environment.igo?.monitoring;
  if (!options) {
    return null;
  }

  const providers: Provider[] = [
    { provide: MONITORING_OPTIONS, useValue: options }
  ];

  switch (options.provider) {
    case 'sentry':
      providers.push(
        ...provideSentryMonitoring(options, environment.production)
      );
      break;
    default:
      break;
  }

  return providers;
}
