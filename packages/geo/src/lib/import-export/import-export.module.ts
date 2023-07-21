import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';
import { IgoKeyValueModule, IgoDrapDropModule, IgoSpinnerModule, IgoCustomHtmlModule } from '@igo2/common';

import { ExportButtonComponent } from './export-button/export-button.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { DropGeoFileDirective } from './shared/drop-geo-file.directive';

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
    IgoCustomHtmlModule
  ],
  exports: [ImportExportComponent, DropGeoFileDirective, ExportButtonComponent],
  declarations: [ImportExportComponent, DropGeoFileDirective, ExportButtonComponent]
})
export class IgoImportExportModule {
  static forRoot(): ModuleWithProviders<IgoImportExportModule> {
    return {
      ngModule: IgoImportExportModule
    };
  }
}
