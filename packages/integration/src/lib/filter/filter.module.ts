import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoFilterModule, IgoQueryModule, IgoImportExportModule } from '@igo2/geo';
import { OgcFilterToolComponent } from './ogc-filter-tool/ogc-filter-tool.component';
import { TimeFilterToolComponent } from './time-filter-tool/time-filter-tool.component';
import { SpatialFilterToolComponent } from './spatial-filter-tool/spatial-filter-tool.component';
import { SpatialFilterExportToolComponent } from './spatial-filter-export-tool/spatial-filter-export-tool.component';
import { ActiveTimeFilterToolComponent } from './active-time-filter-tool/active-time-filter-tool.component';
import { ActiveOgcFilterToolComponent } from './active-ogc-filter-tool/active-ogc-filter-tool.component';

@NgModule({
  imports: [IgoFilterModule, IgoQueryModule, CommonModule, IgoImportExportModule],
  declarations: [
    OgcFilterToolComponent,
    ActiveOgcFilterToolComponent,
    TimeFilterToolComponent,
    ActiveTimeFilterToolComponent,
    SpatialFilterToolComponent,
    SpatialFilterExportToolComponent
  ],
  exports: [
    OgcFilterToolComponent,
    ActiveOgcFilterToolComponent,
    TimeFilterToolComponent,
    ActiveTimeFilterToolComponent,
    SpatialFilterToolComponent,
    SpatialFilterExportToolComponent
  ],
  entryComponents: [
    OgcFilterToolComponent,
    ActiveOgcFilterToolComponent,
    TimeFilterToolComponent,
    ActiveTimeFilterToolComponent,
    SpatialFilterToolComponent,
    SpatialFilterExportToolComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppFilterModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAppFilterModule,
      providers: []
    };
  }
}
