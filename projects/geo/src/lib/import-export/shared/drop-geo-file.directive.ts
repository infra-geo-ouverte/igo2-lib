import { Directive, EventEmitter, HostListener } from '@angular/core';

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

  @HostListener('dragover', ['$event'])
  public onDragOver(evt) {
    super.onDragOver(evt);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt) {
    super.onDragLeave(evt);
  }

  @HostListener('drop', ['$event'])
  public onDrop(evt) {
    super.onDrop(evt);
  }
}
