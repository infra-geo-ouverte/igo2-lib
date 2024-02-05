import { Injectable, Injector } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { jwtDecode } from 'jwt-decode';

import { AuthOptions } from './auth.interface';
import { IgoJwtPayload } from './token.interface';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private options?: AuthOptions;
  private tokenKey: string;

  constructor(private injector: Injector) {
    const config = this.injector.get<ConfigService>(ConfigService);
    this.options = config.getConfig('auth');
    this.tokenKey = this.options?.tokenKey;
  }

  set(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  remove() {
    localStorage.removeItem(this.tokenKey);
  }

  get(): string {
    return localStorage.getItem(this.tokenKey);
  }

  decode(): IgoJwtPayload | null {
    const token = this.get();
    if (!token) {
      return;
    }
    return jwtDecode(token) satisfies IgoJwtPayload;
  }

  isExpired() {
    const jwt = this.decode();
    const currentTime = new Date().getTime() / 1000;
    if (jwt && currentTime < jwt.exp) {
      return false;
    }
    return true;
  }
}
