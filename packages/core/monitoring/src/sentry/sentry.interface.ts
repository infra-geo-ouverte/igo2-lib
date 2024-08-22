import { BrowserOptions, ErrorHandlerOptions } from '@sentry/angular';

import { MonitoringOptions } from '../shared/monitoring.interface';

export type SentryMonitoringOptions = BrowserOptions &
  MonitoringOptions & {
    provider: 'sentry';
    errorHandlerOptions?: ErrorHandlerOptions;
  };
