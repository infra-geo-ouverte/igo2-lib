import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { ConfigService } from '@igo2/core/config';

import { map } from 'rxjs/operators';

import { AuthOptions } from './auth.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilsGuard {
  private authService = inject(AuthService);
  private config = inject(ConfigService);
  private router = inject(Router);

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.getProfils().pipe(
      map((profils: { profils: string[] }) => {
        const authConfig = this.config.getConfig('auth') as AuthOptions;
        if (
          profils &&
          profils.profils &&
          profils.profils.some((v) => authConfig.profilsGuard.indexOf(v) !== -1)
        ) {
          return true;
        }

        this.authService.redirectUrl = state.url;

        if (authConfig?.loginRoute) {
          this.router.navigateByUrl(authConfig.loginRoute);
        }

        return false;
      })
    );
  }
}
