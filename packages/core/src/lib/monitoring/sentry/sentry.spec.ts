import { BrowserTracing, Replay, getCurrentHub } from '@sentry/angular-ivy';
import { createSentryErrorHandler, initSentry } from './sentry';
import { SentryMonitoringOptions } from './sentry.interface';
import { MOCK_SENTRY_OPTIONS } from '../__mocks__/monitoring-mock';

describe('Sentry', () => {
  let options: SentryMonitoringOptions;

  beforeEach(() => {
    options = { ...MOCK_SENTRY_OPTIONS };
  });

  describe('createSentryErrorHandler', () => {
    it('should create a SentryErrorHandler with default options', () => {
      const isProd = true;
      const errorHandler = createSentryErrorHandler(options, isProd);
      expect(errorHandler).toBeDefined();
    });
  });

  describe('initSentry', () => {
    it('should initialize Sentry with default options', () => {
      const isProd = true;
      initSentry(options, isProd);
      const client = getCurrentHub().getClient();
      expect(client).toBeDefined();
    });

    it('should initialize Sentry integration with tracing and replay enabled', () => {
      options = { ...options, enableTracing: true, enableReplay: true };
      const isProd = true;
      initSentry(options, isProd);
      const client = getCurrentHub().getClient();
      const replay = client.getIntegration(Replay);
      const tracing = client.getIntegration(BrowserTracing as any);
      expect(replay).toBeDefined();
      expect(tracing).toBeDefined();
    });
  });
});
