import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import {
  MatIconModule,
  MatButtonModule,
  MatTableModule,
  MatFormFieldModule,
  MatInputModule,
  MatSortModule,
  MatCheckboxModule
} from '@angular/material';

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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoTableModule,
      providers: []
    };
  }
}
