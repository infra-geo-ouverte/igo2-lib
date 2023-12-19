import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule
} from '@angular/core';

import { IgoFilterModule, IgoQueryModule } from '@igo2/geo';

import { ActiveOgcFilterToolComponent } from './active-ogc-filter-tool/active-ogc-filter-tool.component';
import { ActiveTimeFilterToolComponent } from './active-time-filter-tool/active-time-filter-tool.component';
import { OgcFilterToolComponent } from './ogc-filter-tool/ogc-filter-tool.component';
import { SpatialFilterToolComponent } from './spatial-filter-tool/spatial-filter-tool.component';
import { TimeFilterToolComponent } from './time-filter-tool/time-filter-tool.component';

@NgModule({
  imports: [IgoFilterModule, IgoQueryModule, CommonModule],
  declarations: [
    OgcFilterToolComponent,
    ActiveOgcFilterToolComponent,
    TimeFilterToolComponent,
    ActiveTimeFilterToolComponent,
    SpatialFilterToolComponent
  ],
  exports: [
    OgcFilterToolComponent,
    ActiveOgcFilterToolComponent,
    TimeFilterToolComponent,
    ActiveTimeFilterToolComponent,
    SpatialFilterToolComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppFilterModule {
  static forRoot(): ModuleWithProviders<IgoAppFilterModule> {
    return {
      ngModule: IgoAppFilterModule,
      providers: []
    };
  }
}
