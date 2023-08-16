import {
  APP_INITIALIZER,
  ConstructorProvider,
  ErrorHandler,
  FactoryProvider
} from '@angular/core';
import { TraceService } from '@sentry/angular-ivy';
import { Router } from '@angular/router';
import { SentryMonitoringOptions } from './sentry.interface';
import { createSentryErrorHandler, initSentry } from './sentry';
import { isTracingEnabled } from './sentry.utils';

export const provideSentryMonitoring = (
  options: SentryMonitoringOptions,
  isProd: boolean
): (FactoryProvider | ConstructorProvider)[] => {
  const isEnabled = options.enabled !== undefined ? options.enabled : true;
  if (!isEnabled) {
    return [];
  }

  initSentry(options, isProd);

  const tracingEnabled = isTracingEnabled(options);

  return [
    {
      provide: ErrorHandler,
      useFactory: () => createSentryErrorHandler(options, isProd)
    },
    tracingEnabled && {
      provide: TraceService,
      deps: [Router]
    },
    // Force instantiate TraceService to avoid require it in any constructor.
    tracingEnabled && {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [TraceService],
      multi: true
    }
  ].filter(Boolean);
};
