import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';
import { downloadContent } from '@igo2/utils';

import { DetailedContext } from '../../context-manager/shared/context.interface';
import { ExportNothingToExportError } from './context-export.errors';
import { Observer, Observable } from 'rxjs';

import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

@Injectable({
  providedIn: 'root'
})
export class ContextExportIonicService {

  constructor(
    private config: ConfigService,
    private platform: Platform,
    private fileOpener: FileOpener,
    private file: File
    ) {
  }

  export(res: DetailedContext): Observable<void> {
    return this.exportAsync(res);
  }

  exportAsync(res: DetailedContext): Observable<void> {
    const doExport = (observer: Observer<void>) => {
        const nothingToExport = this.nothingToExport(res);
        if (nothingToExport === true) {
            observer.error(new ExportNothingToExportError());
            return;
        }

        const contextJSON = JSON.stringify(res);

        if (this.platform.is('cordova')) {
            const directory = this.file.externalRootDirectory + 'Download';
            this.file.writeFile(directory, `${res.uri}.json`, contextJSON, { replace: true }).then((success) =>
            this.fileOpener.open(directory + '/' + `${res.uri}.json`, 'text/plain'));
            observer.complete();
        } else {
            downloadContent(contextJSON, 'text/json;charset=utf-8', `${res.uri}.json`);
            observer.complete();
        }
    };
    return new Observable(doExport);
  }

  private nothingToExport(res: DetailedContext): boolean {
    if (res.map === undefined) {
      return true;
    }
    return false;
  }
}
