import {
  Component,
  ChangeDetectionStrategy,
  ApplicationRef,
  Output,
  EventEmitter
} from '@angular/core';

import { ConfigService } from '@igo/core';
import { AuthService, AuthFacebookOptions } from '../shared';

@Component({
  selector: 'igo-auth-facebook',
  templateUrl: './auth-facebook.component.html',
  styleUrls: ['./auth-facebook.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthFacebookComponent {
  private options: AuthFacebookOptions;

  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private appRef: ApplicationRef
  ) {
    this.config.getConfig('auth.google') || {};
    this.options = {} as AuthFacebookOptions;

    if (this.options.apiKey) {
      this.loadSDKFacebook();
    }
  }

  private subscribeEvents() {
    window['FB'].Event.subscribe('auth.statusChange', rep => {
      this.statusChangeCallback(rep);
    });
  }

  private statusChangeCallback(response) {
    if (response.status === 'connected') {
      const accessToken = response.authResponse.accessToken;
      this.loginFacebook(accessToken);
    }
  }

  private loginFacebook(token) {
    this.authService.loginWithToken(token, 'facebook').subscribe(() => {
      this.appRef.tick();
      this.login.emit(true);
    });
  }

  private loadSDKFacebook() {
    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    const urlSDK =
      'https://connect.facebook.net/fr_CA/sdk.js#xfbml=1&version=v2.9';

    const fjs = document.getElementsByTagName('script')[0];
    const js = document.createElement('script');
    js.id = 'facebook-jssdk';
    js.src = `${urlSDK}&appId=${this.options.apiKey}`;
    js.onload = () => {
      this.subscribeEvents();
    };
    fjs.parentNode.insertBefore(js, fjs);
  }
}
