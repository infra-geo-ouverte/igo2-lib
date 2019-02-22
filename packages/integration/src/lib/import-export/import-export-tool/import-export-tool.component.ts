import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'importExport',
  title: 'igo.integration.tools.importExport',
  icon: 'import_export'
})
@Component({
  selector: 'igo-import-export-tool',
  templateUrl: './import-export-tool.component.html'
})
export class ImportExportToolComponent {
  constructor() {}
}
