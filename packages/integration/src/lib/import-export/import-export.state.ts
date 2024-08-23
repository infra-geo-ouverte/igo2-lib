import { Injectable } from '@angular/core';

import { ExportOptions } from '@igo2/geo';

import { BehaviorSubject } from 'rxjs';

export enum ImportExportType {
  layer = 'layer',
  context = 'context'
}

export enum ImportExportMode {
  import = 'import',
  export = 'export'
}

/**
 * Service that holds the state of the importExport module
 */
@Injectable({
  providedIn: 'root'
})
export class ImportExportState {
  readonly importExportType$ =
    new BehaviorSubject<ImportExportType>(ImportExportType.layer);
  readonly selectedMode$ =
    new BehaviorSubject<ImportExportMode>(ImportExportMode.import);
  readonly exportOptions$ = new BehaviorSubject<ExportOptions>(
    undefined
  );

  setImportExportType(type: ImportExportType) {
    this.importExportType$.next(type);
  }

  setMode(mode: ImportExportMode) {
    this.selectedMode$.next(mode);
  }

  setsExportOptions(exportOptions: ExportOptions) {
    this.exportOptions$.next(exportOptions);
  }
}
