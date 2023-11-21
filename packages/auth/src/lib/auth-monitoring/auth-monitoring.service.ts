import { Inject, Injectable, Optional } from '@angular/core';

import {
  AnyMonitoringOptions,
  MONITORING_OPTIONS,
  identifySentryUser
} from '@igo2/core';

import { AuthService, User } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class AuthMonitoringService {
  constructor(
    private authService: AuthService,
    @Optional()
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
      this._identifyUser(user);
    });
  }

  private _identifyUser(user: User | null): void {
    switch (this.monitoringOptions.provider) {
      case 'sentry':
        identifySentryUser(user);
        break;

      default:
        break;
    }
  }
}
