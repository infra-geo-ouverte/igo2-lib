import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ObjectUtils } from '@igo2/utils';

import { BaseConfigOptions, ConfigOptions } from './config.interface';
import { version } from './version';
import {
  ALTERNATE_CONFIG_FROM_DEPRECATION,
  CONFIG_DEPRECATED
} from './config-deprecated';

@Injectable({
  providedIn: 'root'
})
export class ConfigService<T = { [key: string]: any }> {
  private config: BaseConfigOptions<T> | null;
  private httpClient: HttpClient;
  private configDeprecated = new Map(Object.entries(CONFIG_DEPRECATED));

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
  public getConfig<T = any>(key: string): T {
    const value = ObjectUtils.resolve(this.config, key);

    const isDeprecated = this.configDeprecated.get(key);
    if (isDeprecated && value !== undefined) {
      this.handleDeprecatedConfig(key);
    } else if (value === undefined) {
      return this.handleDeprecationPossibility(key);
    }

    return value;
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
      return true;
    }

    return new Promise((resolve, _reject) => {
      this.httpClient
        .get(options.path)
        .pipe(
          catchError((error: any): any => {
            console.log(`Configuration file ${options.path} could not be read`);
            resolve(true);
            return throwError(error.error || 'Server error');
          })
        )
        .subscribe((configResponse: object) => {
          this.config = ObjectUtils.mergeDeep(
            ObjectUtils.mergeDeep({ version }, baseConfig),
            configResponse
          );
          resolve(true);
        });
    });
  }
}
