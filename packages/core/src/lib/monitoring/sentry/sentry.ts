import {
  init,
  createErrorHandler,
  SentryErrorHandler,
  getCurrentHub,
  BrowserTracing,
  instrumentAngularRouting,
  Replay,
  BrowserOptions
} from '@sentry/angular-ivy';
import { SentryMonitoringOptions } from './sentry.interface';
import { isTracingEnabled } from './sentry.utils';

export const createSentryErrorHandler = (
  options: SentryMonitoringOptions,
  isProd: boolean
): SentryErrorHandler => {
  return createErrorHandler({
    logErrors: !isProd,
    ...(options.errorHandlerOptions ?? {})
  });
};

export const initSentry = (
  options: SentryMonitoringOptions,
  isProd: boolean
): void => {
  const client = getCurrentHub().getClient();
  if (client) {
    return;
  }

  const tracingEnabled = isTracingEnabled(options);
  const baseConfig: BrowserOptions = {
    dsn: options.dsn,
    environment: isProd ? 'production' : 'development',
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
