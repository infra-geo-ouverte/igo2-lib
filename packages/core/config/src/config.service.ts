import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ObjectUtils } from '@igo2/utils';

import { BehaviorSubject, throwError } from 'rxjs';

import {
  ALTERNATE_CONFIG_FROM_DEPRECATION,
  CONFIG_DEPRECATED
} from './config-deprecated';
import { ConfigOptions } from './config.interface';
import { version } from './version';

@Injectable({
  providedIn: 'root'
})
export class ConfigService<T extends object = Record<string, any>> {
  private config!: T | undefined;
  private httpClient: HttpClient;
  private configDeprecated = new Map(Object.entries(CONFIG_DEPRECATED));

  private _isLoaded$ = new BehaviorSubject(false);
  isLoaded$ = this._isLoaded$.asObservable();

  constructor() {
    const handler = inject(HttpBackend);

    this.httpClient = new HttpClient(handler);
  }

  /**
   * Use to get the all config file (merge from environnement.ts and config.json)
   */
  public getConfigs(): any {
    Array.from(this.configDeprecated.keys()).map((deprecatedKey) => {
      const deprecatedValue = ObjectUtils.resolve(
        this.config ?? {},
        deprecatedKey
      );
      if (deprecatedValue !== undefined) {
        this.handleDeprecatedConfig(deprecatedKey);
      }
    });
    return this.config;
  }

  /**
   * Use to get the data found in config file
   */
  public getConfig<T = any>(key: string, defaultValue?: unknown): T {
    let value = ObjectUtils.resolve(this.config ?? {}, key);

    const isDeprecated = this.configDeprecated.get(key);
    if (isDeprecated && value !== undefined) {
      this.handleDeprecatedConfig(key);
    } else if (value === undefined) {
      value = this.handleDeprecationPossibility(key);
    }

    return (value ?? defaultValue) as T;
  }

  private handleDeprecatedConfig(key: string): void {
    const options = this.configDeprecated.get(key);

    let message = `This config (${key}) is deprecated and will be removed shortly`;
    if (options?.alternativeKey) {
      message += ` You should use this key (${options.alternativeKey}) as an alternate solution`;
    }

    const currentDate = new Date();
    options?.mayBeRemoveIn && currentDate >= options.mayBeRemoveIn
      ? console.error(message)
      : console.warn(message);
  }

  private handleDeprecationPossibility(key: string): any {
    const options = ALTERNATE_CONFIG_FROM_DEPRECATION.get(key);
    if (!options) {
      return;
    }

    return this.getConfig(options.deprecatedKey);
  }

  /**
   * This method loads "[path]" to get all config's variables
   */
  public load(options: ConfigOptions<T>): void | Promise<unknown> {
    const baseConfig = options.default;
    const path = options.path;
    if (!path) {
      this.config = baseConfig;
      this._isLoaded$.next(true);
      return;
    }

    return new Promise((resolve) => {
      this.httpClient.get<Record<string, unknown>>(path).subscribe({
        next: (configResponse) => {
          this.config = ObjectUtils.mergeDeep(
            ObjectUtils.mergeDeep({ version }, baseConfig ?? {}),
            configResponse
          ) as T;
          this._isLoaded$.next(true);
          resolve(true);
        },
        error: (error) => {
          console.log(`Configuration file ${path} could not be read`);
          this._isLoaded$.next(false);
          resolve(true);
          return throwError(() => error.error || 'Server error');
        }
      });
    });
  }
}
