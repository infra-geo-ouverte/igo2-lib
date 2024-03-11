import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { Observable, Observer } from 'rxjs';

import { DetailedContext } from '../../context-manager/shared/context.interface';
import {
  ImportInvalidFileError,
  ImportSizeError,
  ImportUnreadableFileError
} from './context-import.errors';
import { getFileExtension } from './context-import.utils';

@Injectable({
  providedIn: 'root'
})
export class ContextImportService {
  static allowedMimeTypes = ['application/json'];

  static allowedExtensions = 'json';

  private clientSideFileSizeMax: number;

  constructor(private config: ConfigService) {
    const configFileSizeMb = this.config.getConfig(
      'importExport.clientSideFileSizeMaxMb'
    );
    this.clientSideFileSizeMax =
      (configFileSizeMb ? configFileSizeMb : 30) * Math.pow(1024, 2);
  }

  import(file: File): Observable<DetailedContext> {
    return this.importAsync(file);
  }

  private getFileImporter(
    file: File
  ): (
    file: File,
    observer: Observer<DetailedContext>,
    projectionIn: string,
    projectionOut: string
  ) => void {
    const extension = getFileExtension(file);
    const mimeType = file.type;
    const allowedMimeTypes = [...ContextImportService.allowedMimeTypes];
    const allowedExtensions = ContextImportService.allowedExtensions;

    if (
      allowedMimeTypes.indexOf(mimeType) < 0 &&
      allowedExtensions.indexOf(extension) < 0
    ) {
      return undefined;
    } else if (
      mimeType === 'application/json' ||
      extension === ContextImportService.allowedExtensions
    ) {
      return this.importFile;
    }
    return undefined;
  }

  private importAsync(file: File): Observable<DetailedContext> {
    const doImport = (observer: Observer<DetailedContext>) => {
      if (file.size >= this.clientSideFileSizeMax) {
        observer.error(new ImportSizeError());
        return;
      }
      const importer = this.getFileImporter(file);
      if (importer === undefined) {
        observer.error(new ImportInvalidFileError());
        return;
      }

      importer.call(this, file, observer);
    };

    return new Observable(doImport);
  }

  private importFile(file: File, observer: Observer<DetailedContext>) {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      try {
        const context = this.parseContextFromFile(file, event.target.result);
        observer.next(context);
      } catch (e) {
        observer.error(new ImportUnreadableFileError());
      }

      observer.complete();
    };

    reader.onerror = (evt) => {
      observer.error(new ImportUnreadableFileError());
    };

    reader.readAsText(file, 'UTF-8');
  }

  private parseContextFromFile(file: File, data: string): DetailedContext {
    const context: DetailedContext = JSON.parse(data);
    return context;
  }
}
