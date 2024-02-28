import { Injectable } from '@angular/core';

import { MessageService } from '@igo2/core';
import { PackageStoreService } from '@igo2/geo';

import { N_DAY_PACKAGE_SOON_TO_EXPIRE } from './constants';

@Injectable({
  providedIn: 'root'
})
export class PackageExpirationNotifierService {
  constructor(
    private packageStore: PackageStoreService,
    private messageService: MessageService
  ) {}

  notifyExpired() {
    const now = new Date();
    const expired = this.packageStore.devicePackages.filter(
      ({ expiration }) => {
        return expiration <= now;
      }
    );

    expired.forEach(({ title }) => {
      this.messageService.error(
        `Please delete the package ${title} as soon as possible.`,
        'A Package Has Expired',
        {
          timeOut: 10000
        }
      );
    });
  }

  notifySoonToExpire() {
    console.log('soon to expire');
    const soonToExpireDate = new Date();
    soonToExpireDate.setDate(
      soonToExpireDate.getDate() + N_DAY_PACKAGE_SOON_TO_EXPIRE
    );

    const soon = this.packageStore.devicePackages.filter(
      ({ expiration }) => expiration <= soonToExpireDate
    );
    soon.forEach(({ title }) => {
      this.messageService.alert(
        `Please update the package ${title} as soon as possible.`,
        'A Package is Expiring Soon',
        {
          timeOut: 5000
        }
      );
    });
  }
}
