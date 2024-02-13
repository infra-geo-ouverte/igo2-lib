import { Injectable } from '@angular/core';

import { GeoDBService, InsertSourceInsertDBEnum } from '@igo2/geo';

import JSZip from 'jszip';
import { Observable, Subject, from } from 'rxjs';

import { PackageMetadata } from './package-info.interface';

@Injectable({
  providedIn: 'root'
})
export class PackageStoreService {
  constructor(private geoDb: GeoDBService) {}

  private loadTileIntoGeoDB(tile: Blob, url: string, packageTitle: string) {
    const insertEvent = `${packageTitle} | ${InsertSourceInsertDBEnum.User}`;
    this.geoDb.update(
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
      const filePromises = files.map(async ({ fileName, url }) => {
        const fileData = await data.file(fileName).async('blob');
        this.loadTileIntoGeoDB(fileData, url, title);
      });

      await Promise.all(filePromises);

      console.log('package install done');

      done$.next();
      done$.complete();
    });

    return done$;
  }
}
