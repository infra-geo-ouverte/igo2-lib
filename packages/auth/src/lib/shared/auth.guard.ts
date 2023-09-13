import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import { ConfigService } from '@igo2/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.authenticated) {
      return true;
    }

    this.authService.redirectUrl = state.url;

    const authConfig = this.config.getConfig('auth');
    if (authConfig && authConfig.loginRoute) {
      this.router.navigateByUrl(authConfig.loginRoute);
    }

    return false;
  }
}
