import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { RegexOptions } from './regex.interface';

@Injectable({
  providedIn: 'root'
})
export class RegexService {
  private config = inject(ConfigService);

  protected options: RegexOptions;

  constructor() {
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
