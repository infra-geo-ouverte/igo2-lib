import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { map, take } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private authService = inject(AuthService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.initialized$.pipe(
      take(1),
      map((authenticated) => {
        if (authenticated) {
          return true;
        }

        this.authService.redirectToLogin(route, state);

        return false;
      })
    );
  }
}
