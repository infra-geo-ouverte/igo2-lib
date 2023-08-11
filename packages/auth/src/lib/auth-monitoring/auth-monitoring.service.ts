import { Inject, Injectable } from '@angular/core';
import {
  AnyMonitoringOptions,
  MONITORING_OPTIONS,
  identifySentryUser
} from '@igo2/core';
import { AuthService } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class AuthMonitoringService {
  constructor(
    private authService: AuthService,
    @Inject(MONITORING_OPTIONS)
    private monitoringOptions: AnyMonitoringOptions | null
  ) {
    this.handleUserIdentification();
  }

  private handleUserIdentification(): void {
    if (!this.monitoringOptions?.identifyUser) {
      return;
    }
    this.authService.authenticate$.subscribe((isAuthenticated) => {
      const user = isAuthenticated ? this.authService.user : null;

      switch (this.monitoringOptions.provider) {
        case 'sentry':
          identifySentryUser(user);
          break;

        default:
          break;
      }
    });
  }
}
