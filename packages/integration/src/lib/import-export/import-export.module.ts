import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoImportExportModule } from '@igo2/geo';
import { ImportExportToolComponent } from './import-export-tool/import-export-tool.component';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';

import { IgoLanguageModule } from '@igo2/core';
import { IgoContextImportExportModule } from '@igo2/context';

@NgModule({
  imports: [
    IgoImportExportModule,
    IgoContextImportExportModule,
    CommonModule,
    IgoLanguageModule,
    MatButtonToggleModule,
    MatTabsModule
  ],
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
