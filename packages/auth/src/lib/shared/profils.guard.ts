import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { map } from 'rxjs/operators';

import { ConfigService } from '@igo2/core';
import { AuthService } from './auth.service';
import { AuthOptions } from './auth.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfilsGuard {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private router: Router
  ) {}

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
