import { Injectable } from '@angular/core';

import { StorageService } from '@igo2/core/storage';

/**
 * Service that holds the state of storage service
 */
@Injectable({
  providedIn: 'root'
})
export class StorageState {
  get storageService(): StorageService {
    return this.igoStorageService;
  }

  constructor(private igoStorageService: StorageService) {}
}
