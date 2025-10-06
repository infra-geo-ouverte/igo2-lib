import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject
} from '@angular/core';

import { AuthService } from '@igo2/auth';
import { ConfigService } from '@igo2/core/config';

import { AuthFacebookOptions } from '../shared/auth-facebook.interface';

@Component({
  selector: 'igo-auth-facebook',
  templateUrl: './auth-facebook.component.html',
  styleUrls: ['./auth-facebook.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AuthFacebookComponent {
  private authService = inject(AuthService);
  private config = inject(ConfigService);
  private appRef = inject(ApplicationRef);

  private options?: AuthFacebookOptions;

  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {
    this.options = this.config.getConfig('auth.facebook');

    if (this.options?.appId) {
      this.loadSDKFacebook();
    } else {
      console.warn('Facebook authentification needs "appId" option');
    }
  }

  private subscribeEvents() {
    (window as any).FB.Event.subscribe('auth.statusChange', (rep) => {
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
    js.src = `${urlSDK}&appId=${this.options?.appId}`;
    js.onload = () => {
      this.subscribeEvents();
    };
    fjs.parentNode.insertBefore(js, fjs);
  }
}
