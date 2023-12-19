import { Injectable } from '@angular/core';

import { downloadContent } from '@igo2/utils';

import { Observable, Observer } from 'rxjs';

import { DetailedContext } from '../../context-manager/shared/context.interface';
import { ExportNothingToExportError } from './context-export.errors';

@Injectable({
  providedIn: 'root'
})
export class ContextExportService {
  export(res: DetailedContext): Observable<void> {
    return this.exportAsync(res);
  }

  protected exportAsync(res: DetailedContext): Observable<void> {
    const doExport = (observer: Observer<void>) => {
      const nothingToExport = this.nothingToExport(res);
      if (nothingToExport === true) {
        observer.error(new ExportNothingToExportError());
        return;
      }
      const contextJSON = JSON.stringify(res);
      downloadContent(
        contextJSON,
        'text/json;charset=utf-8',
        `${res.uri}.json`
      );
      observer.complete();
    };
    return new Observable(doExport);
  }

  protected nothingToExport(res: DetailedContext): boolean {
    if (res.map === undefined) {
      return true;
    }
    return false;
  }
}
