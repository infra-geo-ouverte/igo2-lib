import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { IgoMessageModule } from '@igo2/core';
import {
  IgoMapModule,
  IgoImportExportModule,
  provideStyleListOptions,
  IgoStyleModule
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
