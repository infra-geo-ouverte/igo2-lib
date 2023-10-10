import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, of, Subject } from 'rxjs';
import { concatMap, first } from 'rxjs/operators';
import { LayerDBData } from './layerDB.interface';

@Injectable({
  providedIn: 'root'
})
export class LayerDBService {
  readonly dbName: string = 'layerData';

  constructor(private ngxIndexedDBService: NgxIndexedDBService) {}

  /**
   * This method allow to update the stored layer into the indexeddb (layerData)
   * @param layerDBData
   * @returns
   */
  update(layerDBData: LayerDBData): Observable<any> {
    const subject: Subject<LayerDBData> = new Subject();
    this.ngxIndexedDBService
      .getByID(this.dbName, layerDBData.layerId)
      .pipe(
        first(),
        concatMap((dbObject: LayerDBData) => {
          if (!dbObject) {
            return this.ngxIndexedDBService.add(this.dbName, layerDBData);
          } else {
            return this.customUpdate(layerDBData);
          }
        })
      )
      .subscribe((response) => {
        subject.next(response);
        subject.complete();
      });
    return subject;
  }

  private customUpdate(layerDBData: LayerDBData): Observable<LayerDBData> {
    const subject: Subject<LayerDBData> = new Subject();
    const deleteRequest = this.ngxIndexedDBService.deleteByKey(
      this.dbName,
      layerDBData.layerId
    );
    deleteRequest
      .pipe(
        concatMap((isDeleted) =>
          isDeleted
            ? this.ngxIndexedDBService.add(this.dbName, layerDBData)
            : of(undefined)
        )
      )
      .subscribe((object) => {
        if (object) {
          subject.next(object);
        }
        subject.complete();
      });
    return subject;
  }

  /**
   * This method retrieve an idb layer definition
   * @param layerId
   * @returns
   */
  getByID(layerId: string): Observable<LayerDBData> {
    return this.ngxIndexedDBService.getByID(this.dbName, layerId);
  }

  /**
   * This method delete an idb layer definition
   * @param layerId
   * @returns
   */
  deleteByKey(layerId: string): Observable<boolean> {
    return this.ngxIndexedDBService.deleteByKey(this.dbName, layerId);
  }

  /**
   * This method retrive all idb layer definition
   * @param layerId
   * @returns
   */
  getAll(): Observable<LayerDBData[]> {
    return this.ngxIndexedDBService.getAll(this.dbName);
  }
}
