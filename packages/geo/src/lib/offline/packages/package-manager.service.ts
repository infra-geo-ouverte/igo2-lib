import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { PackageStoreService } from '@igo2/geo';

import { BehaviorSubject, Observable } from 'rxjs';

import {
  DevicePackageInfo,
  DownloadedPackage,
  PackageInfo
} from './package-info.interface';

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
    return this.packageStore.devicePackages;
  }

  get downloaded$() {
    return this.packageStore.devicePackages$;
  }

  private nonDownloadedPackagesSub = new BehaviorSubject<PackageInfo[]>([]);

  get nonDownloaded$(): Observable<PackageInfo[]> {
    return this.nonDownloadedPackagesSub;
  }

  get nonDownloaded(): PackageInfo[] {
    return this.nonDownloadedPackagesSub.value;
  }

  constructor(
    private http: HttpClient,
    private packageStore: PackageStoreService
  ) {
    this.actualizePackages();
    this.initFilterDownloadedPackages();
  }

  private initFilterDownloadedPackages() {
    const filterPackages = (
      downloaded: DevicePackageInfo[],
      packages: PackageInfo[]
    ) => {
      const nonDownloaded = packages.filter(
        (p) => !downloaded.find((d) => d.id === p.id)
      );
      this.nonDownloadedPackagesSub.next(nonDownloaded);
    };

    this.downloaded$.subscribe((downloaded) => {
      const packages = this.packages;
      filterPackages(downloaded, packages);
    });

    this.packages$.subscribe((packages) => {
      const downloaded = this.downloaded;
      filterPackages(downloaded, packages);
    });
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

  downloadPackage(title: string) {
    const isExistant = this.isPackageExists(title);
    if (!isExistant) {
      this.actualizePackages();
      return;
    }

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

  isPackageExists(packageTitle: string) {
    return this.packages.findIndex((p) => p.title === packageTitle) !== -1;
  }
}
