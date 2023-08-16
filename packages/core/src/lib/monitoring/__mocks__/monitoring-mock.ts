import { SentryMonitoringOptions } from '../sentry';
import { AnyMonitoringOptions } from '../shared';

export const MOCK_SENTRY_OPTIONS: SentryMonitoringOptions = {
  provider: 'sentry',
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  identifyUser: true
};

export const MOCK_MONITORING_OPTIONS: AnyMonitoringOptions =
  MOCK_SENTRY_OPTIONS;
