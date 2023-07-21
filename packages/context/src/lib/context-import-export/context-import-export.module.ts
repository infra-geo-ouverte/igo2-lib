import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

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
