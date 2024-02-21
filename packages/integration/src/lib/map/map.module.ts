import { ModuleWithProviders, NgModule } from '@angular/core';

import { AdvancedMapToolComponent } from './advanced-map-tool/advanced-map-tool.component';
import { MapDetailsToolComponent } from './map-details-tool/map-details-tool.component';
import { MapLegendToolComponent } from './map-legend/map-legend-tool.component';
import { MapProximityToolComponent } from './map-proximity-tool/map-proximity-tool.component';
import { MapToolComponent } from './map-tool/map-tool.component';
import { MapToolsComponent } from './map-tools/map-tools.component';

/**
 * @deprecated import the ImportExportToolComponent directly or INTEGRATION_MAP_DIRECTIVES for the set
 */
@NgModule({
  imports: [
    AdvancedMapToolComponent,
    MapProximityToolComponent,
    MapToolComponent,
    MapToolsComponent,
    MapDetailsToolComponent,
    MapLegendToolComponent
  ],
  exports: [
    AdvancedMapToolComponent,
    MapProximityToolComponent,
    MapToolComponent,
    MapToolsComponent,
    MapDetailsToolComponent,
    MapLegendToolComponent
  ]
})
export class IgoAppMapModule {
  static forRoot(): ModuleWithProviders<IgoAppMapModule> {
    return {
      ngModule: IgoAppMapModule,
      providers: []
    };
  }
}
