import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { IgoLanguageModule } from '@igo2/core';

import { TableComponent } from './table.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CdkTableModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatCheckboxModule,
    IgoLanguageModule
  ],
  declarations: [TableComponent],
  exports: [TableComponent]
})
export class IgoTableModule {
  static forRoot(): ModuleWithProviders<IgoTableModule> {
    return {
      ngModule: IgoTableModule,
      providers: []
    };
  }
}
