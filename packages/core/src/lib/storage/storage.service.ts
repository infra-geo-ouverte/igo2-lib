import { Injectable } from '@angular/core';

import { ConfigService } from '../config/config.service';
import { StorageOptions } from './storage.interface';
import { BaseStorage } from './storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService extends BaseStorage<StorageOptions> {

  constructor(private config: ConfigService) {
    super(config);
  }
}
