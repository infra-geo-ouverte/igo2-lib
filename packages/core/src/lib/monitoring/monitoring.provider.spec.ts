import { provideMonitoring, MONITORING_OPTIONS } from './monitoring.provider';
import { BaseEnvironmentOptions } from '../environment';
import { MonitoringOptions } from './shared';
import { MOCK_MONITORING_OPTIONS } from './__mocks__/monitoring-mock';

describe('Provide Monitoring', () => {
  let environment: BaseEnvironmentOptions;
  let options: MonitoringOptions;

  beforeEach(() => {
    environment = {
      production: true,
      igo: {
        monitoring: { ...MOCK_MONITORING_OPTIONS }
      }
    };
    options = environment.igo.monitoring;
  });

  it('should return null if monitoring options are not defined', () => {
    environment.igo.monitoring = null;
    const providers = provideMonitoring(environment);
    expect(providers).toBeNull();
  });

  it('should provide monitoring base options', () => {
    const providers = provideMonitoring(environment);
    expect(providers).toContain({
      provide: MONITORING_OPTIONS,
      useValue: options
    });
  });

  it('should provide Sentry monitoring if provider is "sentry"', () => {
    const providers = provideMonitoring(environment);
    expect(providers.length).toBeGreaterThan(1);
  });
});
