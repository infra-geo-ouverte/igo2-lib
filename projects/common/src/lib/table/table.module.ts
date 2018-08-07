import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import {
  MatIconModule,
  MatButtonModule,
  MatTableModule,
  MatFormFieldModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { TableComponent } from './table.component';

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
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
