import { ModuleWithProviders, NgModule } from '@angular/core';

import { ActiveOgcFilterToolComponent } from './active-ogc-filter-tool/active-ogc-filter-tool.component';
import { ActiveTimeFilterToolComponent } from './active-time-filter-tool/active-time-filter-tool.component';
import { OgcFilterToolComponent } from './ogc-filter-tool/ogc-filter-tool.component';
import { SpatialFilterToolComponent } from './spatial-filter-tool/spatial-filter-tool.component';
import { TimeFilterToolComponent } from './time-filter-tool/time-filter-tool.component';

/**
 * @deprecated import the components directly or INTEGRATION_FILTER_DIRECTIVES for the set
 */
@NgModule({
  imports: [
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
  ]
})
export class IgoAppFilterModule {
  static forRoot(): ModuleWithProviders<IgoAppFilterModule> {
    return {
      ngModule: IgoAppFilterModule,
      providers: []
    };
  }
}
