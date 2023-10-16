import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';

import { IgoContextImportExportModule } from '@igo2/context';
import { IgoLanguageModule } from '@igo2/core';
import { IgoImportExportModule, IgoStyleModule } from '@igo2/geo';

import { ImportExportToolComponent } from './import-export-tool/import-export-tool.component';

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
