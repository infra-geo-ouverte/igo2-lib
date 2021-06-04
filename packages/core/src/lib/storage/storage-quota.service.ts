import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageQuotaService {

  constructor() { }

  private getStorageQuota(): Observable<StorageEstimate> {
    const quotaObs = from(navigator.storage.estimate());
    return quotaObs;
  }

  public enoughSpace(objectSize: number): Observable<boolean> {
    const quotaObs = this.getStorageQuota().pipe(map(
      (quota) => {
        const totalSpace = quota.quota;
        const usedSpace = quota.usage;
        return totalSpace >= usedSpace + objectSize;
      }
    ));
    return quotaObs;
  }

  public totalSpace(): Observable<number> {
    const quotaObs = this.getStorageQuota().pipe(map(
      (quota) => {
        const totalSpace = quota.quota;
        return totalSpace;
      }
    ));
    return quotaObs;
  }

  public spaceLeft(): Observable<number> {
    const quotaObs = this.getStorageQuota().pipe(map(
      (quota) => {
        const totalSpace = quota.quota;
        const usedSpace = quota.usage;
        return totalSpace - usedSpace;
      }
    ));
    return quotaObs;
  }  
}
