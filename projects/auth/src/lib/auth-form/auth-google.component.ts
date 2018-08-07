import {
  Component,
  ChangeDetectionStrategy,
  ApplicationRef,
  Output,
  EventEmitter
} from '@angular/core';

import { ConfigService } from '@igo2/core';
import { AuthGoogleOptions } from '../shared/auth.interface';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'igo-auth-google',
  templateUrl: './auth-google.component.html',
  styleUrls: ['./auth-google.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthGoogleComponent {
  private options: AuthGoogleOptions;

  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private appRef: ApplicationRef
  ) {
    this.options = this.config.getConfig('auth.google') || {};

    if (this.options.apiKey && this.options.clientId) {
      this.loadSDKGoogle();
      this.loadPlatform();
    }
  }

  public handleSignInClick() {
    window['gapi'].auth2.getAuthInstance().signIn();
  }

  public handleSignOutClick() {
    window['gapi'].auth2.getAuthInstance().signOut();
  }

  private handleClientLoad() {
    window['gapi'].load('client:auth2', () => this.initClient());
  }

  private initClient() {
    window['gapi'].client
      .init({
        apiKey: this.options.apiKey,
        clientId: this.options.clientId,
        discoveryDocs: [
          'https://people.googleapis.com/$discovery/rest?version=v1'
        ],
        scope: 'profile'
      })
      .then(() => {
        this.handleSignOutClick();
        window['gapi'].auth2.getAuthInstance().isSignedIn.listen(rep => {
          this.updateSigninStatus(rep);
        });
      });
  }

  private updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      this.loginGoogle(window['gapi'].client.getToken().access_token);
    }
  }

  private loginGoogle(token) {
    this.authService.loginWithToken(token, 'google').subscribe(() => {
      this.appRef.tick();
      this.login.emit(true);
    });
  }

  private loadSDKGoogle() {
    const fjs = document.getElementsByTagName('script')[0];
    const js = document.createElement('script');
    js.id = 'google-jssdk';
    js.src = 'https://apis.google.com/js/api.js';
    js.onload = () => {
      this.handleClientLoad();
    };
    fjs.parentNode.insertBefore(js, fjs);
  }

  private loadPlatform() {
    const fjs = document.getElementsByTagName('script')[0];
    const js = document.createElement('script');
    js.id = 'google-platform';
    js.src = 'https://apis.google.com/js/platform.js';
    fjs.parentNode.insertBefore(js, fjs);
  }
}
