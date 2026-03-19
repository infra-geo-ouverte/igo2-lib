import { Injectable, inject } from '@angular/core';

import { AuthOptions, AuthService, AuthType, IUser } from '@igo2/auth';

import { MSAL_GUARD_CONFIG, MsalService } from '@azure/msal-angular';
import { PopupRequest } from '@azure/msal-browser';
import { Observable, finalize, switchMap, tap } from 'rxjs';

import {
  AuthMicrosoftOptions,
  MsalGuardConfigurationWithType
} from './auth-microsoft.interface';

interface IAuthMsalOptions extends AuthOptions {
  microsoft: AuthMicrosoftOptions;
}

@Injectable({
  providedIn: 'root'
})
export class AuthMsalService extends AuthService<IAuthMsalOptions> {
  private msalService = inject(MsalService);
  private msalGuardConfig =
    inject<MsalGuardConfigurationWithType[]>(MSAL_GUARD_CONFIG);

  private _isInitialized$: Observable<void>;
  autoLogin = false;

  constructor() {
    super();

    this.authType = AuthType.MicrosoftIntranet;
    this.autoLogin = this.authOptions.microsoft?.autoLogin === true;
    this._isInitialized$ = this.msalService.initialize();
  }

  login(): Observable<IUser> {
    this.isLogging.set(true);
    return this._isInitialized$.pipe(
      switchMap(() =>
        this.msalService.loginPopup(this.getConf().authRequest as PopupRequest)
      ),
      tap(({ account }) => this.msalService.instance.setActiveAccount(account)),
      switchMap(({ idToken, accessToken }) =>
        this.loginWithToken(
          accessToken,
          'microsoft',
          { tokenId: idToken },
          this.authOptions.microsoft.applicationId
        )
      ),
      finalize(() => this.isLogging.set(false))
    );
  }

  logout(): void {
    if (this.msalService?.instance?.getActiveAccount()) {
      const logoutRequest = {
        account: this.msalService.instance.getActiveAccount()
      };
      this._isInitialized$
        .pipe(switchMap(() => this.msalService.logoutPopup(logoutRequest)))
        .subscribe(() => super.logout());
    } else {
      super.logout();
    }
  }

  private getConf(): MsalGuardConfigurationWithType {
    return this.msalGuardConfig.filter((conf) => conf.type === 'add')[0];
  }
}
