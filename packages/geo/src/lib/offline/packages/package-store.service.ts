import { Injectable } from '@angular/core';

import { GeoDBService, InsertSourceInsertDBEnum } from '@igo2/geo';

import JSZip from 'jszip';
import { Observable, Subject, firstValueFrom, from } from 'rxjs';

import { FileMetadata, PackageMetadata } from './package-info.interface';

@Injectable({
  providedIn: 'root'
})
export class PackageStoreService {
  private readonly MAX_WORKERS = 1000;

  constructor(private geoDb: GeoDBService) {}

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

      done$.next();
      done$.complete();
    });

    return done$;
  }
}
