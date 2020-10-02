import {
  Component,
  ChangeDetectionStrategy,
  ApplicationRef,
  Output,
  EventEmitter
} from '@angular/core';

import { BroadcastService, MsalService } from '@azure/msal-angular';
import { AuthResponse as MsalAuthResponse } from 'msal';

import { ConfigService } from '@igo2/core';
import { AuthMicrosoftOptions } from '../shared/auth.interface';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'igo-auth-microsoft',
  templateUrl: './auth-microsoft.component.html',
  styleUrls: ['./auth-microsoft.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthMicrosoftComponent {
  private options: AuthMicrosoftOptions;

  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private appRef: ApplicationRef,
    private broadcastService: BroadcastService,
    private msalService: MsalService
  ) {
    this.options = this.config.getConfig('auth.microsoft') || {};

    if (this.options.clientId) {
      this.broadcastService.subscribe('msal:loginSuccess', () => {
        this.checkAccount();
      });
    } else {
      console.warn('Microsoft authentification needs "clientId" option');
    }
  }

  public loginMicrosoft() {
    this.msalService.loginPopup();
  }

  private checkAccount() {
    this.msalService
      .acquireTokenSilent({ scopes: ['user.read'] })
      .then((response: MsalAuthResponse) => {
        const token = response.accessToken;
        this.authService.loginWithToken(token, 'microsoft').subscribe(() => {
          this.appRef.tick();
          this.login.emit(true);
        });
      });
  }
}
