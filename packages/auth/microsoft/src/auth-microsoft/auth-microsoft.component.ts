import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  inject,
  input,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { AuthService, translateError } from '@igo2/auth';
import { LanguageService } from '@igo2/core/language';

import { AuthMsalService } from '../shared/auth-msal.service';

@Component({
  selector: 'igo-auth-microsoft',
  templateUrl: './auth-microsoft.component.html',
  styleUrls: ['./auth-microsoft.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatError, MatIconModule]
})
export class AuthMicrosoftComponent implements OnInit {
  private auth = inject(AuthService) as AuthMsalService;
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);

  private get languageService(): LanguageService | null {
    return this.injector.get(LanguageService, null);
  }

  readonly signInButtonLabel = input.required<string>();
  readonly login = output<boolean>();

  error = '';

  ngOnInit(): void {
    if (this.auth.autoLogin) {
      this.loginUser();
    }
  }

  public loginUser() {
    this.auth.login().subscribe({
      next: () => {
        this.appRef.tick();
        this.login.emit(true);
      },
      error: (err) => {
        if (!this.languageService) {
          return err;
        }

        translateError(
          'igo.auth.error.microsoft.',
          err,
          this.languageService
        ).subscribe((translatedErrorMsg) => {
          this.error = translatedErrorMsg;
        });
      }
    });
  }
}
