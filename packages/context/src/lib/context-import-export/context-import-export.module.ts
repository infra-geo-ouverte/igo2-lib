import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoSpinnerModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { ContextImportExportComponent } from './context-import-export/context-import-export.component';

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
    MatTooltipModule
  ],
  exports: [ContextImportExportComponent],
  declarations: [ContextImportExportComponent]
})
export class IgoContextImportExportModule {
  static forRoot(): ModuleWithProviders<IgoContextImportExportModule> {
    return {
      ngModule: IgoContextImportExportModule
    };
  }
}
