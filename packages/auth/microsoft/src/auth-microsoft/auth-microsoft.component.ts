import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '@igo2/auth';
import { IgoLanguageModule } from '@igo2/core/language';

import { AuthMsalService } from '../shared/auth-msal.service';

@Component({
  selector: 'igo-auth-microsoft',
  templateUrl: './auth-microsoft.component.html',
  styleUrls: ['./auth-microsoft.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatError, MatIconModule, IgoLanguageModule]
})
export class AuthMicrosoftComponent implements OnInit {
  private auth = inject(AuthService) as AuthMsalService;
  private appRef = inject(ApplicationRef);

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
        this.auth
          .translateError('igo.auth.error.microsoft.', err)
          .subscribe((translatedErrorMsg) => {
            this.error = translatedErrorMsg;
          });
      }
    });
  }
}
