import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NavigationStart, Router } from '@angular/router';

import { AuthOptions, AuthService } from '@igo2/auth';
import { AuthFacebookComponent } from '@igo2/auth/facebook';
import { AuthGoogleComponent } from '@igo2/auth/google';
import { AuthInternComponent } from '@igo2/auth/internal';
import {
  AuthMicrosoftComponent,
  AuthMicrosoftb2cComponent
} from '@igo2/auth/microsoft';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

import { filter } from 'rxjs/operators';

import { AuthFormOptions } from '../shared';

@Component({
  selector: 'igo-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    AuthGoogleComponent,
    AuthMicrosoftComponent,
    AuthMicrosoftb2cComponent,
    AuthFacebookComponent,
    AuthInternComponent,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class AuthFormComponent implements OnInit {
  auth = inject(AuthService);
  private config = inject(ConfigService);
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
    if (!this.isLogoutRoute) {
      return true;
    }
  }

  @Output() login: EventEmitter<boolean> = new EventEmitter<boolean>();

  public options?: AuthOptions & AuthFormOptions;
  public user;

  public visible = true;

  private isLogoutRoute: boolean;

  constructor() {
    this.options = this.config.getConfig('auth');
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
    this.auth.logout().subscribe(() => {
      this.user = undefined;
      if (this.router) {
        if (this.options?.logoutRoute) {
          this.router.navigate([this.options?.logoutRoute]);
        } else if (this.options?.homeRoute) {
          this.router.navigate([this.options?.homeRoute]);
        }
      }
    });
  }

  public home() {
    if (this.router && this.options?.homeRoute) {
      this.router.navigate([this.options?.homeRoute]);
    }
  }

  private getName() {
    const tokenDecoded = this.auth.decodeToken();
    if (tokenDecoded) {
      this.user = {
        name: tokenDecoded.user.firstName || tokenDecoded.user.sourceId
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
