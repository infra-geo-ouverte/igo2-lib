import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatTabsModule,
  MatSelectModule,
  MatOptionModule,
  MatFormFieldModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoCommonModule } from '@igo2/common';

import { ImportExportComponent } from './import-export/import-export.component';
import { DropGeoFileDirective } from './shared/drop-geo-file.directive';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatTabsModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    IgoLanguageModule,
    IgoCommonModule
  ],
  exports: [ImportExportComponent, DropGeoFileDirective],
  declarations: [ImportExportComponent, DropGeoFileDirective]
})
export class IgoImportExportModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoImportExportModule
    };
  }
}
