import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { PackageStoreService } from '@igo2/geo';

import { BehaviorSubject, Observable } from 'rxjs';

import { DownloadedPackage, PackageInfo } from './package-info.interface';

@Injectable({
  providedIn: 'root'
})
export class PackageManagerService {
  private packagesSubject: BehaviorSubject<PackageInfo[]> = new BehaviorSubject(
    []
  );

  get packages$(): Observable<PackageInfo[]> {
    return this.packagesSubject;
  }

  get packages() {
    return this.packagesSubject.value;
  }

  get downloaded() {
    return this.packageStore.downloaded;
  }

  get downloaded$() {
    return this.packageStore.downloaded$;
  }

  constructor(
    private http: HttpClient,
    private packageStore: PackageStoreService
  ) {
    this.actualizePackages();
  }

  actualizePackages() {
    this.http
      .get<PackageInfo[]>('assets/packages/tile-packages.json')
      .subscribe((newPackages) => {
        this.packagesSubject.next(newPackages);
      });
  }

  isLayerDownloaded(src: string) {
    const index = this.downloaded.findIndex(({ url }) => url === src);
    return index !== -1;
  }

  downloadPackage(packageInfo: PackageInfo) {
    const isExistant = this.isPackageExists(packageInfo);
    if (!isExistant) {
      this.actualizePackages();
      return;
    }

    console.log('downloading package', packageInfo);

    const { title } = packageInfo;
    this.http
      .get(`assets/packages/${title}.zip`, {
        responseType: 'arraybuffer'
      })
      .subscribe({
        next: (data) => {
          const blob = new Blob([data], { type: 'application/zip' });
          console.log('new blob with size', blob.size);
          this.packageStore.unpackPackage(blob);
        },
        error: () => {
          // TODO better error handling
          this.actualizePackages();
        }
      });
  }

  deletePackage(downloadedPackage: DownloadedPackage) {
    this.packageStore.deletePackage(downloadedPackage.title);
  }

  isPackageExists(packageInfo: PackageInfo) {
    const { id } = packageInfo;
    return this.packages.findIndex((p) => p.id === id) !== -1;
  }
}
