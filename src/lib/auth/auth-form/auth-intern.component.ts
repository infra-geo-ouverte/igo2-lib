import { Component, ChangeDetectionStrategy,
  Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { AuthService } from "../shared/auth.service";

@Component({
  selector: 'igo-auth-intern',
  templateUrl: './auth-intern.component.html',
  styleUrls: ['./auth-intern.component.styl'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AuthInternComponent {
  public error: string = "";
  private form: FormGroup;

  @Output() onLogin: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public auth: AuthService,
    fb: FormBuilder
  ) {
    this.form = fb.group({
      username: ["", Validators.required],
      password: ["", Validators.required]
    });
  }

  protected login(values: any) {
    this.auth.login(values.username, values.password)
      .subscribe(
        () => {
          this.onLogin.emit(true);
        },
        (errors: any) => {
          let message = "";
          for (let err in errors) {
            if (!errors.hasOwnProperty(err)) { continue; }
            message += errors[err]['message'] + '\n';
          }
          this.error = message;
        }
      );
    return false;
  }
}
