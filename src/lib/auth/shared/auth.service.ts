import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { JwtHelper } from 'angular2-jwt';

import { ConfigService } from '../../core';
import { Base64 } from '../../utils';

import { AuthOptions } from '../shared';

@Injectable()
export class AuthService {
  private options: AuthOptions;
  private token: string;

  constructor(private http: Http, private config: ConfigService) {
    this.options = this.config.getConfig('auth.intern') || {};
    this.token = localStorage.getItem(this.options.tokenKey);
  }

  login(username: string, password: string): any {
    let myHeader = new Headers();
    myHeader.append('Content-Type', 'application/json');

    let body = JSON.stringify({
      username: username,
      password: this.encodePassword(password)
    });

    return this.http.post(`${this.options.url}/login`, body, { headers: myHeader })
      .map((res: any) => {
        let data = res.json();
        this.token = data.token;
        localStorage.setItem(this.options.tokenKey, this.token);
      });
  }

  loginWithToken(token: string, type: string): any {
    let myHeader = new Headers();
    myHeader.append('Content-Type', 'application/json');

    let body = JSON.stringify({
      token: token,
      typeConnexion: type
    });

    return this.http.post(`${this.options.url}/login`, body, { headers: myHeader })
      .map((res: any) => {
        let data = res.json();
        this.token = data.token;
        localStorage.setItem(this.options.tokenKey, this.token);
      });
  }

  logout() {
    this.token = undefined;
    localStorage.removeItem(this.options.tokenKey);
    return Observable.of(true);
  }

  isAuthenticated(): boolean {
    let token = localStorage.getItem(this.options.tokenKey);
    let jwtHelper = new JwtHelper();
    return token && !jwtHelper.isTokenExpired(token);
  }

  getToken(): string {
    return localStorage.getItem(this.options.tokenKey);
  }

  decodeToken() {
    if (this.isAuthenticated()) {
      let token = localStorage.getItem(this.options.tokenKey);
      let jwtHelper = new JwtHelper();
      return jwtHelper.decodeToken(token);
    }
    return false;
  }

  private encodePassword(password: string) {
    return Base64.encode(password);
  }

  get logged() {
    return this.isAuthenticated();
  }
}
