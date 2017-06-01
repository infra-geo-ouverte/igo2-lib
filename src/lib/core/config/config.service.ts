import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { ObjectUtils } from "../../utils";

import { ConfigOptions } from '.';

@Injectable()
export class ConfigService {

  private config: Object = {};

  constructor(private http: Http) {}

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
    if (!options.jsonPathFile) {
      return true;
    }
    return new Promise((resolve, reject) => {
      this.http.get(options.jsonPathFile).map(res => res.json()).catch((error: any): any => {
        console.log(`Configuration file ${options.jsonPathFile} could not be read`);
        resolve(true);
        return Observable.throw(error.json().error || 'Server error');
      }).subscribe((configResponse) => {
        Object.assign(this.config, configResponse);
        resolve(true);
      });
    });
  }
}
