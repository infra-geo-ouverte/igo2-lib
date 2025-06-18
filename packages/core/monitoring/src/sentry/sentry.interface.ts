import { BrowserOptions, ErrorHandlerOptions } from '@sentry/angular';
import { Integration } from '@sentry/core';

import { MonitoringOptions } from '../shared/monitoring.interface';

export type SentryMonitoringOptions = BrowserOptions &
  MonitoringOptions & {
    provider: 'sentry';
    errorHandlerOptions?: ErrorHandlerOptions;
    integrations?: Integration[];
  };
