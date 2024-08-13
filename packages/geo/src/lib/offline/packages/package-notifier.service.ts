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

  notifyDoneInstalling(info: PackageInfo) {
    this.messageService.success(
      'igo.geo.package-manager.installation.message',
      'igo.geo.package-manager.installation.title',
      {
        timeOut: 5000
      },
      { title: info.title }
    );
  }

  notifyDoneDeleting(info: PackageInfo) {
    this.messageService.success(
      'igo.geo.package-manager.deletion.message',
      'igo.geo.package-manager.deletion.title',
      {
        timeOut: 5000
      },
      { title: info.title }
    );
  }

  notifyDownloadError(info: PackageInfo) {
    this.messageService.error(
      'igo.geo.package-manager.download-error.message',
      'igo.geo.package-manager.download-error.title',
      undefined,
      { title: info.title }
    );
  }

  notifyNotEnoughSpaceOnDevice(info: PackageInfo) {
    this.messageService.error(
      'igo.geo.package-manager.no-space-left-error.message',
      'igo.geo.package-manager.no-space-left-error.title',
      undefined,
      { title: info.title }
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
        'igo.geo.package-manager.expired.message',
        'igo.geo.package-manager.expired.title',
        {
          timeOut: 12000
        },
        { title }
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
        'igo.geo.package-manager.expiring-soon.message',
        'igo.geo.package-manager.expiring-soon.title',
        {
          timeOut: 7000
        },
        { title }
      );
    });
  }
}
