import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ActiveToast, MessageService } from '@igo2/core/message';

import { default as JSZip } from 'jszip';
import { Observable, forkJoin, from, of } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';

import { InsertSourceInsertDBEnum } from './geo-data.enums';
import { DatasToIDB, GeoDBData, GeoDataToIDB } from './geo-data.interface';
import { GeoDB } from './geo-db';

/** Delay before dismissing the "download completed" toast, so it stays legible for a moment. */
const DOWNLOAD_COMPLETED_DELAY_MS = 2500;
const TOAST_TIMEOUT_MS = 40000;

interface DownloadState {
  toast?: ActiveToast;
}

@Injectable()
export class GeoDataSyncService {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);

  load(urlFile: string): void {
    const geoDB = new GeoDB();
    const downloadState: DownloadState = {};

    this.http
      .get<DatasToIDB>(urlFile)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleConfigFileError(urlFile, error)
        ),
        concatMap((datasToIDB) =>
          this.processGeoDatas(geoDB, datasToIDB?.geoDatas ?? [], downloadState)
        )
      )
      .subscribe(() => this.notifyDownloadCompleted(downloadState));
  }

  private handleConfigFileError(
    urlFile: string,
    error: HttpErrorResponse
  ): never {
    this.messageService.error(`GeoData file ${urlFile} could not be read`);
    error.error.caught = true;
    throw error;
  }

  private processGeoDatas(
    geoDB: GeoDB,
    geoDatas: GeoDataToIDB[],
    downloadState: DownloadState
  ): Observable<unknown> {
    const currentDate = new Date();
    const operations: Observable<unknown>[] = [];

    for (const geoData of geoDatas) {
      if (typeof geoData.triggerDate === 'string') {
        geoData.triggerDate = new Date(Date.parse(geoData.triggerDate));
      }
      if (currentDate < geoData.triggerDate) {
        continue;
      }

      if (geoData.action === 'update') {
        operations.push(...this.updateGeoData(geoDB, geoData, downloadState));
      } else if (geoData.action === 'delete') {
        operations.push(...geoData.urls.map((url) => geoDB.delete(url)));
      }
    }

    return forkJoin(operations);
  }

  private updateGeoData(
    geoDB: GeoDB,
    geoData: GeoDataToIDB,
    downloadState: DownloadState
  ): Observable<unknown>[] {
    const insertEvent = `${
      geoData.source || InsertSourceInsertDBEnum.System
    } (${geoData.triggerDate})`;

    return geoData.urls.map((url) =>
      geoDB
        .getGeoDBData(url)
        .pipe(
          concatMap((existing: GeoDBData | undefined) =>
            existing?.insertEvent === insertEvent
              ? of(false)
              : this.downloadAndStore(
                  geoDB,
                  url,
                  geoData,
                  insertEvent,
                  downloadState
                )
          )
        )
    );
  }

  private downloadAndStore(
    geoDB: GeoDB,
    url: string,
    geoData: GeoDataToIDB,
    insertEvent: string,
    downloadState: DownloadState
  ): Observable<unknown> {
    this.showDownloadStartMessage(downloadState);
    const isZip = this.isZip(url);
    const download$ = isZip
      ? this.http.get(url, { responseType: 'arraybuffer' })
      : this.http.get<object>(url, { responseType: 'json' });

    return download$.pipe(
      catchError((error: HttpErrorResponse) =>
        this.handleDownloadError(downloadState, error)
      ),
      concatMap((response) =>
        isZip
          ? this.storeZippedGeoData(
              geoDB,
              response as ArrayBuffer,
              url,
              geoData,
              insertEvent
            )
          : geoDB.update(
              url,
              url,
              response,
              InsertSourceInsertDBEnum.System,
              insertEvent
            )
      )
    );
  }

  private handleDownloadError(
    downloadState: DownloadState,
    error: HttpErrorResponse
  ): never {
    if (downloadState.toast) {
      this.messageService.remove(downloadState.toast.toastId);
    }
    this.messageService.error(
      'igo.geo.indexedDb.data-download-failed',
      undefined,
      { timeOut: TOAST_TIMEOUT_MS }
    );
    error.error.caught = true;
    throw error;
  }

  private storeZippedGeoData(
    geoDB: GeoDB,
    archive: ArrayBuffer,
    url: string,
    geoData: GeoDataToIDB,
    insertEvent: string
  ): Observable<GeoDBData[]> {
    return from(
      this.extractZipGeojsonEntries(archive, geoData.zippedBaseUrl)
    ).pipe(
      concatMap((entries) =>
        forkJoin([
          // the archive itself is tracked so future loads can detect it was already processed
          geoDB.update(
            url,
            url,
            {},
            InsertSourceInsertDBEnum.System,
            insertEvent
          ),
          ...entries.map(({ zippedUrl, geojson }) =>
            geoDB.update(
              zippedUrl,
              url,
              geojson,
              InsertSourceInsertDBEnum.System,
              insertEvent
            )
          )
        ])
      )
    );
  }

  private async extractZipGeojsonEntries(
    archive: ArrayBuffer,
    zippedBaseUrl = ''
  ): Promise<{ zippedUrl: string; geojson: object }[]> {
    const zipped = await JSZip.loadAsync(archive);
    const baseUrl = zippedBaseUrl.endsWith('/')
      ? zippedBaseUrl
      : `${zippedBaseUrl}/`;
    const geojsonPaths = Object.keys(zipped.files).filter((relativePath) =>
      relativePath.toLowerCase().endsWith('.geojson')
    );

    return Promise.all(
      geojsonPaths.map(async (relativePath) => ({
        zippedUrl: `${baseUrl}${relativePath}`,
        geojson: JSON.parse(await zipped.file(relativePath)!.async('text'))
      }))
    );
  }

  private showDownloadStartMessage(downloadState: DownloadState): void {
    if (downloadState.toast) {
      return;
    }
    downloadState.toast = this.messageService.info(
      'igo.geo.indexedDb.data-download-start',
      undefined,
      {
        disableTimeOut: true,
        progressBar: false,
        closeButton: true,
        tapToDismiss: false
      }
    );
  }

  private notifyDownloadCompleted(downloadState: DownloadState): void {
    if (!downloadState.toast) {
      return;
    }
    const toast = downloadState.toast;
    setTimeout(() => {
      this.messageService.remove(toast.toastId);
      this.messageService.success(
        'igo.geo.indexedDb.data-download-completed',
        undefined,
        { timeOut: TOAST_TIMEOUT_MS }
      );
    }, DOWNLOAD_COMPLETED_DELAY_MS);
  }

  private isZip(value: unknown): boolean {
    const regex = /(zip)$/;
    return typeof value === 'string' && regex.test(value.toLowerCase());
  }
}
