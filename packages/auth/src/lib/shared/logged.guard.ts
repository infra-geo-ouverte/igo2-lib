import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { ConfigService } from '@igo2/core/config';

import { AuthOptions } from './auth.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedGuard {
  private authService = inject(AuthService);
  private config = inject(ConfigService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.logged) {
      return true;
    }

    this.authService.redirectUrl = state.url;

    const authConfig = this.config.getConfig('auth') as AuthOptions;
    if (authConfig?.loginRoute) {
      this.router.navigateByUrl(authConfig.loginRoute);
    }

    return false;
  }
}
