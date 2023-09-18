import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ObjectUtils } from '@igo2/utils';

import { BaseConfigOptions, ConfigOptions } from './config.interface';
import { version } from './version';

@Injectable({
  providedIn: 'root'
})
export class ConfigService<T = { [key: string]: any }> {
  private config: BaseConfigOptions<T> | null;
  private httpClient: HttpClient;

  constructor(handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }

  /**
   * Use to get the data found in config file
   */
  public getConfig(key: string): any {
    return ObjectUtils.resolve(this.config, key);
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
