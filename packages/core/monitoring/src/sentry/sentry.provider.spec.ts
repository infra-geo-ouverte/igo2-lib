import {
  ConstructorProvider,
  ErrorHandler,
  InjectionToken
} from '@angular/core';
import { Router } from '@angular/router';

import { TraceService } from '@sentry/angular';

import { MOCK_SENTRY_OPTIONS } from '../__mocks__/monitoring-mock';
import { SentryMonitoringOptions } from './sentry.interface';
import { provideSentryMonitoring } from './sentry.provider';

describe('Provide Sentry monitoring', () => {
  let options: SentryMonitoringOptions;

  beforeEach(() => {
    options = { ...MOCK_SENTRY_OPTIONS };
  });

  it('should return an empty array if options.enabled is false', () => {
    options.enabled = false;
    const providers = provideSentryMonitoring(options);
    expect(providers).toEqual([]);
  });

  it('should return an array of providers if options.enabled is true', () => {
    const providers = provideSentryMonitoring(options);
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should provide ErrorHandler with createSentryErrorHandler factory', () => {
    const providers = provideSentryMonitoring(options);

    expect(providers).toEqual(
      jasmine.arrayWithExactContents([
        jasmine.objectContaining({ provide: ErrorHandler })
      ])
    );
  });

  it('should provide TraceService if tracing is enabled', () => {
    options.tracesSampleRate = 1;
    const providers = provideSentryMonitoring(options);
    const traceServiceProvider: ConstructorProvider = providers.find(
      (p: ConstructorProvider) => p.provide === TraceService
    ) as ConstructorProvider;
    expect(traceServiceProvider).toBeDefined();
    expect(traceServiceProvider.deps).toContain(Router);
  });

  it('should provide TraceService if tracing is enabled', () => {
    options.tracesSampleRate = 1;

    const providers = provideSentryMonitoring(options);
    expect(providers.length).toBe(3);
    expect(providers).toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({ provide: TraceService }),
        jasmine.objectContaining({
          ɵproviders: jasmine.arrayContaining([
            jasmine.objectContaining({
              provide: jasmine.any(InjectionToken),
              multi: true,
              useValue: jasmine.any(Function)
            })
          ])
        })
      ])
    );
  });

  it('should not provide TraceService if tracing is not enabled', () => {
    options.tracesSampleRate = undefined;
    options.tracesSampler = undefined;

    const providers = provideSentryMonitoring(options);
    expect(providers.length).toBe(1);
    expect(providers).toEqual(
      jasmine.arrayWithExactContents([
        jasmine.objectContaining({ provide: ErrorHandler })
      ])
    );
  });
});
