import { ConstructorProvider, ErrorHandler, FactoryProvider, inject, provideAppInitializer } from '@angular/core';
import { Router } from '@angular/router';

import { TraceService } from '@sentry/angular';

import { createSentryErrorHandler, initSentry } from './sentry';
import { SentryMonitoringOptions } from './sentry.interface';
import { isTracingEnabled } from './sentry.utils';

export const provideSentryMonitoring = (
  options: SentryMonitoringOptions
): (FactoryProvider | ConstructorProvider)[] => {
  const isEnabled = options.enabled !== undefined ? options.enabled : true;
  if (!isEnabled) {
    return [];
  }

  initSentry(options);

  const tracingEnabled = isTracingEnabled(options);

  return [
    {
      provide: ErrorHandler,
      useFactory: () => createSentryErrorHandler(options)
    },
    tracingEnabled && {
      provide: TraceService,
      deps: [Router]
    },
    // Force instantiate TraceService to avoid require it in any constructor.
    tracingEnabled && provideAppInitializer(() => {
        const initializerFn = (() => () => void 1)(inject(TraceService));
        return initializerFn();
      })
  ].filter(Boolean);
};
