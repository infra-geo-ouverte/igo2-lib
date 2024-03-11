import {
  BrowserOptions,
  BrowserTracing,
  Replay,
  SentryErrorHandler,
  createErrorHandler,
  getCurrentHub,
  init,
  instrumentAngularRouting
} from '@sentry/angular-ivy';

import { SentryMonitoringOptions } from './sentry.interface';
import { isTracingEnabled } from './sentry.utils';

export const createSentryErrorHandler = (
  options: SentryMonitoringOptions
): SentryErrorHandler => {
  return createErrorHandler({
    logErrors: options.logErrors,
    ...(options.errorHandlerOptions ?? {})
  });
};

export const initSentry = (options: SentryMonitoringOptions): void => {
  const client = getCurrentHub().getClient();
  if (client) {
    return;
  }

  const tracingEnabled = isTracingEnabled(options);
  const baseConfig: BrowserOptions = {
    dsn: options.dsn,
    environment: options.environment,
    release: options.release,
    integrations: [
      tracingEnabled &&
        new BrowserTracing({
          routingInstrumentation: instrumentAngularRouting
        }),
      options.enableReplay && new Replay()
    ].filter(Boolean)
  };

  init(baseConfig);
};
