import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ObjectUtils } from '@igo2/utils';

import { ConfigOptions } from './config.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: Object = {};

  constructor(private injector: Injector) {}

  /**
   * Use to get the data found in config file
   */
  public getConfig(key: string): any {
    return ObjectUtils.resolve(this.config, key);
  }

  /**
   * This method loads "[path]" to get all config's variables
   */
  public load(options: ConfigOptions) {
    if (options.default) {
      this.config = options.default;
    }

    if (!options.path) {
      return true;
    }

    const http = this.injector.get(HttpClient);

    return new Promise((resolve, reject) => {
      http
        .get(options.path)
        .pipe(
          catchError(
            (error: any): any => {
              console.log(
                `Configuration file ${options.path} could not be read`
              );
              resolve(true);
              return throwError(error.error || 'Server error');
            }
          )
        )
        .subscribe(configResponse => {
          Object.assign(this.config, configResponse);
          resolve(true);
        });
    });
  }
}
