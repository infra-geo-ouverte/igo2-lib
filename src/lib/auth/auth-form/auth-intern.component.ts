import { Component, ChangeDetectionStrategy } from '@angular/core';
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
        () => {},
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
