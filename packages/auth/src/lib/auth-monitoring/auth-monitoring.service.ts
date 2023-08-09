import { Inject, Injectable } from '@angular/core';
import { AuthService } from '@igo2/auth';
import {
  AnyMonitoringOptions,
  MONITORING_OPTIONS,
  identifySentryUser
} from '@igo2/core';

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
