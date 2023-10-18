import { Injectable } from '@angular/core';

import { ConfigService } from '../config/config.service';
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
