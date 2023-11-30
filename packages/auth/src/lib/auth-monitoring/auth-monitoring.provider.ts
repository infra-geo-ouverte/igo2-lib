import { APP_INITIALIZER, Injector, Provider } from '@angular/core';

import {
  AnyMonitoringOptions,
  ConfigService,
  MONITORING_OPTIONS
} from '@igo2/core';

import { AuthMonitoringService } from './auth-monitoring.service';

export function provideAuthUserMonitoring(
  options: AnyMonitoringOptions | null
): Provider[] {
  if (!options) {
    return [];
  }

  return [
    {
      provide: AuthMonitoringService,
      useClass: AuthMonitoringService,
      deps: [ConfigService, MONITORING_OPTIONS, Injector]
    },
    // Force instantiate Tracing service to avoid require it in any constructor.
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [AuthMonitoringService],
      multi: true
    }
  ];
}
