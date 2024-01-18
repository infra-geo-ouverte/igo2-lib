import { BrowserOptions, ErrorHandlerOptions } from '@sentry/angular-ivy';

import { MonitoringOptions } from '../shared/monitoring.interface';

export type SentryMonitoringOptions = BrowserOptions &
  MonitoringOptions & {
    provider: 'sentry';
    errorHandlerOptions?: ErrorHandlerOptions;
    enableReplay?: boolean;
  };
