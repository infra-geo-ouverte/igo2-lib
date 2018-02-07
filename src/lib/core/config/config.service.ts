import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';

import { ObjectUtils } from '../../utils';

import { ConfigOptions } from '.';

@Injectable()
export class ConfigService {

  private config: Object = {};

  constructor(private http: HttpClient) {}

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
    return new Promise((resolve, reject) => {
      this.http.get(options.path).pipe(
        catchError((error: any): any => {
          console.log(`Configuration file ${options.path} could not be read`);
          resolve(true);
          return Observable.throw(error.error || 'Server error');
        })
      ).subscribe((configResponse) => {
        Object.assign(this.config, configResponse);
        resolve(true);
      });
    });
  }
}
