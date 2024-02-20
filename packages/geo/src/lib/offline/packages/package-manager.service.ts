import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { PackageStoreService } from '@igo2/geo';

import { BehaviorSubject, Observable } from 'rxjs';

import {
  DevicePackageInfo,
  DevicePackageStatus,
  DownloadedPackage,
  PackageInfo
} from './package-info.interface';
import {
  PackageManagerAction,
  PackageManagerActionType
} from './package-manager-action.interface';

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

  private actionSub = new BehaviorSubject<PackageManagerAction | undefined>(
    undefined
  );

  get action$(): Observable<PackageManagerAction | undefined> {
    return this.actionSub;
  }

  get action(): PackageManagerAction | undefined {
    return this.actionSub.value;
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

  private unpackPackage(data: ArrayBuffer, info: PackageInfo) {
    const blob = new Blob([data], { type: 'application/zip' });
    console.log('new blob with size', blob.size);

    this.actionSub.next({
      type: PackageManagerActionType.INSTALLING,
      package: info,
      progress: 0
    });

    this.packageStore.unpackPackage(blob).subscribe((progress) => {
      if (progress === 1) {
        this.actionSub.next(undefined);
        return;
      }

      this.actionSub.next({
        type: PackageManagerActionType.INSTALLING,
        package: info,
        progress
      });
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
    if (!!this.action) {
      throw Error('PackageManager already doing an action');
    }

    const packageInfo = this.packages.find((p) => p.title === title);
    if (!packageInfo) {
      this.actualizePackages();
      return;
    }

    this.actionSub.next({
      type: PackageManagerActionType.DOWNLOADING,
      package: packageInfo
    });

    this.packageStore.updatePackageStatus(
      packageInfo,
      DevicePackageStatus.DOWNLOADING
    );

    this.http
      .get(`assets/packages/${title}.zip`, {
        responseType: 'arraybuffer'
      })
      .subscribe({
        next: (data) => {
          this.unpackPackage(data, packageInfo);
        },
        error: () => {
          // TODO better error handling
          this.actualizePackages();
        }
      });
  }

  deletePackage(downloadedPackage: DownloadedPackage) {
    if (!!this.action) {
      throw Error('PackageManager already doing an action');
    }

    this.actionSub.next({
      type: PackageManagerActionType.DELETING,
      package: downloadedPackage
    });

    this.packageStore.deletePackage(downloadedPackage).subscribe(() => {
      this.actionSub.next(undefined);
    });
  }

  isPackageExists(packageTitle: string) {
    return this.packages.findIndex((p) => p.title === packageTitle) !== -1;
  }

  updatePackageStatus(info: PackageInfo, status: DevicePackageStatus) {
    this.packageStore.updatePackageStatus(info, status);
  }
}
