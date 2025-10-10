import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { BaseStorage } from './storage';
import { StorageOptions } from './storage.interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService extends BaseStorage<StorageOptions> {
  constructor() {
    const config = inject(ConfigService);
    super(config);
  }
}
