import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';
import {
  IgoMapModule,
  IgoImportExportModule,
  provideStyleListOptions,
  IgoStyleModule
} from '@igo2/geo';

import { AppImportExportComponent } from './import-export.component';
import { AppImportExportRoutingModule } from './import-export-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppImportExportComponent],
  imports: [
    AppImportExportRoutingModule,
    SharedModule,
    IgoMessageModule,
    IgoMapModule,
    IgoStyleModule,
    IgoImportExportModule
  ],
  exports: [AppImportExportComponent],
  providers: [
    provideStyleListOptions({
      path: './assets/import-style.json'
    })
  ]
})
export class AppImportExport {}
