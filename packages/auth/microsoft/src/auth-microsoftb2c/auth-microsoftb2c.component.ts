import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '@igo2/auth';
import { IconSvg, IgoIconComponent, MICROSOFT_ICON } from '@igo2/common/icon';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

import { MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import {
  AuthenticationResult,
  InteractionRequiredAuthError,
  InteractionStatus,
  PopupRequest,
  PublicClientApplication,
  SilentRequest
} from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import {
  AuthMicrosoftb2cOptions,
  MSPMsalGuardConfiguration
} from '../shared/auth-microsoft.interface';
import { MsalBroadcastServiceb2c } from './auth-msalBroadcastServiceb2c.service';
import { MsalServiceb2c } from './auth-msalServiceb2c.service';

@Component({
  selector: 'igo-auth-microsoftb2c',
  templateUrl: './auth-microsoftb2c.component.html',
  styleUrls: ['./auth-microsoftb2c.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, IgoLanguageModule, IgoIconComponent],
  providers: [MsalServiceb2c]
})
export class AuthMicrosoftb2cComponent {
  private options: AuthMicrosoftb2cOptions;
  private readonly _destroying$ = new Subject<void>();
  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();
  private broadcastService: MsalBroadcastServiceb2c;

  svgIcon: IconSvg = MICROSOFT_ICON;

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private appRef: ApplicationRef,
    private msalService: MsalServiceb2c,
    @Inject(MSAL_GUARD_CONFIG)
    private msalGuardConfig: MSPMsalGuardConfiguration[]
  ) {
    this.options = this.config.getConfig('auth.microsoftb2c') || {};

    this.msalService.instance = new PublicClientApplication({
      auth: this.options.browserAuthOptions,
      cache: {
        cacheLocation: 'sessionStorage'
      }
    });

    this.broadcastService = new MsalBroadcastServiceb2c(
      this.msalService.instance,
      this.msalService
    );

    if (this.options.browserAuthOptions.clientId) {
      this.broadcastService.inProgress$
        .pipe(
          filter(
            (status: InteractionStatus) => status === InteractionStatus.None
          ),
          takeUntil(this._destroying$)
        )
        .subscribe(() => {
          this.checkAccount();
        });
    } else {
      console.warn('Microsoft authentification needs "clientId" option');
    }
  }

  public loginMicrosoftb2c() {
    this.msalService
      .loginPopup({ ...this.getConf().authRequest } as PopupRequest)
      .subscribe((response: AuthenticationResult) => {
        this.msalService.instance.setActiveAccount(response.account);
        this.checkAccount();
      });
  }

  private checkAccount() {
    this.msalService.instance
      .acquireTokenSilent(this.getConf().authRequest as SilentRequest)
      .then((response: AuthenticationResult) => {
        const token = response.idToken;
        this.authService.loginWithToken(token, 'microsoftb2c').subscribe(() => {
          this.appRef.tick();
          this.login.emit(true);
        });
      })
      .catch(async (error) => {
        if (error instanceof InteractionRequiredAuthError) {
          // fallback to interaction when silent call fails
          return this.msalService.acquireTokenPopup(
            this.getConf().authRequest as SilentRequest
          );
        }
      })
      .catch(() => {
        console.log('Silent token fails');
      });
  }

  private getConf(): MSPMsalGuardConfiguration {
    return this.msalGuardConfig.filter((conf) => conf.type === 'b2c')[0];
  }
}
