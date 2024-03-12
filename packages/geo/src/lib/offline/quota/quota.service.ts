import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';

import {
  BehaviorSubject,
  Observable,
  forkJoin,
  from,
  map,
  of,
  timer
} from 'rxjs';

import { PackageManagerService } from '../packages/package-manager.service';
import { DEFAULT_QUOTA_SIZE, QUOTA_REFRESH_TIME } from './constants';
import { Quota } from './quota.interface';

@Injectable({
  providedIn: 'root'
})
export class QuotaService {
  constructor(
    private config: ConfigService,
    private packageService: PackageManagerService
  ) {
    this.refreshQuota();

    this.packageService.action$.subscribe((action) => {
      if (!action) {
        return this.refreshQuota();
      }
    });

    timer(QUOTA_REFRESH_TIME, QUOTA_REFRESH_TIME).subscribe(() =>
      this.refreshQuota()
    );
  }

  private quotaSubject = new BehaviorSubject<Quota>({
    size: DEFAULT_QUOTA_SIZE,
    usage: 0
  });

  get quota() {
    return this.quotaSubject.value;
  }

  get quota$() {
    return this.quotaSubject.asObservable();
  }

  refreshQuota() {
    this.getQuota().subscribe((quota) => this.quotaSubject.next(quota));
  }

  private getQuota(): Observable<Quota> {
    return forkJoin({
      size: this.getSize(),
      usage: this.getUsage()
    });
  }

  private getUsage(): Observable<number> {
    if (!navigator.storage) {
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
