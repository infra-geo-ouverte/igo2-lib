import {
  EnvironmentProviders,
  ErrorHandler,
  Provider,
  inject,
  provideAppInitializer
} from '@angular/core';
import { Router } from '@angular/router';

import { TraceService, browserTracingIntegration } from '@sentry/angular';

import { MONITORING_OPTIONS } from '../shared';
import { createSentryErrorHandler, initSentry } from './sentry';
import { SentryMonitoringOptions } from './sentry.interface';

export const provideSentryMonitoring = (
  options: SentryMonitoringOptions,
  integrations?: SentryIntegrationFactory<SentryIntegrationKind>[]
): (Provider | EnvironmentProviders)[] => {
  const isEnabled = options.enabled !== undefined ? options.enabled : true;
  if (!isEnabled) {
    return [];
  }

  const providers: (Provider | EnvironmentProviders)[] = [
    { provide: MONITORING_OPTIONS, useValue: options },
    {
      provide: ErrorHandler,
      useFactory: () => createSentryErrorHandler(options)
    }
  ];

  if (integrations) {
    for (const integration of integrations) {
      const value = integration(options);
      providers.push(...value.providers);
    }
  }

  initSentry(options);

  return providers;
};

export interface SentryIntegration<KindT extends SentryIntegrationKind> {
  kind: KindT;
  providers: (Provider | EnvironmentProviders)[];
}

type SentryIntegrationFactory<KindT extends SentryIntegrationKind> = (
  sentryOptions: SentryMonitoringOptions
) => SentryIntegration<KindT>;

export enum SentryIntegrationKind {
  Tracing = 0,
  Replay = 1
}

export function withTracingIntegration(
  options: Parameters<typeof browserTracingIntegration>[0]
): SentryIntegrationFactory<SentryIntegrationKind.Tracing> {
  return (sentryOptions: SentryMonitoringOptions) => {
    sentryOptions.integrations = [
      ...(sentryOptions.integrations ?? []),
      browserTracingIntegration(options)
    ];

    return {
      kind: SentryIntegrationKind.Tracing,
      providers: [
        {
          provide: TraceService,
          deps: [Router]
        },
        // Force instantiate TraceService to avoid require it in any constructor.
        provideAppInitializer(() => {
          inject(TraceService);
          return;
        })
      ]
    };
  };
}
