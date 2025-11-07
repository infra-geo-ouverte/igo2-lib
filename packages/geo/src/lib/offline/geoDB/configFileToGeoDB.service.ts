import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { MessageService } from '@igo2/core/message';

import { default as JSZip } from 'jszip';
import { ActiveToast } from 'ngx-toastr';
import { of, zip } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';

import { GeoDB } from './geoDB';
import { InsertSourceInsertDBEnum } from './geoDB.enums';
import { DatasToIDB, GeoDBData } from './geoDB.interface';

@Injectable()
export class ConfigFileToGeoDBService {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);

  load(urlFile: string) {
    const geoDB = new GeoDB();
    let downloadMessage: ActiveToast<any>;
    this.http
      .get(urlFile)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.messageService.error(
            `GeoData file ${urlFile} could not be read`
          );
          error.error.caught = true;
          throw error;
        }),
        concatMap((datasToIDB: DatasToIDB) => {
          const datas$ = [];
          let firstDownload = true;
          if (datasToIDB?.geoDatas) {
            const currentDate = new Date();
            datasToIDB?.geoDatas.forEach((geoData) => {
              if (typeof geoData.triggerDate === 'string') {
                geoData.triggerDate = new Date(Date.parse(geoData.triggerDate));
              }
              if (currentDate >= geoData.triggerDate) {
                if (geoData.action === 'update') {
                  const insertEvent = `${
                    geoData.source || InsertSourceInsertDBEnum.System
                  } (${geoData.triggerDate})`;
                  geoData.urls.forEach((url) => {
                    datas$.push(
                      geoDB.getGeoDBData(url).pipe(
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
                                this.messageService.error(
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
                                    geoDB.update(
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
                                              geoDB.update(
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
                                return geoDB.update(
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
                  geoData.urls.forEach((url) => {
                    datas$.push(geoDB.delete(url));
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
