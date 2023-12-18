import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';
import {
  IgoImportExportModule,
  IgoMapModule,
  IgoStyleModule,
  provideStyleListOptions
} from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppImportExportRoutingModule } from './import-export-routing.module';
import { AppImportExportComponent } from './import-export.component';

@NgModule({
  imports: [
    AppImportExportRoutingModule,
    SharedModule,
    IgoMessageModule,
    IgoMapModule,
    IgoStyleModule,
    IgoImportExportModule,
    AppImportExportComponent
  ],
  exports: [AppImportExportComponent],
  providers: [
    provideStyleListOptions({
      path: './assets/import-style.json'
    })
  ]
})
export class AppImportExport {}
