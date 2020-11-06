import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { ExportOptions } from '@igo2/geo';

/**
 * Service that holds the state of the importExport module
 */
@Injectable({
  providedIn: 'root'
})
export class ImportExportState {

  readonly selectedMode$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  readonly exportOptions$: BehaviorSubject<ExportOptions> = new BehaviorSubject(undefined);

  setMode(mode: string) {
    this.selectedMode$.next(mode);
  }

  setsExportOptions(exportOptions: ExportOptions) {
      this.exportOptions$.next(exportOptions);
    }

}
