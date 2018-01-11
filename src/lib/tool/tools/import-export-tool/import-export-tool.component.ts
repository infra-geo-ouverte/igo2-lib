import { Component } from '@angular/core';

import { Register } from '../../shared';


@Register({
  name: 'importExport',
  title: 'igo.importExport',
  icon: 'import_export'
})
@Component({
  selector: 'igo-import-export-tool',
  templateUrl: './import-export-tool.component.html',
  styleUrls: ['./import-export-tool.component.styl']
})
export class ImportExportToolComponent {

  constructor() { }

}
