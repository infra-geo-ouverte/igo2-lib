import { BrowserOptions, ErrorHandlerOptions } from '@sentry/angular';
import { Integration } from '@sentry/core';

import { MonitoringOptions } from '../shared/monitoring.interface';

export type SentryMonitoringOptions = Omit<BrowserOptions, 'integrations'> &
  MonitoringOptions & {
    provider: 'sentry';
    errorHandlerOptions?: ErrorHandlerOptions;
    integrations?: Integration[];
  };
