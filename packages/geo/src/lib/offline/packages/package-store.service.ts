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
  DownloadedPackage,
  FileMetadata,
  PackageMetadata
} from './package-info.interface';
import { packageMetadataToDownloadedPackage } from './package-utils';

@Injectable({
  providedIn: 'root'
})
export class PackageStoreService {
  private readonly MAX_WORKERS = 1000;
  private readonly DOWNLOADED_PACKAGE_METADATA_STORE =
    'downloadedPackageMetadata';

  private downloadedPackagesSub = new BehaviorSubject<DownloadedPackage[]>([]);

  get downloaded$(): Observable<DownloadedPackage[]> {
    return this.downloadedPackagesSub;
  }

  get downloaded(): DownloadedPackage[] {
    return this.downloadedPackagesSub.value;
  }

  constructor(private geoDb: GeoDBService) {
    this.actualizedDownloadedPackages();
  }

  private actualizedDownloadedPackages() {
    const downloaded: DownloadedPackage[] = this.getDownloadedPackages();
    this.downloadedPackagesSub.next(downloaded);
  }

  private getDownloadedPackages(): DownloadedPackage[] {
    return (
      JSON.parse(
        localStorage.getItem(this.DOWNLOADED_PACKAGE_METADATA_STORE)
      ) ?? []
    );
  }

  private setDownloadedPackages(downloaded: DownloadedPackage[]) {
    localStorage.setItem(
      this.DOWNLOADED_PACKAGE_METADATA_STORE,
      JSON.stringify(downloaded)
    );
  }

  private addDownloadedPackage(metadata: PackageMetadata) {
    const downloaded: DownloadedPackage[] = this.getDownloadedPackages();

    const downloadedPackage = packageMetadataToDownloadedPackage(metadata);
    downloaded.push(downloadedPackage);

    this.setDownloadedPackages(downloaded);

    this.actualizedDownloadedPackages();
  }

  private removeDownloadedPackage(packageTitle: string) {
    const downloaded: DownloadedPackage[] = this.getDownloadedPackages();
    const index = downloaded.findIndex(({ title }) => {
      title === packageTitle;
    });

    downloaded.splice(index, 1);

    console.log('downloaded packages', downloaded);

    this.setDownloadedPackages(downloaded);
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

  unpackPackage(packageZip: Blob): Observable<void> {
    const done$ = new Subject<void>();

    const zip$ = from(JSZip.loadAsync(packageZip));
    zip$.subscribe(async (zip) => {
      const metadata: PackageMetadata = JSON.parse(
        await zip.file('metadata.json').async('string')
      );
      console.log('unpacked metadata', metadata);

      const { title } = metadata;

      const data = zip.folder('data');

      const { files } = metadata;

      const loadFileIntoDB = async (file: FileMetadata) => {
        const fileData = await data.file(file.fileName).async('blob');
        await firstValueFrom(this.loadTileIntoGeoDB(fileData, file.url, title));
      };

      let activeLoading = [];
      let i = 0;
      for (const file of files) {
        const done = loadFileIntoDB(file);
        activeLoading.push(done);
        i++;
        if (activeLoading.length <= this.MAX_WORKERS) {
          continue;
        }

        await Promise.all(activeLoading);

        activeLoading = [];
        console.log('unpacked', i / files.length);
      }

      console.log('package install done');

      this.addDownloadedPackage(metadata);

      done$.next();
      done$.complete();
    });

    return done$;
  }

  deletePackage(packageTitle: string): Observable<void> {
    console.log('removing package');
    this.removeDownloadedPackage(packageTitle);
    return this.geoDb.deleteByRegionID(packageTitle);
  }
}
