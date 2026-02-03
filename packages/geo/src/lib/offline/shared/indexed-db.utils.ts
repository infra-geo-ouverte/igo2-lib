import { IDBPDatabase, openDB } from 'idb';
import { Observable, from } from 'rxjs';

import { IgoDBSchema } from './indexed-db.interface';

export function createIndexedDb(): Observable<IDBPDatabase<IgoDBSchema>> {
  return from(
    openDB<IgoDBSchema>('igo2DB', undefined, {
      upgrade(db) {
        const geoDataStore = db.createObjectStore('geoData', {
          keyPath: 'url',
          autoIncrement: false
        });
        geoDataStore.createIndex('regionID-idx', 'regionID', {
          unique: false
        });
        db.createObjectStore('layerData', {
          keyPath: 'layerId',
          autoIncrement: false
        });
      }
    })
  );
}
