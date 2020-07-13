import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { StorageService, StorageScope, ConfigService } from '@igo2/core';
import { AuthService } from './auth.service';
import { AuthStorageOptions } from './storage.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService extends StorageService {
  protected options: AuthStorageOptions;

  constructor(
    config: ConfigService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    super(config);

    this.authService.authenticate$.subscribe(isAuthenticated => {
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
    return super.remove(key, scope);
  }
}
