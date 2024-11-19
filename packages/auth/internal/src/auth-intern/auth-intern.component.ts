import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '@igo2/auth';
import { IgoLanguageModule } from '@igo2/core/language';

@Component({
  selector: 'igo-auth-intern',
  templateUrl: './auth-intern.component.html',
  styleUrls: ['./auth-intern.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgIf,
    IgoLanguageModule
  ]
})
export class AuthInternComponent {
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

  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public auth: AuthService,
    fb: UntypedFormBuilder
  ) {
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
      (err: any) => {
        this.auth
          .translateError('igo.auth.error.intern.', err)
          .subscribe((translatedErrorMsg) => (this.error = translatedErrorMsg));
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
