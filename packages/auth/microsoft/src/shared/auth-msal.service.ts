import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, AuthType, TokenService } from '@igo2/auth';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import {
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
  MsalService
} from '@azure/msal-angular';
import { PopupRequest } from '@azure/msal-browser';
import { Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthMsalService extends AuthService {
  private _isInitialized$: Observable<void>;

  public autoLogin = false;

  constructor(
    public http: HttpClient,
    public tokenService: TokenService,
    public config: ConfigService,
    public languageService: LanguageService,
    public messageService: MessageService,
    @Optional() public router: Router,
    private msalService: MsalService,
    @Inject(MSAL_GUARD_CONFIG)
    private msalGuardConfig: MsalGuardConfiguration[]
  ) {
    super(http, tokenService, config, languageService, messageService, router);
    this.authType = AuthType.MicrosoftIntranet;
    this.autoLogin = this.authOptions.microsoft?.autoLogin === true;
    this._isInitialized$ = this.msalService.initialize();
  }

  public login(): Observable<void> {
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
      )
    );
  }

  logout(): Observable<boolean> {
    if (this.msalService?.instance?.getActiveAccount()) {
      this._isInitialized$.subscribe(() => {
        this.handleLogout();
      });

      return of(true);
    } else {
      return super.logout();
    }
  }

  private handleLogout(): void {
    const logoutRequest = {
      account: this.msalService.instance.getActiveAccount()
    };

    this.msalService.logoutPopup(logoutRequest).subscribe(() => {
      this.logoutInternal();
    });
  }

  // MSPMsalGuardConfiguration
  private getConf(): MsalGuardConfiguration {
    return this.msalGuardConfig.filter((conf) => conf.type === 'add')[0];
  }
}
