import { Directive, EventEmitter } from '@angular/core';

import { DragAndDropDirective } from '@igo2/common';
import { ImportExportService } from './import-export.service';

@Directive({
  selector: '[igoDropGeoFile]'
})
export class DropGeoFileDirective extends DragAndDropDirective {
  protected _allowed_extensions: Array<string> = [];
  protected filesDropped: EventEmitter<File[]> = new EventEmitter();
  protected filesInvalid: EventEmitter<File[]> = new EventEmitter();

  constructor(importExportService: ImportExportService) {
    super();
    this.allowed_extensions = ['zip', 'geojson', 'kml', 'gml', 'json'];
    this.filesDropped.subscribe(f => importExportService.import(f));
    this.filesInvalid.subscribe(f => importExportService.onFilesInvalid(f));
  }
}
