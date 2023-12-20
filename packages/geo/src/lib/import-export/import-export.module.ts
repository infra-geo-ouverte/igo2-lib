import { ModuleWithProviders, NgModule } from '@angular/core';

import { ExportButtonComponent } from './export-button/export-button.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { DropGeoFileDirective } from './shared/drop-geo-file.directive';

/**
 * @deprecated import the components directly or IMPORT_EXPORT_DIRECTIVES for the set
 */
@NgModule({
  imports: [ImportExportComponent, DropGeoFileDirective, ExportButtonComponent],
  exports: [ImportExportComponent, DropGeoFileDirective, ExportButtonComponent]
})
export class IgoImportExportModule {
  static forRoot(): ModuleWithProviders<IgoImportExportModule> {
    return {
      ngModule: IgoImportExportModule
    };
  }
}
