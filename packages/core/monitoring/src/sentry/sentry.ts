import {
  SentryErrorHandler,
  createErrorHandler,
  getClient,
  init
} from '@sentry/angular';

import { SentryMonitoringOptions } from './sentry.interface';

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
  if (!force && client) {
    return;
  }

  init(options);
};
