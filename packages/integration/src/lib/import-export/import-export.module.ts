import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoImportExportModule } from '@igo2/geo';
import { ImportExportToolComponent } from './import-export-tool/import-export-tool.component';
import { CommonModule } from '@angular/common';
import { IgoContextImportExportModule } from '@igo2/context';
import { MatRadioModule } from '@angular/material';
import { IgoLanguageModule } from '@igo2/core';

@NgModule({
  imports: [
    IgoImportExportModule,
    IgoContextImportExportModule,
    MatRadioModule,
    CommonModule,
    IgoLanguageModule
  ],
  declarations: [ImportExportToolComponent],
  exports: [ImportExportToolComponent],
  entryComponents: [ImportExportToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppImportExportModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAppImportExportModule,
      providers: []
    };
  }
}
