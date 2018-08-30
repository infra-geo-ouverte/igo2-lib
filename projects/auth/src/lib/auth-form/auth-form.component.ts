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
  get alreadyConnectedDiv(): boolean {
    return this._alreadyConnectedDiv;
  }
  set alreadyConnectedDiv(value: boolean) {
    this._alreadyConnectedDiv = value.toString() === 'true';
  }
  private _alreadyConnectedDiv = false;

  @Input()
  get backgroundDisable(): boolean {
    return this._backgroundDisable;
  }
  set backgroundDisable(value: boolean) {
    this._backgroundDisable = value.toString() === 'true';
  }
  private _backgroundDisable = true;

  public options: AuthOptions;
  public user;

  public visible = true;
  public logoutDiv = false;

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

          const isLogoutRoute: boolean = currentRoute === logoutRoute;
          const isLoginRoute: boolean = currentRoute === loginRoute;

          this.backgroundDisable = true;
          this.logoutDiv = false;

          if (isLogoutRoute) {
            this.auth.logout();
            this.backgroundDisable = false;
            this.logoutDiv = true;
          } else if (isLoginRoute) {
            this.backgroundDisable = false;
            this.alreadyConnectedDiv = true;
          }
        }
      });
  }
}
