import { Injectable } from '@angular/core';

import { MessageService } from '@igo2/core/message';

import { N_DAY_PACKAGE_SOON_TO_EXPIRE } from './constants';
import { PackageInfo } from './package-info.interface';
import { PackageStoreService } from './package-store.service';

@Injectable({
  providedIn: 'root'
})
export class PackageNotifierService {
  constructor(
    private packageStore: PackageStoreService,
    private messageService: MessageService
  ) {}

  notifyDoneDownloading(info: PackageInfo) {
    this.messageService.success(
      `Your package ${info.title} has been installed.`,
      'Package Installation Done',
      {
        timeOut: 5000
      }
    );
  }

  notifyDoneDeleting(info: PackageInfo) {
    this.messageService.success(
      `Your package ${info.title} has been deleted.`,
      'Package Deletion Done',
      {
        timeOut: 5000
      }
    );
  }

  notifyDownloadError(info: PackageInfo) {
    this.messageService.error(
      `An error occured when downloading the package ${info.title}.`,
      'Package Download Error'
    );
  }

  notifyNotEnoughSpaceOnDevice(info: PackageInfo) {
    this.messageService.error(
      `Not enough space left on device for ${info.title} package.`,
      'Package Download Error'
    );
  }

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
    const now = new Date();
    const soonToExpireDate = new Date(
      now.getTime() + N_DAY_PACKAGE_SOON_TO_EXPIRE * 24 * 60 * 60 * 1000
    );

    const soon = this.packageStore.devicePackages.filter(
      ({ expiration }) => expiration <= soonToExpireDate && expiration > now
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
