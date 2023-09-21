import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ObjectUtils } from '@igo2/utils';

import { ConfigOptions, DeprecatedConfig } from './config.interface';
import { version } from './version';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: object = {};
  private httpClient: HttpClient;
  private deprecatedConfigs: DeprecatedConfig[] = [
    {
      key: 'showMenuButton',
      deprecationDate: new Date('2024-06-06'),
      alternativeKey: 'menu.button.show'
    },
    {
      key: 'menuButtonReverseColor',
      deprecationDate: new Date('2024-06-06'),
      alternativeKey: 'menu.button.useThemeColor'
    }
  ];

  constructor(handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }

  /**
   * Use to get the data found in config file
   */
  public getConfig(key: string): any {
    const currentDate = new Date();
    const deprecatedConfig = this.deprecatedConfigs.find(
      (dc) => dc.key === key
    );
    if (deprecatedConfig) {
      let deprecationMessage = `This config (${deprecatedConfig.key}) is not effective anymore (or shortly). Remove the ${deprecatedConfig.key} property.`;
      if (deprecatedConfig.alternativeKey) {
        deprecationMessage += ` You should use this key (${deprecatedConfig.alternativeKey}) as an alternate solution`;
      }
      currentDate >= deprecatedConfig.deprecationDate
        ? console.error(deprecationMessage)
        : console.warn(deprecationMessage);
    }
    return ObjectUtils.resolve(this.config, key);
  }

  /**
   * This method loads "[path]" to get all config's variables
   */
  public load(options: ConfigOptions) {
    const baseConfig = options.default || {};
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
