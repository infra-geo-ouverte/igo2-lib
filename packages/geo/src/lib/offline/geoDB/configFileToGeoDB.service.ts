import { Injectable } from '@angular/core';
import { MessageService } from '@igo2/core';
import { HttpClient } from '@angular/common/http';
import { catchError, concatMap } from 'rxjs/operators';
import { GeoDBService } from './geoDB.service';
import { of, zip } from 'rxjs';
import { DatasToIDB, GeoDBData } from './geoDB.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfigFileToGeoDBService {


  constructor(
    private http: HttpClient,
    private geoDBService: GeoDBService,
    private messageService: MessageService
  ) { }


  load(url: string) {
    let downloadMessage;
    this.http.get(url).pipe(

      catchError((error: any): any => {
        console.log(`GeoData file ${url} could not be read`);
        error.error.caught = true;
        throw error;
      }),
      concatMap((datasToIDB: DatasToIDB) => {
      const datas$ = [];
      let firstDownload = true;
      if (datasToIDB?.geoDatas) {
        const currentDate = new Date();
        datasToIDB?.geoDatas.map((geoData) => {
          if (typeof geoData.triggerDate === 'string') {
            geoData.triggerDate = new Date(Date.parse(geoData.triggerDate.replace(/-/g, ' ')));
          }
          if (currentDate >= geoData.triggerDate) {
            if (geoData.action === 'update') {
              const insertEvent = `${geoData.source || 'automatedDataUpdate'} (${geoData.triggerDate})`;
              geoData.urls.map((url) => {
                datas$.push(
                  this.geoDBService.getByID(url).pipe(concatMap((res: GeoDBData) => {
                    if (res?.insertEvent !== insertEvent) {
                      if (firstDownload) {
                        downloadMessage = this.messageService
                        .info('igo.geo.indexedDb.data-download-start', undefined,
                        { disableTimeOut: true, progressBar: false, closeButton: true, tapToDismiss: false });
                        firstDownload = false;
                      }
                      return this.http.get(url)
                        .pipe(concatMap(r => this.geoDBService.update(url, url as any, r, 'system' as any, insertEvent)));
                    } else {
                      return of(false);
                    }
                  }))
                );
              });
            } else if (geoData.action === 'delete') {
              geoData.urls.map((url) => {
                datas$.push(this.geoDBService.deleteByKey(url));
              });
            }
          }
        });
      }
      return zip(...datas$);
    })
    ).subscribe(() => {
      if (downloadMessage) {
        setTimeout(() => {
          this.messageService.remove((downloadMessage as any).toastId);
          this.messageService.success('igo.geo.indexedDb.data-download-completed', undefined, { timeOut: 40000 });
        }, 2500);
      }
    });
  }


}
