import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import { MsalService } from '@azure/msal-angular';
import {
  BrowserCacheLocation,
  PublicClientApplication
} from '@azure/msal-browser';
import { Observable, of } from 'rxjs';

import { AuthService } from '../../../src/lib/shared/auth.service';
import { TokenService } from '../../../src/lib/shared/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthMsalService extends AuthService {
  constructor(
    public http: HttpClient,
    public tokenService: TokenService,
    public config: ConfigService,
    public languageService: LanguageService,
    public messageService: MessageService,
    @Optional() public router: Router,
    private msalService: MsalService
  ) {
    super(http, tokenService, config, languageService, messageService, router);
  }

  logout(): Observable<boolean> {
    if (this.msalService?.instance?.getActiveAccount()) {
      this.msalService.initialize().subscribe({
        next: () => {
          this.handleLogout();
        },
        error: (error) => {
          console.error('Error during initialization:', error);
        }
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

    this.msalService.logoutPopup(logoutRequest).subscribe({
      next: () => {
        this.logoutInternal();
      },
      error: (error) => {
        console.error('Error during logout:', error);
      }
    });
  }

  public async initializeMicrosoft(msalService: MsalService) {
    this.msalService = msalService;

    this.msalService.instance = new PublicClientApplication({
      auth: this.authOptions.microsoft,
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage
      }
    });

    await this.msalService.instance.initialize();
  }
}
