import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { ImportExportComponent } from './import-export';
import { ImportExportService, DropGeoFileDirective } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    ImportExportComponent,
    DropGeoFileDirective
  ],
  declarations: [
    ImportExportComponent,
    DropGeoFileDirective
  ]
})
export class IgoImportExportModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoImportExportModule,
      providers: [
        ImportExportService
      ]
    };
  }
}
