import {
  Component,
  ChangeDetectionStrategy,
  ApplicationRef,
  Output,
  EventEmitter,
  Inject
} from '@angular/core';
import {
  MsalBroadcastService,
  MsalService,
  MSAL_GUARD_CONFIG
} from '@azure/msal-angular';
import {
  InteractionStatus,
  AuthenticationResult,
  PublicClientApplication,
  PopupRequest,
  SilentRequest,
  InteractionRequiredAuthError
} from '@azure/msal-browser';
import { ConfigService } from '@igo2/core';
import {
  AuthMicrosoftOptions,
  MSPMsalGuardConfiguration
} from '../shared/auth.interface';
import { AuthService } from '../shared/auth.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'igo-auth-microsoft',
  templateUrl: './auth-microsoft.component.html',
  styleUrls: ['./auth-microsoft.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthMicrosoftComponent {
  private options?: AuthMicrosoftOptions;
  private readonly _destroying$ = new Subject<void>();
  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();
  private broadcastService: MsalBroadcastService;

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
