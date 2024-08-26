import { APP_INITIALIZER, Injector, Provider } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import {
  AnyMonitoringOptions,
  MONITORING_OPTIONS
} from '@igo2/core/monitoring';

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
      useFactory: () => () => void 1,
      deps: [AuthMonitoringService],
      multi: true
    }
  ];
}
