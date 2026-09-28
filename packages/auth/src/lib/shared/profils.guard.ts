import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { AUTH_OPTIONS } from './auth.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilsGuard {
  private authService = inject(AuthService);
  private authOptions = inject(AUTH_OPTIONS);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (
      !this.authService.hasAuthService ||
      !this.authOptions.profilsGuard?.length
    ) {
      this.authService.redirectToLogin(route, state);
      return of(false);
    }

    return this.authService.getProfils().pipe(
      map((profils: { profils: string[] }) => {
        if (
          profils.profils.some((profil) =>
            this.authOptions.profilsGuard?.includes(profil)
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
