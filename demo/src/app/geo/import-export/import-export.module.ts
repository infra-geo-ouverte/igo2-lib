import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoMessageModule } from '@igo2/core';
import { IgoMapModule, IgoImportExportModule } from '@igo2/geo';

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
  exports: [AppImportExportComponent]
})
export class AppImportExport {}
