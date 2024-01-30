import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { AuthService } from '@igo2/auth';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';

import { AuthGoogleOptions } from '../shared/auth-form.interface';

@Component({
  selector: 'igo-auth-google',
  templateUrl: './auth-google.component.html',
  styleUrls: ['./auth-google.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AuthGoogleComponent {
  private options?: AuthGoogleOptions;

  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private languageService: LanguageService,
    private appRef: ApplicationRef
  ) {
    this.options = this.config.getConfig('auth.google');

    if (this.options?.apiKey && this.options?.clientId) {
      this.loadSDKGoogle();
      this.loadPlatform();
    } else {
      console.warn(
        'Google authentification needs "apiKey" and "clientId" options'
      );
    }
  }

  public handleSignInClick() {
    (window as any).gapi.auth2.getAuthInstance().signIn();
  }

  public handleSignOutClick() {
    (window as any).gapi.auth2.getAuthInstance().signOut();
  }

  private handleClientLoad() {
    (window as any).gapi.load('client:auth2', () => this.initClient());
  }

  private initClient() {
    (window as any).gapi.client
      .init({
        apiKey: this.options?.apiKey,
        clientId: this.options?.clientId,
        discoveryDocs: [
          'https://people.googleapis.com/$discovery/rest?version=v1'
        ],
        scope: 'profile'
      })
      .then(() => {
        this.handleSignOutClick();
        this.updateTextButton();
        (window as any).gapi.auth2
          .getAuthInstance()
          .isSignedIn.listen((rep) => {
            this.updateSigninStatus(rep);
          });
      });
  }

  private updateSigninStatus(isSignedIn) {
    this.updateTextButton();
    if (isSignedIn) {
      this.loginGoogle((window as any).gapi.client.getToken().access_token);
    }
  }

  private updateTextButton() {
    const btn = document.querySelector('span[id^="not_signed_"]');
    if (btn && this.languageService.getLanguage() !== 'en') {
      if (btn.innerHTML === 'Sign in with Google') {
        btn.innerHTML = this.languageService.translate.instant(
          'igo.auth.google.login'
        );
      } else if (btn.innerHTML === 'Signed in with Google') {
        btn.innerHTML = this.languageService.translate.instant(
          'igo.auth.google.logged'
        );
      }
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
