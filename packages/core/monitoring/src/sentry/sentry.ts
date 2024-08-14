import {
  BrowserOptions,
  SentryErrorHandler,
  browserTracingIntegration,
  createErrorHandler,
  getClient,
  init,
  replayIntegration
} from '@sentry/angular';

import { SentryMonitoringOptions } from './sentry.interface';
import { isReplayEnabled, isTracingEnabled } from './sentry.utils';

export const createSentryErrorHandler = (
  options: SentryMonitoringOptions
): SentryErrorHandler => {
  return createErrorHandler({
    logErrors: options.logErrors,
    ...(options.errorHandlerOptions ?? {})
  });
};

export const initSentry = (
  options: SentryMonitoringOptions,
  force?: boolean
): void => {
  const client = getClient();
  console.log('init sentry: ', client);
  if (!force && client) {
    return;
  }

  const baseConfig: BrowserOptions = {
    ...options,
    integrations: [
      isTracingEnabled(options) && browserTracingIntegration(),
      isReplayEnabled(options) && replayIntegration()
    ].filter(Boolean)
  };

  init(baseConfig);
};
