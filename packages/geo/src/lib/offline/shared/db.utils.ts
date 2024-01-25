import { IDBPDatabase, openDB } from 'idb';

import { Igo2DBSchema } from './db.interface';

export async function createDb(): Promise<IDBPDatabase<Igo2DBSchema>> {
  const db = await openDB<Igo2DBSchema>('igo2DB_v3', 2, {
    upgrade(db) {
      const layerDataStore = db.createObjectStore('layerData', {
        keyPath: 'layerId',
        autoIncrement: false
      });
      const geoDataStore = db.createObjectStore('geoData', {
        keyPath: 'regionID',
        autoIncrement: false
      });
      layerDataStore.createIndex('layerOptionsIdx', 'layerOptions');
      layerDataStore.createIndex('sourceOptionsIdx', 'sourceOptions');
      geoDataStore.createIndex('regionIDIdx', 'regionID');
    }
  });
  return db;
}
