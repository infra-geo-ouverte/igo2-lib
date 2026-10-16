import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NavigationStart, Router } from '@angular/router';

import { AUTH_OPTIONS, AuthOptions, AuthService } from '@igo2/auth';
import { AuthInternComponent } from '@igo2/auth/internal';
import {
  AnyMicrosoftOptions,
  AuthMicrosoftComponent,
  AuthMicrosoftb2cComponent
} from '@igo2/auth/microsoft';
import { IgoLanguageModule } from '@igo2/core/language';

import { filter } from 'rxjs/operators';

@Component({
  selector: 'igo-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    AuthMicrosoftComponent,
    AuthMicrosoftb2cComponent,
    AuthInternComponent,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class AuthFormComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router, { optional: true });

  @Input()
  get backgroundDisable(): boolean {
    if (this.isLogoutRoute || this.isLogoutRoute) {
      return false;
    }
    return this._backgroundDisable;
  }
  set backgroundDisable(value: boolean) {
    this._backgroundDisable = value.toString() === 'true';
  }
  private _backgroundDisable = true;

  @Input()
  get hasAlreadyConnectedDiv(): boolean {
    return this._hasAlreadyConnectedDiv;
  }
  set hasAlreadyConnectedDiv(value: boolean) {
    this._hasAlreadyConnectedDiv = value.toString() === 'true';
  }
  private _hasAlreadyConnectedDiv = true;

  @Input()
  get hasLogoutDiv(): boolean {
    return this._hasLogoutDiv;
  }
  set hasLogoutDiv(value: boolean) {
    this._hasLogoutDiv = value.toString() === 'true';
  }
  private _hasLogoutDiv = true;

  @Input()
  get showAlreadyConnectedDiv(): boolean {
    if (this.isLogoutRoute) {
      return this.hasAlreadyConnectedDiv;
    }
    return this._showAlreadyConnectedDiv;
  }
  set showAlreadyConnectedDiv(value: boolean) {
    this._showAlreadyConnectedDiv = value.toString() === 'true';
  }
  private _showAlreadyConnectedDiv = false;

  @Input()
  get showLogoutDiv(): boolean {
    if (this.isLogoutRoute) {
      return this.hasLogoutDiv;
    }
    return this._showLogoutDiv;
  }
  set showLogoutDiv(value: boolean) {
    this._showLogoutDiv = value.toString() === 'true';
  }
  private _showLogoutDiv = false;

  get showLoginDiv(): boolean {
    return !this.isLogoutRoute ? true : false;
  }

  readonly login = output<boolean>();

  public options?: AuthOptions & AnyMicrosoftOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public user: any;

  public visible = true;

  private isLogoutRoute?: boolean;

  constructor() {
    this.options = inject(AUTH_OPTIONS);
    this.visible = Object.getOwnPropertyNames(this.options).length !== 0;
  }

  public ngOnInit() {
    this.analyzeRoute();
    this.getName();
  }

  public onLogin() {
    this.auth.goToRedirectUrl();
    this.getName();
    this.login.emit(true);
  }

  public logout() {
    this.auth.logout();
    this.user = undefined;
    if (this.router) {
      if (this.options?.logoutRoute) {
        this.router.navigate([this.options?.logoutRoute]);
      } else if (this.options?.homeRoute) {
        this.router.navigate([this.options?.homeRoute]);
      }
    }
  }

  public home() {
    if (this.router && this.options?.homeRoute) {
      this.router.navigate([this.options?.homeRoute]);
    }
  }

  private getName() {
    const user = this.auth.user;
    if (user) {
      this.user = {
        name: user.firstName || user.sourceId
      };
    }
  }

  private analyzeRoute() {
    if (!this.router) {
      return;
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe((changeEvent: any) => {
        if (changeEvent.url) {
          const currentRoute = changeEvent.url;
          const logoutRoute = this.options?.logoutRoute;

          this.isLogoutRoute = currentRoute === logoutRoute;

          if (this.isLogoutRoute) {
            this.auth.logout();
          }
        }
      });
  }
}
