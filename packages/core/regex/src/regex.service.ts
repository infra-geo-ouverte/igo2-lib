import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { RegexOptions } from './regex.interface';

@Injectable({
  providedIn: 'root'
})
export class RegexService {
  protected options: RegexOptions;

  constructor(private config: ConfigService) {
    this.options = this.config.getConfig('regex');
  }

  getAll() {
    return this.options;
  }

  get(key) {
    if (this.options) {
      return this.options[key];
    }
    return;
  }
}
