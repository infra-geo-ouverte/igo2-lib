import { Injectable, inject } from '@angular/core';

import { jwtDecode } from 'jwt-decode';

import { AUTH_OPTIONS, AuthOptions } from './auth.interface';
import { IgoJwtPayload } from './token.interface';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private options?: AuthOptions;
  private tokenKey: string;

  constructor() {
    this.options = inject(AUTH_OPTIONS);
    this.tokenKey = this.options?.tokenKey ?? '';
  }

  set(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  remove() {
    localStorage.removeItem(this.tokenKey);
  }

  get(): string | undefined {
    return localStorage.getItem(this.tokenKey) ?? undefined;
  }

  decode(): IgoJwtPayload | undefined {
    const token = this.get();
    if (!token) {
      return;
    }
    return jwtDecode(token) satisfies IgoJwtPayload;
  }

  isExpired() {
    const jwt = this.decode();
    const currentTime = new Date().getTime() / 1000;
    if (jwt?.exp && currentTime < jwt.exp) {
      return false;
    }
    return true;
  }
}
