import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  output
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { AuthService, translateError } from '@igo2/auth';
import { IgoLanguageModule, LanguageService } from '@igo2/core/language';

@Component({
  selector: 'igo-auth-intern',
  templateUrl: './auth-intern.component.html',
  styleUrls: ['./auth-intern.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinner,
    IgoLanguageModule
  ]
})
export class AuthInternComponent {
  auth = inject(AuthService);
  private languageService = inject(LanguageService);

  @Input()
  get allowAnonymous(): boolean {
    return this._allowAnonymous;
  }
  set allowAnonymous(value: boolean) {
    this._allowAnonymous = value;
  }
  private _allowAnonymous = true;

  public error = '';
  public form: UntypedFormGroup;
  public loading = false;

  readonly login = output<boolean>();

  constructor() {
    const fb = inject(UntypedFormBuilder);

    this.form = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  loginUser(values: any) {
    this.loading = true;
    this.auth.login(values.username, values.password).subscribe(
      () => {
        this.login.emit(true);
        this.loading = false;
      },
      (err) => {
        translateError(
          'igo.auth.error.intern.',
          err,
          this.languageService
        ).subscribe((translatedErrorMsg) => (this.error = translatedErrorMsg));
        this.loading = false;
      }
    );
    return false;
  }

  loginAnonymous() {
    this.auth.loginAnonymous().subscribe(() => {
      this.login.emit(true);
    });
  }
}
