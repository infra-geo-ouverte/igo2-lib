import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { IgoFormModule } from '@igo2/common';
import { IgoLanguageModule, IgoMessageModule } from '@igo2/core';
import { IgoGeometryModule, IgoMapModule } from '@igo2/geo';

import { DataIssueReporterToolComponent } from './data-issue-reporter-tool/data-issue-reporter-tool.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFormModule,
    IgoGeometryModule,
    IgoMapModule,
    IgoMessageModule
  ],
  declarations: [DataIssueReporterToolComponent],
  exports: [DataIssueReporterToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppGeometryFormModule {
  static forRoot(): ModuleWithProviders<IgoAppGeometryFormModule> {
    return {
      ngModule: IgoAppGeometryFormModule,
      providers: []
    };
  }
}
