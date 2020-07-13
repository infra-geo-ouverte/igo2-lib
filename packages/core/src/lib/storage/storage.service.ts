import { Injectable } from '@angular/core';

import { ConfigService } from '../config/config.service';
import { StorageScope, StorageOptions } from './storage.interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  protected options: StorageOptions;

  constructor(private config: ConfigService) {
    this.options = this.config.getConfig('storage') || { key: 'igo' };
  }
  /**
   * Use to get the data found in storage file
   */
  get(key: string, scope?: StorageScope): string | object | boolean | number {
    let value: any;

    if (!scope || scope === StorageScope.SESSION) {
      value = sessionStorage.getItem(`${this.options.key}.${key}`);
    }

    if (scope === StorageScope.LOCAL || (!value && !scope)) {
      value = localStorage.getItem(`${this.options.key}.${key}`);
    }

    if (value) {
      try {
        value = JSON.parse(value);
      } catch {
        value = value;
      }
    }

    return value;
  }

  set(
    key: string,
    value: string | object | boolean | number,
    scope: StorageScope = StorageScope.LOCAL
  ) {
    if (scope === StorageScope.SESSION) {
      sessionStorage.setItem(
        `${this.options.key}.${key}`,
        JSON.stringify(value)
      );
    } else {
      localStorage.setItem(`${this.options.key}.${key}`, JSON.stringify(value));
    }
  }

  remove(key: string, scope: StorageScope = StorageScope.LOCAL) {
    if (scope === StorageScope.SESSION) {
      sessionStorage.removeItem(`${this.options.key}.${key}`);
    } else {
      localStorage.removeItem(`${this.options.key}.${key}`);
    }
  }
}
