import { Injectable, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { ConfigService, RequestService } from '../../core';
import { Base64 } from '../../utils';

import { AuthOptions, User } from './auth.interface';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  public authenticate$ = new BehaviorSubject<Boolean>(undefined);
  public redirectUrl: string;
  private options: AuthOptions;
  private anonymous: boolean = false;

  constructor(private http: HttpClient,
              private tokenService: TokenService,
              private requestService: RequestService,
              private config: ConfigService,
              @Optional() private router: Router) {

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

    return this.http.post(`${this.options.url}/login`, body, { headers: myHeader })
      .map((data: any) => {
        this.tokenService.set(data.token);
        this.authenticate$.next(true);
      })
      .catch((err: any) => {
        const message = err.json().message;
        return Observable.throw([{text: message}]);
      });
  }

  loginWithToken(token: string, type: string): any {
    const myHeader = new HttpHeaders();
    myHeader.append('Content-Type', 'application/json');

    const body = JSON.stringify({
      token: token,
      typeConnexion: type
    });

    return this.http.post(`${this.options.url}/login`, body, { headers: myHeader })
      .map((data: any) => {
        this.tokenService.set(data.token);
        this.authenticate$.next(true);
      })
      .catch((err: any) => {
        const message = err.json().message;
        return Observable.throw([{text: message}]);
      });
  }

  loginAnonymous() {
    this.anonymous = true;
    return Observable.of(true);
  }

  logout() {
    this.anonymous = false;
    this.tokenService.remove();
    this.authenticate$.next(false);
    return Observable.of(true);
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
    if (!this.router) { return; }
    const redirectUrl = this.redirectUrl || this.router.url;

    if (redirectUrl === this.options.loginRoute) {
      this.router.navigateByUrl('/');
    } else if (redirectUrl) {
      this.router.navigateByUrl(redirectUrl);
    }
  }

  getUserInfo(): Observable<User> {
    const url = this.options.url + '/info';
    const request = this.http.get<User>(url);
    return this.requestService.register(request, 'Get user info error');
  }

  updateUser(user: User): Observable<User> {
    const url = this.options.url;
    const request = this.http.patch<User>(url, JSON.stringify(user));
    return this.requestService.register(request, 'Update user error');
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
