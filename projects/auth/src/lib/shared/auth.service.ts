import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ConfigService } from '@igo2/core';
import { Base64 } from '@igo2/utils';

import { AuthOptions, User } from './auth.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authenticate$ = new BehaviorSubject<Boolean>(undefined);
  public redirectUrl: string;
  private options: AuthOptions;
  private anonymous = false;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private config: ConfigService,
    @Optional() private router: Router
  ) {
    this.options = this.config.getConfig('auth') || {};
    this.authenticate$.next(this.authenticated);
  }

  login(username: string, password: string): any {
    const myHeader = new HttpHeaders();
    myHeader.append('Content-Type', 'application/json');

    const body = JSON.stringify({
      username: username,
      password: this.encodePassword(password)
    });

    return this.http
      .post(`${this.options.url}/login`, body, { headers: myHeader })
      .pipe(
        tap((data: any) => {
          this.tokenService.set(data.token);
          this.authenticate$.next(true);
        })
      );
  }

  loginWithToken(token: string, type: string): any {
    const myHeader = new HttpHeaders();
    myHeader.append('Content-Type', 'application/json');

    const body = JSON.stringify({
      token: token,
      typeConnection: type
    });

    return this.http
      .post(`${this.options.url}/login`, body, { headers: myHeader })
      .pipe(
        tap((data: any) => {
          this.tokenService.set(data.token);
          this.authenticate$.next(true);
        })
      );
  }

  loginAnonymous() {
    this.anonymous = true;
    return of(true);
  }

  logout() {
    this.anonymous = false;
    this.tokenService.remove();
    this.authenticate$.next(false);
    return of(true);
  }

  isAuthenticated(): boolean {
    return !this.tokenService.isExpired();
  }

  getToken(): string {
    return this.tokenService.get();
  }

  decodeToken() {
    if (this.isAuthenticated()) {
      return this.tokenService.decode();
    }
    return false;
  }

  goToRedirectUrl() {
    if (!this.router) {
      return;
    }
    const redirectUrl = this.redirectUrl || this.router.url;

    if (redirectUrl === this.options.loginRoute) {
      this.router.navigateByUrl('/');
    } else if (redirectUrl) {
      this.router.navigateByUrl(redirectUrl);
    }
  }

  getUserInfo(): Observable<User> {
    const url = this.options.url + '/info';
    return this.http.get<User>(url);
  }

  updateUser(user: User): Observable<User> {
    const url = this.options.url;
    return this.http.patch<User>(url, JSON.stringify(user));
  }

  private encodePassword(password: string) {
    return Base64.encode(password);
  }

  get logged(): boolean {
    return this.authenticated || this.isAnonymous;
  }

  get isAnonymous(): boolean {
    return this.anonymous;
  }

  get authenticated(): boolean {
    return this.isAuthenticated();
  }
}
