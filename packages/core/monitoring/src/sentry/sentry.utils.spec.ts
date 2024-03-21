import { MOCK_SENTRY_OPTIONS } from '../__mocks__/monitoring-mock';
import { SentryMonitoringOptions } from './sentry.interface';
import { isTracingEnabled } from './sentry.utils';

const getOptions = (
  options?: Partial<SentryMonitoringOptions>
): SentryMonitoringOptions => ({
  ...MOCK_SENTRY_OPTIONS,
  ...options
});

describe('isTracingEnabled', () => {
  it('should return true if enableTracing is true', () => {
    const options: SentryMonitoringOptions = getOptions({
      enableTracing: true
    });
    expect(isTracingEnabled(options)).toBe(true);
  });

  it('should return true if tracesSampleRate is set', () => {
    const options: SentryMonitoringOptions = getOptions({
      tracesSampleRate: 0.5
    });
    expect(isTracingEnabled(options)).toBe(true);
  });

  it('should return true if tracesSampler is set', () => {
    const options: SentryMonitoringOptions = getOptions({
      tracesSampler: () => true
    });
    expect(isTracingEnabled(options)).toBe(true);
  });

  it('should return false if no tracing options are set', () => {
    const options: SentryMonitoringOptions = getOptions();
    expect(isTracingEnabled(options)).toBe(false);
  });
});
