import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoImportExportModule } from '@igo2/geo';
import { ImportExportToolComponent } from './import-export-tool/import-export-tool.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [IgoImportExportModule, CommonModule],
  declarations: [ImportExportToolComponent],
  exports: [ImportExportToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppImportExportModule {
  static forRoot(): ModuleWithProviders<IgoAppImportExportModule> {
    return {
      ngModule: IgoAppImportExportModule,
      providers: []
    };
  }
}
