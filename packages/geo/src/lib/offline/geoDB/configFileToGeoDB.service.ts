import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { MessageService } from '@igo2/core';

import { default as JSZip } from 'jszip';
import { ActiveToast } from 'ngx-toastr';
import { of, zip } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';

import { InsertSourceInsertDBEnum } from './geoDB.enums';
import { DatasToIDB, GeoDBData } from './geoDB.interface';
import { GeoDBService } from './geoDB.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigFileToGeoDBService {
  constructor(
    private http: HttpClient,
    private geoDBService: GeoDBService,
    private messageService: MessageService
  ) {}

  load(url: string) {
    let downloadMessage: ActiveToast<any>;
    this.http
      .get(url)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.messageService.error(`GeoData file ${url} could not be read`);
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
                geoData.triggerDate = new Date(Date.parse(geoData.triggerDate));
              }
              if (currentDate >= geoData.triggerDate) {
                if (geoData.action === 'update') {
                  const insertEvent = `${
                    geoData.source || InsertSourceInsertDBEnum.System
                  } (${geoData.triggerDate})`;
                  geoData.urls.map((url) => {
                    datas$.push(
                      this.geoDBService.getByID(url).pipe(
                        concatMap((res: GeoDBData) => {
                          if (res?.insertEvent !== insertEvent) {
                            if (firstDownload) {
                              downloadMessage = this.messageService.info(
                                'igo.geo.indexedDb.data-download-start',
                                undefined,
                                {
                                  disableTimeOut: true,
                                  progressBar: false,
                                  closeButton: true,
                                  tapToDismiss: false
                                }
                              );
                              firstDownload = false;
                            }
                            let responseType: any = 'json';
                            const isZip = this.isZip(url);
                            if (isZip) {
                              responseType = 'arraybuffer';
                            }
                            return this.http.get(url, { responseType }).pipe(
                              catchError((error: HttpErrorResponse) => {
                                this.messageService.remove(
                                  downloadMessage.toastId
                                );
                                this.messageService.success(
                                  'igo.geo.indexedDb.data-download-failed',
                                  undefined,
                                  { timeOut: 40000 }
                                );

                                error.error.caught = true;
                                throw error;
                              }),
                              concatMap((r) => {
                                if (isZip) {
                                  const observables$ = [
                                    this.geoDBService.update(
                                      url,
                                      url,
                                      {},
                                      InsertSourceInsertDBEnum.System,
                                      insertEvent
                                    )
                                  ];
                                  JSZip.loadAsync(r).then((zipped) => {
                                    zipped.forEach((relativePath) => {
                                      if (
                                        relativePath
                                          .toLocaleLowerCase()
                                          .endsWith('.geojson')
                                      ) {
                                        zipped
                                          .file(relativePath)
                                          .async('text')
                                          .then((r) => {
                                            const geojson = JSON.parse(r);
                                            const subUrl =
                                              geoData.zippedBaseUrl || '';
                                            const zippedUrl =
                                              subUrl +
                                              (subUrl.endsWith('/')
                                                ? ''
                                                : '/') +
                                              relativePath;
                                            observables$.push(
                                              this.geoDBService.update(
                                                zippedUrl,
                                                url,
                                                geojson,
                                                InsertSourceInsertDBEnum.System,
                                                insertEvent
                                              )
                                            );
                                          });
                                      }
                                    });
                                  });
                                  return zip(observables$);
                                }
                                return this.geoDBService.update(
                                  url,
                                  url,
                                  r,
                                  InsertSourceInsertDBEnum.System,
                                  insertEvent
                                );
                              })
                            );
                          } else {
                            return of(false);
                          }
                        })
                      )
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
      )
      .subscribe(() => {
        if (downloadMessage) {
          setTimeout(() => {
            this.messageService.remove(downloadMessage.toastId);
            this.messageService.success(
              'igo.geo.indexedDb.data-download-completed',
              undefined,
              { timeOut: 40000 }
            );
          }, 2500);
        }
      });
  }

  private isZip(value) {
    const regex = /(zip)$/;
    return typeof value === 'string' && regex.test(value.toLowerCase());
  }
}
