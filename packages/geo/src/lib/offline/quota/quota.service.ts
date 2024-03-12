import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';

import { Observable, forkJoin, from, map, of } from 'rxjs';

import { PackageManagerService } from '../packages/package-manager.service';
import { DEFAULT_QUOTA_SIZE } from './constants';
import { Quota } from './quota.interface';

@Injectable({
  providedIn: 'root'
})
export class QuotaService {
  constructor(
    private config: ConfigService,
    private packageService: PackageManagerService
  ) {}

  getQuota(): Observable<Quota> {
    return forkJoin({
      size: this.getSize(),
      usage: this.getUsage()
    });
  }

  private getUsage(): Observable<number> {
    if (navigator.storage) {
      return of(this.getTotalPackageSize());
    }

    return from(navigator.storage.estimate()).pipe(
      map(({ usage }) =>
        usage === undefined ? this.getTotalPackageSize() : usage
      )
    );
  }

  private getTotalPackageSize() {
    return this.packageService.downloaded
      .map(({ size }) => size)
      .reduce((prev, current) => prev + current);
  }

  private getSize(): Observable<number> {
    const configSize = this.config.getConfig('offline.quota.size');
    if (configSize !== undefined) {
      return of(configSize);
    }

    if (!navigator.storage) {
      return of(DEFAULT_QUOTA_SIZE);
    }

    return from(navigator.storage.estimate()).pipe(
      map(({ quota }) => (quota === undefined ? DEFAULT_QUOTA_SIZE : quota))
    );
  }
}
