import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoImportExportModule, IgoStyleModule } from '@igo2/geo';
import { ImportExportToolComponent } from './import-export-tool/import-export-tool.component';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';

import { IgoLanguageModule } from '@igo2/core';
import { IgoContextImportExportModule } from '@igo2/context';

@NgModule({
  imports: [
    IgoImportExportModule,
    IgoContextImportExportModule,
    CommonModule,
    IgoLanguageModule,
    MatButtonToggleModule,
    MatTabsModule,
    IgoStyleModule
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
