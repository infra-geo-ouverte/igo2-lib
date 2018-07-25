import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

@Register({
  name: 'importExport',
  title: 'igo.tools.importExport',
  icon: 'import_export'
})
@Component({
  selector: 'igo-import-export-tool',
  templateUrl: './import-export-tool.component.html'
})
export class ImportExportToolComponent {
  constructor() {}
}
