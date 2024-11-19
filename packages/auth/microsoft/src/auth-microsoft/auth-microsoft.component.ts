import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AuthService } from '@igo2/auth';
import { IconSvg, IgoIconComponent, MICROSOFT_ICON } from '@igo2/common/icon';
import { IgoLanguageModule } from '@igo2/core/language';

import { AuthMsalService } from '../shared/auth-msal.service';

@Component({
  selector: 'igo-auth-microsoft',
  templateUrl: './auth-microsoft.component.html',
  styleUrls: ['./auth-microsoft.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButtonModule,
    IgoLanguageModule,
    IgoIconComponent,
    MatFormFieldModule
  ]
})
export class AuthMicrosoftComponent implements OnInit {
  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  svgIcon: IconSvg = MICROSOFT_ICON;
  private auth = inject(AuthService) as AuthMsalService;

  public error = '';

  constructor(private appRef: ApplicationRef) {}

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
      error: (err: any) => {
        this.auth
          .translateError('igo.auth.error.microsoft.', err)
          .subscribe((translatedErrorMsg) => {
            this.error = translatedErrorMsg;
          });
      }
    });
  }
}
