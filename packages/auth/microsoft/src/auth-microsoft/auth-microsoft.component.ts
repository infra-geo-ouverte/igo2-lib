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
import { IconSvg, IgoIconComponent, MICROSOFT_ICON } from '@igo2/common';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

import {
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalService
} from '@azure/msal-angular';
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
  AuthMicrosoftOptions,
  MSPMsalGuardConfiguration
} from '../shared/auth-microsoft.interface';

@Component({
  selector: 'igo-auth-microsoft',
  templateUrl: './auth-microsoft.component.html',
  styleUrls: ['./auth-microsoft.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, IgoLanguageModule, IgoIconComponent]
})
export class AuthMicrosoftComponent {
  private options?: AuthMicrosoftOptions;
  private readonly _destroying$ = new Subject<void>();
  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();
  private broadcastService: MsalBroadcastService;

  svgIcon: IconSvg = MICROSOFT_ICON;

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private appRef: ApplicationRef,
    private msalService: MsalService,
    @Inject(MSAL_GUARD_CONFIG)
    private msalGuardConfig: MSPMsalGuardConfiguration[]
  ) {
    this.options = this.config.getConfig('auth.microsoft');

    this.msalService.instance = new PublicClientApplication({
      auth: this.options,
      cache: {
        cacheLocation: 'sessionStorage'
      }
    });

    this.broadcastService = new MsalBroadcastService(
      this.msalService.instance,
      this.msalService
    );

    if (this.options?.clientId) {
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

  public loginMicrosoft() {
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
        const tokenAccess = response.accessToken;
        const tokenId = response.idToken;
        this.authService
          .loginWithToken(tokenAccess, 'microsoft', { tokenId })
          .subscribe(() => {
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
        console.log(error);
      })
      .catch((error) => {
        console.log('Silent token fails');
      });
  }

  private getConf(): MSPMsalGuardConfiguration {
    return this.msalGuardConfig.filter((conf) => conf.type === 'add')[0];
  }
}
