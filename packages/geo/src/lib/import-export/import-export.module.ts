import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatTabsModule,
  MatSelectModule,
  MatOptionModule,
  MatFormFieldModule,
  MatInputModule,
  MatSlideToggleModule,
  MatIconModule,
  MatTooltipModule,
  MatButtonToggleModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoKeyValueModule, IgoDrapDropModule, IgoSpinnerModule } from '@igo2/common';

import { ExportButtonComponent } from './export-button/export-button.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { DropGeoFileDirective } from './shared/drop-geo-file.directive';
import { IgoStyleListModule } from './style-list/style-list.module';

@NgModule({
  imports: [
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    IgoLanguageModule,
    IgoSpinnerModule,
    IgoKeyValueModule,
    IgoDrapDropModule,
    IgoStyleListModule.forRoot()
  ],
  exports: [ImportExportComponent, DropGeoFileDirective, IgoStyleListModule, ExportButtonComponent],
  declarations: [ImportExportComponent, DropGeoFileDirective, ExportButtonComponent]
})
export class IgoImportExportModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoImportExportModule
    };
  }
}
