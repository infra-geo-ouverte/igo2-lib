import { Injectable, inject } from '@angular/core';

import { jwtDecode } from 'jwt-decode';

import { AUTH_OPTIONS } from './auth.interface';
import { IgoJwtPayload } from './token.interface';

export type TokenStatus = 'missing' | 'expired' | 'valid' | 'near-expiry';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private tokenKey = inject(AUTH_OPTIONS).tokenKey;

  set(token: string) {
    if (!this.tokenKey) {
      return;
    }

    localStorage.setItem(this.tokenKey, token);
  }

  remove() {
    if (!this.tokenKey) {
      return;
    }

    localStorage.removeItem(this.tokenKey);
  }

  get(): string | undefined {
    if (!this.tokenKey) {
      return;
    }

    return localStorage.getItem(this.tokenKey) ?? undefined;
  }

  decode(): IgoJwtPayload | undefined {
    const token = this.get();
    if (!token) {
      return;
    }
    return jwtDecode(token) satisfies IgoJwtPayload;
  }

  getStatus(nearExpirySeconds = 1800): TokenStatus {
    const jwt = this.decode();
    if (!jwt) {
      return 'missing';
    }

    const currentTime = Date.now() / 1000;
    if (jwt.exp === undefined || currentTime >= jwt.exp) {
      return 'expired';
    }

    return currentTime > jwt.exp - nearExpirySeconds ? 'near-expiry' : 'valid';
  }

  isExpired(): boolean {
    const status = this.getStatus();
    return status === 'missing' || status === 'expired';
  }
}
