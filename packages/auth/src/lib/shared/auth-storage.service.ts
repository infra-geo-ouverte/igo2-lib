import { Injectable, OnDestroy, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { BaseStorage, StorageScope } from '@igo2/core/storage';

import { EMPTY, Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

import { AuthStorageOptions } from './auth-storage.interface';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { UserService } from './user/user.service';

const DEBOUNCE_TIME = 3000; // 3 seconds;

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService
  extends BaseStorage<AuthStorageOptions>
  implements OnDestroy
{
  private authService = inject(AuthService);
  private userService = inject(UserService, {
    optional: true
  });
  private tokenService = inject(TokenService);

  private preferencesChanged$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private pendingPreferences: Record<string, unknown> = {};
  private serverPreferences: Record<string, unknown> = {};

  constructor() {
    const config = inject(ConfigService);
    super(config);

    this.authService.authenticate$
      .pipe(
        switchMap((isAuthenticated) => {
          if (isAuthenticated && this.userService) {
            return this.userService.user$;
          }
          return EMPTY;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        if (!user?.preference) {
          return;
        }

        this.serverPreferences = { ...user.preference };
        for (const key of Object.keys(user.preference)) {
          const value = user.preference[key];
          super.set(key, value);
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
    if (scope === StorageScope.LOCAL && this.authService.authenticated) {
      this.pendingPreferences[key] = value;
      this.preferencesChanged$.next();
    }
    super.set(key, value, scope);
  }

  remove(key: string, scope: StorageScope = StorageScope.LOCAL) {
    if (scope === StorageScope.LOCAL && this.authService.authenticated) {
      this.pendingPreferences[key] = undefined;
      this.preferencesChanged$.next();
    }
    super.remove(key, scope);
  }

  clear(scope: StorageScope = StorageScope.LOCAL) {
    if (scope === StorageScope.LOCAL && this.authService.authenticated) {
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
      this.userService?.updatePreference(changedPreferences).subscribe(() => {
        Object.assign(this.serverPreferences, changedPreferences);
      });
    }
  }
}
