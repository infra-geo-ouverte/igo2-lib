import { Directive } from '@angular/core';

import { DragAndDropDirective } from '../../shared/drag-drop';
import { ImportExportService } from './import-export.service';

@Directive({
  selector: '[igoDropGeoFile]'
})
export class DropGeoFileDirective extends DragAndDropDirective {

  constructor(importExportService: ImportExportService) {
    super();
    this.allowed_extensions = ['zip', 'geojson', 'kml', 'gml'];
    this.filesDropped.subscribe((f) => importExportService.import(f));
    this.filesInvalid.subscribe((f) => importExportService.onFilesInvalid(f));
  }

}
