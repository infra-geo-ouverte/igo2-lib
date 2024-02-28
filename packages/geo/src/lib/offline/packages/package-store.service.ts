import { Injectable } from '@angular/core';

import JSZip from 'jszip';
import {
  BehaviorSubject,
  Observable,
  Subject,
  firstValueFrom,
  from,
  map,
  of,
  switchMap
} from 'rxjs';

import { GeoDBService, InsertSourceInsertDBEnum } from '../geoDB';
import {
  DevicePackageInfo,
  DevicePackageStatus,
  FileMetadata,
  PackageInfo,
  PackageMetadata
} from './package-info.interface';

@Injectable({
  providedIn: 'root'
})
export class PackageStoreService {
  private readonly MAX_WORKERS = 500;
  private readonly DOWNLOADED_PACKAGE_METADATA_STORE =
    'downloadedPackageMetadata';

  private devicePackagesSub = new BehaviorSubject<DevicePackageInfo[]>([]);
  private cancelDone$: Subject<void> | undefined;

  get devicePackages$(): Observable<DevicePackageInfo[]> {
    return this.devicePackagesSub;
  }

  get devicePackages(): DevicePackageInfo[] {
    return this.devicePackagesSub.value;
  }

  private get isCancelingInstallation() {
    return !!this.cancelDone$;
  }

  constructor(private geoDb: GeoDBService) {
    this.actualizedDevicePackages();
  }

  private getPackagesByStatus(status: DevicePackageStatus) {
    const packages = this.getDevicePackages();
    return packages.filter((p) => p.status === status);
  }

  getDeletingPackages() {
    return this.getPackagesByStatus(DevicePackageStatus.DELETING);
  }

  getDownloadingPackages() {
    return this.getPackagesByStatus(DevicePackageStatus.DOWNLOADING);
  }

  getInstallingPackages() {
    return this.getPackagesByStatus(DevicePackageStatus.INSTALLING);
  }

  private isPackageOnDevice(packageTitle: string) {
    const packages = this.getDevicePackages();
    return !!packages.find((p) => packageTitle === p.title);
  }

  private actualizedDevicePackages() {
    const devicePackages: DevicePackageInfo[] = this.getDevicePackages();
    this.devicePackagesSub.next(devicePackages);
  }

  private getDevicePackages(): DevicePackageInfo[] {
    const packages: DevicePackageInfo[] =
      JSON.parse(
        localStorage.getItem(this.DOWNLOADED_PACKAGE_METADATA_STORE)
      ) ?? [];

    packages.forEach((devicePackage) => {
      devicePackage.expiration = new Date(devicePackage.expiration);
    });
    return packages;
  }

  private setDevicePackages(downloaded: DevicePackageInfo[]) {
    localStorage.setItem(
      this.DOWNLOADED_PACKAGE_METADATA_STORE,
      JSON.stringify(downloaded)
    );
  }

  private addDevicePackage(devicePackage: DevicePackageInfo) {
    const devicePackages: DevicePackageInfo[] = this.getDevicePackages();
    devicePackages.push(devicePackage);

    this.setDevicePackages(devicePackages);
    this.actualizedDevicePackages();
  }

  private removeDevicePackage(packageTitle: string) {
    const devicePackages: DevicePackageInfo[] = this.getDevicePackages();
    const index = devicePackages.findIndex(({ title }) => {
      return title === packageTitle;
    });

    if (index === -1) {
      this.actualizedDevicePackages();
      return;
    }

    devicePackages.splice(index, 1);

    this.setDevicePackages(devicePackages);
    this.actualizedDevicePackages();
  }

  private loadTileIntoGeoDB(tile: Blob, url: string, packageTitle: string) {
    const insertEvent = `${packageTitle} | ${InsertSourceInsertDBEnum.User}`;
    return this.geoDb.update(
      url,
      packageTitle,
      tile,
      InsertSourceInsertDBEnum.User,
      insertEvent
    );
  }

  resumeUnpackingPackage(packageZip: Blob): Observable<number> {
    const zip$ = from(JSZip.loadAsync(packageZip));
    const progress$ = zip$.pipe(
      switchMap((zip) => {
        return from(zip.file('metadata.json').async('string')).pipe(
          map((data) => JSON.parse(data))
        );
      }),
      switchMap((metadata) => {
        return this.geoDb.getRegionByID(metadata.title);
      }),
      map((data) => new Set(data.map(({ url }) => url) as string[])),
      switchMap((urls) => {
        return this.internalUnpack(packageZip, ({ url }) => {
          return !urls.has(url);
        });
      })
    );
    return progress$;
  }

  unpackPackage(packageZip: Blob): Observable<number> {
    return this.internalUnpack(packageZip);
  }

  private internalUnpack(
    packageZip: Blob,
    fileFilter = (file: FileMetadata) => true
  ) {
    const progress$ = new Subject<number>();

    const zip$ = from(JSZip.loadAsync(packageZip));
    zip$.subscribe(async (zip) => {
      const metadata: PackageMetadata = JSON.parse(
        await zip.file('metadata.json').async('string')
      );

      this.updatePackageStatus(metadata, DevicePackageStatus.INSTALLING);

      const { title } = metadata;

      const data = zip.folder('data');

      const files = metadata.files.filter(fileFilter);

      let nDone = metadata.files.length - files.length;
      const loadFileIntoDB = async (file: FileMetadata) => {
        const fileData = await data.file(file.fileName).async('blob');
        await firstValueFrom(this.loadTileIntoGeoDB(fileData, file.url, title));
        ++nDone;
        const progress = nDone / metadata.files.length;
        progress$.next(progress);
      };

      let activeLoading = [];
      for (const file of files) {
        if (this.isCancelingInstallation) {
          this.afterInstallationCancel();
          progress$.complete();
          return;
        }

        const done = loadFileIntoDB(file);
        activeLoading.push(done);
        if (activeLoading.length <= this.MAX_WORKERS) {
          continue;
        }

        await Promise.all(activeLoading);

        activeLoading = [];
      }

      this.updatePackageStatus(metadata, DevicePackageStatus.INSTALLED);

      progress$.next(1.0);
      progress$.complete();
    });

    return progress$;
  }

  deletePackage(packageInfo: PackageInfo): Observable<void> {
    if (!this.isPackageOnDevice(packageInfo.title)) {
      return of();
    }

    this.updatePackageStatus(packageInfo, DevicePackageStatus.DELETING);

    const { title } = packageInfo;
    const done$ = this.geoDb.deleteByRegionID(title);
    done$.subscribe(() => {
      this.removeDevicePackage(title);
    });
    return done$;
  }

  updatePackageStatus(info: PackageInfo, status: DevicePackageStatus) {
    const { id } = info;

    const devicePackages = this.getDevicePackages();
    const devicePackage = devicePackages.find((p) => p.id === id);

    if (!devicePackage && status === DevicePackageStatus.DOWNLOADING) {
      devicePackages.push({ ...info, status });
    } else {
      devicePackage.status = status;
    }

    this.setDevicePackages(devicePackages);
    this.actualizedDevicePackages();
  }

  cancelInstallation() {
    if (this.isCancelingInstallation) {
      return this.cancelDone$;
    }
    this.cancelDone$ = new Subject();
    return this.cancelDone$;
  }

  private afterInstallationCancel() {
    this.cancelDone$.next();
    this.cancelDone$.complete();
    this.cancelDone$ = undefined;
  }
}
