import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, of, Subject } from 'rxjs';
import { concatMap, first, map } from 'rxjs/operators';
import { LayerDBData } from './layerDB.interface';

@Injectable({
  providedIn: 'root'
})
export class LayerDBService {
  readonly dbName: string = 'layerData';

  constructor(
    private ngxIndexedDBService: NgxIndexedDBService
  ) { }

  /**
   * Only blob can be will be compressed
   * @param url
   * @param regionID
   * @param object object to handle
   * @param insertSource type of event user or system
   * @param insertEvent Name of the event where the insert has been triggered
   * @returns
   */
  update(layerDBData: LayerDBData): Observable<any> {
    const subject: Subject<LayerDBData> = new Subject();
    this.ngxIndexedDBService.getByID(this.dbName, layerDBData.layerId).pipe(
      first(),
      concatMap((dbObject: LayerDBData) => {
        if (!dbObject) {
          return this.ngxIndexedDBService.add(this.dbName, layerDBData);
        } else {
          return this.customUpdate(layerDBData);
        }
      })
    ).subscribe((response) => {
      subject.next(response);
      subject.complete();
    });
    return subject;
  }

  private customUpdate(layerDBData: LayerDBData): Observable<LayerDBData> {
    const subject: Subject<LayerDBData> = new Subject();
    const deleteRequest = this.ngxIndexedDBService.deleteByKey(this.dbName, layerDBData.layerId);
    deleteRequest.pipe(
      concatMap(isDeleted => isDeleted ? this.ngxIndexedDBService.add(this.dbName, layerDBData) : of(undefined))
    )
    .subscribe(object => {
      if (object) {
        subject.next(object);
      }
      subject.complete();
    });
    return subject;
  }

  get(layerId: string): Observable<any> {
    return this.ngxIndexedDBService.getByID(this.dbName, layerId).pipe(
      map((data: LayerDBData) => {
        return data;
      })
    );
  }

  getByID(layerId: string): Observable<any> {
    return this.ngxIndexedDBService.getByID(this.dbName, layerId);
  }

  deleteByKey(layerId: string): Observable<any> {
    return this.ngxIndexedDBService.deleteByKey(this.dbName, layerId);
  }

  getAll(): Observable<LayerDBData[]> {
    return this.ngxIndexedDBService.getAll(this.dbName);
  }
}
