import { APP_INITIALIZER, Provider } from '@angular/core';
import { AuthMonitoringService } from './auth-monitoring.service';
import { MONITORING_OPTIONS } from '@igo2/core';
import { AuthService } from '../shared';

export function provideAuthUserMonitoring(): Provider[] {
  return [
    {
      provide: AuthMonitoringService,
      useClass: AuthMonitoringService,
      deps: [AuthService, MONITORING_OPTIONS]
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
