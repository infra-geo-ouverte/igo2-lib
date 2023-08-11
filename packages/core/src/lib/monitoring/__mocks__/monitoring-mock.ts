import { AnyMonitoringOptions } from '../shared';

export const MOCK_MONITORING_OPTIONS: AnyMonitoringOptions = {
  provider: 'sentry',
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  identifyUser: true
};
