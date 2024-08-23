import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ObjectUtils } from '@igo2/utils';

import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  private config: T | null;
  private httpClient: HttpClient;
  private configDeprecated = new Map(Object.entries(CONFIG_DEPRECATED));

  private _isLoaded$ = new BehaviorSubject<boolean>(null);
  isLoaded$ = this._isLoaded$.asObservable();

  constructor(handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }

  /**
   * Use to get the all config file (merge from environnement.ts and config.json)
   */
  public getConfigs(): any {
    Array.from(this.configDeprecated.keys()).map((deprecatedKey) => {
      const deprecatedValue = ObjectUtils.resolve(this.config, deprecatedKey);
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
    let value = ObjectUtils.resolve(this.config, key);

    const isDeprecated = this.configDeprecated.get(key);
    if (isDeprecated && value !== undefined) {
      this.handleDeprecatedConfig(key);
    } else if (value === undefined) {
      value = this.handleDeprecationPossibility(key);
    }

    return value ?? defaultValue;
  }

  private handleDeprecatedConfig(key: string): void {
    const options = this.configDeprecated.get(key);

    let message = `This config (${key}) is deprecated and will be removed shortly`;
    if (options.alternativeKey) {
      message += ` You should use this key (${options.alternativeKey}) as an alternate solution`;
    }

    const currentDate = new Date();
    currentDate >= options.mayBeRemoveIn
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
  public load(options: ConfigOptions<T>) {
    const baseConfig = options.default;
    if (!options.path) {
      this.config = baseConfig;
      this._isLoaded$.next(true);
      return true;
    }

    return new Promise((resolve, _reject) => {
      this.httpClient
        .get(options.path)
        .pipe(
          catchError((error: any): any => {
            console.log(`Configuration file ${options.path} could not be read`);
            this._isLoaded$.next(false);
            resolve(true);
            return throwError(error.error || 'Server error');
          })
        )
        .subscribe((configResponse: object) => {
          this.config = ObjectUtils.mergeDeep(
            ObjectUtils.mergeDeep({ version }, baseConfig),
            configResponse
          );
          this._isLoaded$.next(true);
          resolve(true);
        });
    });
  }
}
