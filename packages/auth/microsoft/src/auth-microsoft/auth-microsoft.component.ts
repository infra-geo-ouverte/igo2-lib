import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '@igo2/auth';
import { IconSvg, IgoIconComponent, MICROSOFT_ICON } from '@igo2/common/icon';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

import {
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalService
} from '@azure/msal-angular';
import {
  AuthenticationResult,
  InteractionStatus,
  PopupRequest
} from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import {
  AuthMicrosoftOptions,
  MSPMsalGuardConfiguration
} from '../shared/auth-microsoft.interface';
import { AuthMsalService } from '../shared/auth-msal.service';

@Component({
  selector: 'igo-auth-microsoft',
  templateUrl: './auth-microsoft.component.html',
  styleUrls: ['./auth-microsoft.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, IgoLanguageModule, IgoIconComponent]
})
export class AuthMicrosoftComponent implements OnInit {
  private options?: AuthMicrosoftOptions;
  private readonly _destroying$ = new Subject<void>();
  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();
  private broadcastService: MsalBroadcastService;

  svgIcon: IconSvg = MICROSOFT_ICON;

  constructor(
    private authService: AuthMsalService,
    private config: ConfigService,
    private appRef: ApplicationRef,
    private msalService: MsalService,
    @Inject(MSAL_GUARD_CONFIG)
    private msalGuardConfig: MSPMsalGuardConfiguration[]
  ) {
    this.options = this.config.getConfig('auth.microsoft');

    this.broadcastService = new MsalBroadcastService(
      this.msalService.instance,
      this.msalService
    );

    if (this.options?.clientId) {
      this.broadcastService.inProgress$.pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      );
    } else {
      console.warn('Microsoft authentification needs "clientId" option');
    }
  }

  ngOnInit() {
    this.authService.initializeMicrosoft(this.msalService).then(() => {
      if (this.options.autoLogin) {
        this.loginMicrosoft();
      }
    });
  }

  public async loginMicrosoft() {
    this.msalService
      .loginPopup(this.getConf().authRequest as PopupRequest)
      .subscribe({
        next: (response: AuthenticationResult) => {
          this.msalService.instance.setActiveAccount(response.account);
          const tokenId = response.idToken;
          this.authService
            .loginWithToken(
              response.accessToken,
              'microsoft',
              { tokenId },
              this.options.applicationId
            )
            .subscribe(() => {
              this.appRef.tick();
              this.login.emit(true);
            });
        }
      });
  }

  private getConf(): MSPMsalGuardConfiguration {
    return this.msalGuardConfig.filter((conf) => conf.type === 'add')[0];
  }
}
