import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService, LanguageService, MessageService } from '@igo2/core';

import { Observable, filter, of, take } from 'rxjs';

import { AuthType } from './auth-type.enum';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class MspAuthExtranetService extends AuthService {
  public autoLogin = false;

  constructor(
    public http: HttpClient,
    public tokenService: TokenService,
    public config: ConfigService,
    public languageService: LanguageService,
    public messageService: MessageService,
    @Optional() public router: Router
  ) {
    super(http, tokenService, config, languageService, messageService, router);
    this.authType = AuthType.MspExtranet;
    this.autoLogin = this.authOptions.mspextranet?.autoLogin === true;
  }

  login(): Observable<void> {
    const header = new HttpHeaders({ 'Content-Type': 'application/json' });
    return super.loginCall({ typeConnection: 'msp-extranet' }, header);
  }

  logout(): Observable<boolean> {
    super.logout();
    this.autoLogin = false;
    this.authenticate$
      .pipe(
        filter((authenticated) => authenticated === false),
        take(1)
      )
      .subscribe((authenticated) => {
        this.goToLogoutUrl();
      });
    return of(true);
  }

  private goToLogoutUrl() {
    const logoutUrl = this.authOptions.mspextranet?.logoutUrl;
    if (logoutUrl) {
      window.location.href = logoutUrl;
    }
  }
}
