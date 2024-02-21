import { Injectable } from '@angular/core';

import { GeoDBService, InsertSourceInsertDBEnum } from '@igo2/geo';

import JSZip from 'jszip';
import {
  BehaviorSubject,
  Observable,
  Subject,
  firstValueFrom,
  from
} from 'rxjs';

import {
  DevicePackageInfo,
  DevicePackageStatus,
  DownloadingPackage,
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
    this.resumeDeletions();
  }

  private resumeDeletions() {
    const packages = this.getDevicePackages();
    const deletingPackages = packages.filter(
      (p) => p.status === DevicePackageStatus.DELETING
    );
    deletingPackages.forEach((deleting) => {
      this.deletePackage(deleting);
    });
  }

  private actualizedDevicePackages() {
    const devicePackages: DevicePackageInfo[] = this.getDevicePackages();
    this.devicePackagesSub.next(devicePackages);
  }

  private getDevicePackages(): DevicePackageInfo[] {
    return (
      JSON.parse(
        localStorage.getItem(this.DOWNLOADED_PACKAGE_METADATA_STORE)
      ) ?? []
    );
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
      title === packageTitle;
    });

    devicePackages.splice(index, 1);

    console.log('downloaded packages', devicePackages);

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

  unpackPackage(packageZip: Blob): Observable<number> {
    const progress$ = new Subject<number>();

    const zip$ = from(JSZip.loadAsync(packageZip));
    zip$.subscribe(async (zip) => {
      const metadata: PackageMetadata = JSON.parse(
        await zip.file('metadata.json').async('string')
      );

      console.log('unpacked metadata', metadata);

      this.updatePackageStatus(metadata, DevicePackageStatus.INSTALLING);

      const { title } = metadata;

      const data = zip.folder('data');

      const { files } = metadata;

      let nDone = 0;
      const loadFileIntoDB = async (file: FileMetadata) => {
        const fileData = await data.file(file.fileName).async('blob');
        await firstValueFrom(this.loadTileIntoGeoDB(fileData, file.url, title));
        ++nDone;
        const progress = nDone / files.length;
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

      console.log('package install done');

      this.updatePackageStatus(metadata, DevicePackageStatus.INSTALLED);

      progress$.next(1.0);
      progress$.complete();
    });

    return progress$;
  }

  deletePackage(packageInfo: PackageInfo): Observable<void> {
    this.updatePackageStatus(packageInfo, DevicePackageStatus.DELETING);

    const { title } = packageInfo;
    const done$ = this.geoDb.deleteByRegionID(title);
    done$.subscribe(() => {
      this.removeDevicePackage(title);
    });
    return done$;
  }

  updatePackageStatus(info: PackageInfo, status: DevicePackageStatus) {
    if (status === DevicePackageStatus.DOWNLOADING) {
      const newDevicePackage: DownloadingPackage = {
        ...info,
        status
      };
      this.addDevicePackage(newDevicePackage);
      return;
    }

    const { id } = info;

    const devicePackages = this.getDevicePackages();
    const devicePackage = devicePackages.find((p) => p.id === id);
    devicePackage.status = status;

    this.setDevicePackages(devicePackages);
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
