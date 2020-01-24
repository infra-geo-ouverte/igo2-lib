import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
  Optional
} from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

import { ConfigService } from '@igo2/core';
import { AuthOptions } from '../shared/auth.interface';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'igo-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AuthFormComponent implements OnInit {
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

  public options: AuthOptions;
  public user;

  public visible = true;

  private isLoginRoute: boolean;
  private isLogoutRoute: boolean;

  constructor(
    public auth: AuthService,
    private config: ConfigService,
    @Optional() private router: Router
  ) {
    this.options = this.config.getConfig('auth') || {};
    this.visible = Object.getOwnPropertyNames(this.options).length !== 0;
  }

  public ngOnInit() {
    this.analyzeRoute();
    this.getName();
  }

  public login() {
    this.auth.goToRedirectUrl();
    this.getName();
  }

  public logout() {
    this.auth.logout().subscribe(() => {
      this.user = undefined;
      if (this.router) {
        if (this.options.logoutRoute) {
          this.router.navigate([this.options.logoutRoute]);
        } else if (this.options.homeRoute) {
          this.router.navigate([this.options.homeRoute]);
        }
      }
    });
  }

  public home() {
    if (this.router && this.options.homeRoute) {
      this.router.navigate([this.options.homeRoute]);
    }
  }

  private getName() {
    if (this.auth.decodeToken()) {
      const tokenDecoded = this.auth.decodeToken();
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
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((changeEvent: any) => {
        if (changeEvent.url) {
          const currentRoute = changeEvent.url;
          const logoutRoute = this.options.logoutRoute;
          const loginRoute = this.options.loginRoute;

          this.isLogoutRoute = currentRoute === logoutRoute;
          this.isLoginRoute = currentRoute === loginRoute;

          if (this.isLogoutRoute) {
            this.auth.logout();
          }
        }
      });
  }
}
