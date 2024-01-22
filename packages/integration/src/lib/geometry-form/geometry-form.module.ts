import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { IgoFormModule } from '@igo2/common';
import { IgoLanguageModule, IgoMessageModule } from '@igo2/core';
import { IgoGeometryModule } from '@igo2/geo';

import { DataIssueReporterToolComponent } from './data-issue-reporter-tool/data-issue-reporter-tool.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoGeometryModule,
    IgoMessageModule
  ],
  declarations: [DataIssueReporterToolComponent],
  exports: [DataIssueReporterToolComponent],
  schemas: []
})
export class IgoAppGeometryFormModule {}
