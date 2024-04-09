import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { BaseStorage } from './storage';
import { StorageOptions } from './storage.interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService extends BaseStorage<StorageOptions> {
  constructor(private config: ConfigService) {
    super(config);
  }
}
