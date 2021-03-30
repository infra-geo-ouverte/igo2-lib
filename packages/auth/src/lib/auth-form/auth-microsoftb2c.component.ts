import {
  Component,
  ChangeDetectionStrategy,
  ApplicationRef,
  Output,
  EventEmitter,
  Inject
} from '@angular/core';


import { MsalBroadcastService, MsalService, MSAL_GUARD_CONFIG, MsalGuardConfiguration} from '@azure/msal-angular';
import { InteractionStatus, AuthenticationResult, InteractionType, PopupRequest, SilentRequest,InteractionRequiredAuthError } from '@azure/msal-browser';
import { ConfigService } from '@igo2/core';
import { AuthMicrosoftb2cOptions } from '../shared/auth.interface';
import { AuthService } from '../shared/auth.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'igo-auth-microsoftb2c',
  templateUrl: './auth-microsoftb2c.component.html',
  styleUrls: ['./auth-microsoftb2c.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthMicrosoftb2cComponent {
  private options: AuthMicrosoftb2cOptions;
  private readonly _destroying$ = new Subject<void>();
  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private appRef: ApplicationRef,
    private broadcastService: MsalBroadcastService,
    private msalService: MsalService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
  ) {
    this.options = this.config.getConfig('auth.microsoftb2c') || {};

    if (this.options.browserAuthOptions.clientId) {
      this.broadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAccount();
      })
     
    } else {
      console.warn('Microsoft authentification needs "clientId" option');
    }
  }

  public loginMicrosoftb2c() {
    this.msalService.loginPopup({...this.msalGuardConfig.authRequest} as PopupRequest)
    .subscribe((response: AuthenticationResult) => {
      this.msalService.instance.setActiveAccount(response.account);
    });
  }

  private checkAccount() {
    this.msalService.instance
      .acquireTokenSilent(this.msalGuardConfig.authRequest as SilentRequest)
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
            return this.msalService.acquireTokenPopup(this.msalGuardConfig.authRequest as SilentRequest);
        }
        }).catch(error => {
            console.log('Fuck');
        });
  }
}
