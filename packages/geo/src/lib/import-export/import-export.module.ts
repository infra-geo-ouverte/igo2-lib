import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
