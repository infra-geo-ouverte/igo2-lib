import { ModuleWithProviders, NgModule } from '@angular/core';

import { ImportExportToolComponent } from './import-export-tool/import-export-tool.component';

/**
 * @deprecated import the ImportExportToolComponent directly
 */
@NgModule({
  imports: [ImportExportToolComponent],
  exports: [ImportExportToolComponent]
})
export class IgoAppImportExportModule {
  static forRoot(): ModuleWithProviders<IgoAppImportExportModule> {
    return {
      ngModule: IgoAppImportExportModule,
      providers: []
    };
  }
}
