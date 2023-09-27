import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { ExportOptions } from '@igo2/geo';

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
  readonly importExportType$: BehaviorSubject<ImportExportType> =
    new BehaviorSubject(ImportExportType.layer);
  readonly selectedMode$: BehaviorSubject<ImportExportMode> =
    new BehaviorSubject(ImportExportMode.import);
  readonly exportOptions$: BehaviorSubject<ExportOptions> = new BehaviorSubject(
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
