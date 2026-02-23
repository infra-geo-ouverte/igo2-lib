import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { BaseStorage, StorageScope } from '@igo2/core/storage';

import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { AuthStorageOptions } from './auth-storage.interface';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

const DEBOUNCE_TIME = 3000; // 3 seconds;

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService
  extends BaseStorage<AuthStorageOptions>
  implements OnDestroy
{
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);

  private preferencesChanged$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private pendingPreferences: Record<string, unknown> = {};
  private serverPreferences: Record<string, unknown> = {};

  constructor() {
    const config = inject(ConfigService);

    super(config);

    this.authService.authenticate$.subscribe((isAuthenticated) => {
      if (isAuthenticated && this.options.url) {
        this.getUser();
      }
    });

    this.preferencesChanged$
      .pipe(
        debounceTime(DEBOUNCE_TIME), // Wait for more changes to accumulate
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.syncPreferences();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.preferencesChanged$.complete();
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
      this.pendingPreferences[key] = value;
      this.preferencesChanged$.next();
    }
    super.set(key, value, scope);
  }

  remove(key: string, scope: StorageScope = StorageScope.LOCAL) {
    if (
      scope === StorageScope.LOCAL &&
      this.authService.authenticated &&
      this.options.url
    ) {
      this.pendingPreferences[key] = undefined;
      this.preferencesChanged$.next();
    }
    super.remove(key, scope);
  }

  clear(scope: StorageScope = StorageScope.LOCAL) {
    if (
      scope === StorageScope.LOCAL &&
      this.authService.authenticated &&
      this.options.url
    ) {
      this.pendingPreferences = {};
      this.preferencesChanged$.next();
    }

    let token: string;
    if (scope === StorageScope.LOCAL) {
      token = this.tokenService.get();
    }

    super.clear(scope);

    if (token) {
      this.tokenService.set(token);
    }
  }

  private getUser() {
    this.http
      .get(this.options.url)
      .subscribe((userIgo: { preference: object }) => {
        if (userIgo && userIgo.preference) {
          this.serverPreferences = { ...userIgo.preference };
          for (const key of Object.keys(userIgo.preference)) {
            const value = userIgo.preference[key];
            super.set(key, value);
          }
        }
      });
  }

  private syncPreferences() {
    if (Object.keys(this.pendingPreferences).length === 0) {
      return;
    }

    // Filter out preferences that haven't actually changed
    const changedPreferences: Record<string, unknown> = {};
    for (const key of Object.keys(this.pendingPreferences)) {
      const newValue = this.pendingPreferences[key];
      const oldValue = this.serverPreferences[key];

      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        changedPreferences[key] = newValue;
      }
    }

    this.pendingPreferences = {};

    if (Object.keys(changedPreferences).length > 0) {
      this.http
        .patch(this.options.url, { preference: changedPreferences })
        .subscribe(() => {
          Object.assign(this.serverPreferences, changedPreferences);
        });
    }
  }
}
