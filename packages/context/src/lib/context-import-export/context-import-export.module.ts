import { ModuleWithProviders, NgModule } from '@angular/core';

import { ContextImportExportComponent } from './context-import-export/context-import-export.component';

/**
 * @deprecated import the ContextImportExportComponent directly
 */
@NgModule({
  imports: [ContextImportExportComponent],
  exports: [ContextImportExportComponent]
})
export class IgoContextImportExportModule {
  static forRoot(): ModuleWithProviders<IgoContextImportExportModule> {
    return {
      ngModule: IgoContextImportExportModule
    };
  }
}
