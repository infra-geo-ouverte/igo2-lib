import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { ConfigService } from '@igo2/core';

import { AuthOptions } from './auth.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const token = this.authService.decodeToken();
    if (token?.user?.isAdmin) {
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
