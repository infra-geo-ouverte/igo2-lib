import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { IgoMessageModule } from '@igo2/core';
import {
  IgoMapModule,
  IgoImportExportModule,
  provideStyleListOptions
} from '@igo2/geo';

import { AppImportExportComponent } from './import-export.component';
import { AppImportExportRoutingModule } from './import-export-routing.module';

@NgModule({
  declarations: [AppImportExportComponent],
  imports: [
    AppImportExportRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMessageModule,
    IgoMapModule,
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
