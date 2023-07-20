import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoLanguageModule } from '@igo2/core';
import { ContextImportExportComponent } from './context-import-export/context-import-export.component';
import { IgoSpinnerModule } from '@igo2/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatTabsModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    IgoLanguageModule,
    IgoSpinnerModule,
    MatTooltipModule,
  ],
  exports: [
    ContextImportExportComponent
  ],
  declarations: [
    ContextImportExportComponent
  ]
})
export class IgoContextImportExportModule {
  static forRoot(): ModuleWithProviders<IgoContextImportExportModule> {
    return {
      ngModule: IgoContextImportExportModule
    };
  }
}
