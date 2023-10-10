import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder
} from '@angular/forms';

import { AuthService } from '../shared/auth.service';
import { LanguageService } from '@igo2/core';

@Component({
  selector: 'igo-auth-intern',
  templateUrl: './auth-intern.component.html',
  styleUrls: ['./auth-intern.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
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
    private languageService: LanguageService,
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
      (error: any) => {
        try {
          this.languageService.translate
            .get('igo.auth.error.' + error.error.message)
            .subscribe((errorMsg) => (this.error = errorMsg));
        } catch (e) {
          this.error = error.error.message;
        }
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
