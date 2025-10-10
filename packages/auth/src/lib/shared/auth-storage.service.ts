import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { BaseStorage, StorageScope } from '@igo2/core/storage';

import { AuthStorageOptions } from './auth-storage.interface';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService extends BaseStorage<AuthStorageOptions> {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);

  constructor() {
    const config = inject(ConfigService);

    super(config);

    this.authService.authenticate$.subscribe((isAuthenticated) => {
      if (isAuthenticated && this.options.url) {
        this.http
          .get(this.options.url)
          .subscribe((userIgo: { preference: object }) => {
            if (userIgo && userIgo.preference) {
              for (const key of Object.keys(userIgo.preference)) {
                const value = userIgo.preference[key];
                super.set(key, value);
              }
            }
          });
      }
    });
  }

  set(
    key: string,
    value: string | object | boolean | number,
    scope: StorageScope = StorageScope.LOCAL
  ) {
    if (
      scope === StorageScope.LOCAL &&
      this.authService.authenticated &&
      this.options.url
    ) {
      const preference = {};
      preference[key] = value;
      this.http.patch(this.options.url, { preference }).subscribe();
    }
    super.set(key, value, scope);
  }

  remove(key: string, scope: StorageScope = StorageScope.LOCAL) {
    if (
      scope === StorageScope.LOCAL &&
      this.authService.authenticated &&
      this.options.url
    ) {
      const preference = {};
      preference[key] = undefined;
      this.http.patch(this.options.url, { preference }).subscribe();
    }
    super.remove(key, scope);
  }

  clear(scope: StorageScope = StorageScope.LOCAL) {
    if (
      scope === StorageScope.LOCAL &&
      this.authService.authenticated &&
      this.options.url
    ) {
      this.http
        .patch(
          this.options.url,
          { preference: {} },
          {
            params: {
              mergePreference: 'false'
            }
          }
        )
        .subscribe();
    }

    let token: string;
    if (scope === StorageScope.LOCAL) {
      token = this.tokenService.get();
    }

    super.clear(scope);

    if (token) {
      this.tokenService.set(token);
    }

    if (
      scope === StorageScope.LOCAL &&
      this.authService.authenticated &&
      this.options.url
    ) {
      this.http
        .get(this.options.url)
        .subscribe((userIgo: { preference: object }) => {
          if (userIgo && userIgo.preference) {
            for (const key of Object.keys(userIgo.preference)) {
              const value = userIgo.preference[key];
              super.set(key, value);
            }
          }
        });
    }
  }
}
