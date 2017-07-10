import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ConfigService } from '../../core';
import { AuthService, AuthOptions } from "../shared";

@Component({
  selector: 'igo-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.styl'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AuthFormComponent {
  private options: AuthOptions;

  constructor(
    public auth: AuthService,
    private config: ConfigService
  ) {
    this.options = this.config.getConfig('auth') || {};
  }
}
