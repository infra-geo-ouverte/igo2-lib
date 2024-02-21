import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';

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
import { PackageStoreService } from './package-store.service';

@Injectable({
  providedIn: 'root'
})
export class PackageManagerService {
  private packagesSubject: BehaviorSubject<PackageInfo[]> = new BehaviorSubject(
    []
  );

  private nonDownloadedPackagesSub = new BehaviorSubject<PackageInfo[]>([]);
  private actionSub = new BehaviorSubject<PackageManagerAction | undefined>(
    undefined
  );
  private download$$: Subscription | undefined;

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

  get nonDownloaded$(): Observable<PackageInfo[]> {
    return this.nonDownloadedPackagesSub;
  }

  get nonDownloaded(): PackageInfo[] {
    return this.nonDownloadedPackagesSub.value;
  }

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

  private unpackPackage(blob: Blob, info: PackageInfo) {
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
      package: packageInfo,
      progress: 0
    });

    this.packageStore.updatePackageStatus(
      packageInfo,
      DevicePackageStatus.DOWNLOADING
    );

    this.download$$ = this.http
      .get(`assets/packages/${title}.zip`, {
        responseType: 'blob',
        reportProgress: true,
        observe: 'events'
      })
      .subscribe({
        next: (event) => {
          const { type } = event;
          if (type === HttpEventType.Response) {
            this.unpackPackage(event.body, packageInfo);
            return;
          }

          if (type !== HttpEventType.DownloadProgress) {
            return;
          }

          const progress =
            event.total === undefined ? undefined : event.loaded / event.total;

          this.actionSub.next({
            type: PackageManagerActionType.DOWNLOADING,
            package: packageInfo,
            progress
          });
        },
        error: () => {
          // TODO better error handling
          this.actualizePackages();
        }
      });
  }

  deletePackage(downloadedPackage: DownloadedPackage) {
    if (this.action) {
      throw Error('PackageManager already doing an action');
    }

    this.internalDeletePackage(downloadedPackage);
  }

  private internalDeletePackage(info: PackageInfo) {
    this.actionSub.next({
      type: PackageManagerActionType.DELETING,
      package: info
    });

    this.packageStore.deletePackage(info).subscribe(() => {
      this.actionSub.next(undefined);
    });
  }

  isPackageExists(packageTitle: string) {
    return this.packages.findIndex((p) => p.title === packageTitle) !== -1;
  }

  updatePackageStatus(info: PackageInfo, status: DevicePackageStatus) {
    this.packageStore.updatePackageStatus(info, status);
  }

  cancelAction(): void {
    const action = this.action;
    if (!action) {
      throw Error('No action to cancel in package manager.');
    }
    const { type, package: info } = action;
    switch (type) {
      case PackageManagerActionType.DOWNLOADING:
        return this.cancelDownload(info);
      case PackageManagerActionType.INSTALLING:
        return this.cancelInstallation(info);
      case PackageManagerActionType.DELETING:
        throw Error("Package manager can't cancel a deletion");
      default:
        throw Error('Wrong action type');
    }
  }

  private cancelDownload(info: PackageInfo): void {
    this.download$$?.unsubscribe();
    this.internalDeletePackage(info);
  }

  private cancelInstallation(info: PackageInfo): void {
    this.packageStore.cancelInstallation().subscribe(() => {
      this.internalDeletePackage(info);
    });
  }
}
