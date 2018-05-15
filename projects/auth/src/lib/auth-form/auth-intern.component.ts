import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'igo-auth-intern',
  templateUrl: './auth-intern.component.html',
  styleUrls: ['./auth-intern.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AuthInternComponent {
  public error = '';
  public form: FormGroup;

  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public auth: AuthService, fb: FormBuilder) {
    this.form = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  loginUser(values: any) {
    this.auth.login(values.username, values.password).subscribe(
      () => {
        this.login.emit(true);
      },
      (error: any) => {
        this.error = error.error.message;
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
