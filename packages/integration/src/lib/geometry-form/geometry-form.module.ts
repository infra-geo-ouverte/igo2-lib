import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { IgoFormModule } from '@igo2/common/form';
import { IgoLanguageModule } from '@igo2/core/language';
import { IgoMessageModule } from '@igo2/core/message';

import { DataIssueReporterToolComponent } from './data-issue-reporter-tool/data-issue-reporter-tool.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoMessageModule
  ],
  declarations: [DataIssueReporterToolComponent],
  exports: [DataIssueReporterToolComponent],
  schemas: []
})
export class IgoAppGeometryFormModule {}
