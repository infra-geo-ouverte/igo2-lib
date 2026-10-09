import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { map } from 'rxjs/operators';

import { AUTH_OPTIONS } from './auth.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilsGuard {
  private authService = inject(AuthService);
  private authOptions = inject(AUTH_OPTIONS);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.getProfils().pipe(
      map((profils: { profils: string[] }) => {
        if (
          profils &&
          profils.profils &&
          profils.profils.some(
            (v) => this.authOptions.profilsGuard?.indexOf(v) !== -1
          )
        ) {
          return true;
        }

        this.authService.redirectUrl = state.url;

        this.authService.redirectToLogin(route, state);

        return false;
      })
    );
  }
}
