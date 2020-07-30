import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatDividerModule,
  MatTabsModule,
  MatSelectModule,
  MatOptionModule,
  MatTooltipModule,
  MatCheckboxModule,
  MatButtonToggleModule,
} from '@angular/material';
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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoContextImportExportModule
    };
  }
}
