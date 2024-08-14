import { getClient } from '@sentry/angular';

import { MOCK_SENTRY_OPTIONS } from '../__mocks__/monitoring-mock';
import { createSentryErrorHandler, initSentry } from './sentry';
import { SentryMonitoringOptions } from './sentry.interface';

describe('Sentry', () => {
  let options: SentryMonitoringOptions;

  beforeEach(() => {
    options = { ...MOCK_SENTRY_OPTIONS };
  });

  describe('createSentryErrorHandler', () => {
    it('should create a SentryErrorHandler with default options', () => {
      const errorHandler = createSentryErrorHandler(options);
      expect(errorHandler).toBeDefined();
    });
  });

  describe('initSentry', () => {
    it('should initialize Sentry with default options', () => {
      initSentry(options, true);
      const client = getClient();
      expect(client).toBeDefined();
    });

    it('should initialize Sentry integration with BrowserTracing and Replay enabled', () => {
      options = {
        ...options,
        tracesSampleRate: 1,
        replaysSessionSampleRate: 1
      };
      initSentry(options, true);
      const client = getClient();
      const replay = client.getIntegrationByName('Replay');
      const tracing = client.getIntegrationByName('BrowserTracing');
      expect(replay).toBeDefined();
      expect(tracing).toBeDefined();
    });
  });
});
