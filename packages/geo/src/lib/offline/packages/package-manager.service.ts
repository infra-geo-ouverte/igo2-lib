import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  map,
  of,
  switchMap
} from 'rxjs';

import { PackageExpirationNotifierService } from './package-expiration-notifier.service';
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
    private packageStore: PackageStoreService,
    private expirationNotifier: PackageExpirationNotifierService
  ) {
    this.expirationNotifier.notifySoonToExpire();
    this.expirationNotifier.notifyExpired();
    this.actualizePackages();
    this.resumeOperations();
    this.initFilterDownloadedPackages();
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
      // TODO better error handling
      this.actualizePackages();
      return;
    }

    // TODO better error handling
    this.internalDownload(
      packageInfo,
      (blob, info) => {
        this.unpackPackage(blob, info);
      },
      () => this.actualizePackages()
    );
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

  private internalDownload(
    packageInfo: PackageInfo,
    done: (blob: Blob, info: PackageInfo) => void,
    onError: () => void
  ): Observable<void> {
    this.actionSub.next({
      type: PackageManagerActionType.DOWNLOADING,
      package: packageInfo,
      progress: 0
    });

    this.packageStore.updatePackageStatus(
      packageInfo,
      DevicePackageStatus.DOWNLOADING
    );

    const download$ = this.http.get(
      `assets/packages/${packageInfo.title}.zip`,
      {
        responseType: 'blob',
        reportProgress: true,
        observe: 'events'
      }
    );
    this.download$$ = download$.subscribe({
      next: (event) => {
        const { type } = event;
        if (type === HttpEventType.Response) {
          done(event.body, packageInfo);
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
        onError();
      }
    });
    return download$.pipe(map(() => {}));
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

    const deleted$ = this.packageStore.deletePackage(info);
    deleted$.subscribe(() => {
      this.actionSub.next(undefined);
    });

    return deleted$;
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

  private async resumeOperations() {
    this.resumeDeletions()
      .pipe(
        switchMap(() => this.resumeDownloads()),
        switchMap(() => this.resumeInstallations())
      )
      .subscribe();
  }

  private resumeOperation(
    packages: DevicePackageInfo[],
    operation: (info: DevicePackageInfo) => Observable<void>
  ): Observable<void> {
    if (!packages.length) {
      return of(void 0);
    }

    const done$: Subject<void> = new Subject();

    let index = 0;
    const resumeNextOperation = () => {
      if (index === packages.length) {
        done$.next();
        done$.complete();
        return;
      }
      const devicePackage = packages[index];
      index++;
      operation(devicePackage).subscribe(() => resumeNextOperation());
    };
    resumeNextOperation();
    return done$;
  }

  private resumeDeletions() {
    const deleting = this.packageStore.getDeletingPackages();
    return this.resumeOperation(deleting, (info) =>
      this.internalDeletePackage(info)
    );
  }

  private resumeDownloads() {
    const downloading = this.packageStore.getDownloadingPackages();
    return this.resumeOperation(downloading, (info) =>
      this.internalDownload(
        info,
        (blob, info) => {
          this.unpackPackage(blob, info);
        },
        () => this.actualizePackages()
      )
    );
  }

  private resumeInstallations() {
    const installing = this.packageStore.getInstallingPackages();
    return this.resumeOperation(installing, (info) =>
      this.internalDownload(
        info,
        (blob, info) => {
          this.resumeUnpackingPackage(blob, info);
        },
        () => this.internalDeletePackage(info)
      )
    );
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
    this.unpackInternal(blob, info, (blob) =>
      this.packageStore.unpackPackage(blob)
    );
  }

  private resumeUnpackingPackage(blob: Blob, info: PackageInfo) {
    this.unpackInternal(blob, info, (blob) => {
      return this.packageStore.resumeUnpackingPackage(blob);
    });
  }

  private unpackInternal(
    blob: Blob,
    info: PackageInfo,
    unpack: (blob: Blob) => Observable<number>
  ) {
    this.actionSub.next({
      type: PackageManagerActionType.INSTALLING,
      package: info,
      progress: 0
    });

    unpack(blob).subscribe((progress) => {
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
}
