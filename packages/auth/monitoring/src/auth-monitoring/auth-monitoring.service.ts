import { Inject, Injectable, Injector, Optional } from '@angular/core';

import { AuthService, User } from '@igo2/auth';
import { ConfigService } from '@igo2/core/config';
import {
  AnyMonitoringOptions,
  MONITORING_OPTIONS,
  identifySentryUser
} from '@igo2/core/monitoring';

import { first, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthMonitoringService {
  // The AuthService need to be lazy provided because this service is provided in the APP_INITIALIZER
  authService?: AuthService;

  constructor(
    private configService: ConfigService,
    @Optional()
    @Inject(MONITORING_OPTIONS)
    private monitoringOptions: AnyMonitoringOptions | null,
    private injector: Injector
  ) {
    if (!this.monitoringOptions?.identifyUser) {
      return;
    }

    this.configService.isLoaded$
      .pipe(
        first((isLoaded) => isLoaded),
        switchMap(() => {
          this.authService = this.injector.get(AuthService);
          return this.authService?.authenticate$;
        })
      )
      .subscribe((isAuthenticated) => {
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
