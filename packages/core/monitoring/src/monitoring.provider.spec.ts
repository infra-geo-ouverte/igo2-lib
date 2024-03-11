import { BaseEnvironmentOptions } from '../../environment/src/public_api';
import { MOCK_MONITORING_OPTIONS } from './__mocks__/monitoring-mock';
import { MONITORING_OPTIONS, provideMonitoring } from './monitoring.provider';
import { MonitoringOptions } from './shared';

describe('Provide Monitoring', () => {
  let environment: BaseEnvironmentOptions;
  let options: MonitoringOptions;

  beforeEach(() => {
    environment = {
      production: true
    };
    options = { ...MOCK_MONITORING_OPTIONS };
  });

  it('should return null if monitoring options are not defined', () => {
    options = null;
    const providers = provideMonitoring(options);
    expect(providers.length).toEqual(0);
  });

  it('should provide monitoring base options', () => {
    const providers = provideMonitoring(options);
    expect(providers).toContain({
      provide: MONITORING_OPTIONS,
      useValue: options
    });
  });

  it('should provide Sentry monitoring if provider is "sentry"', () => {
    const providers = provideMonitoring(options);
    expect(providers.length).toBeGreaterThan(1);
  });
});
