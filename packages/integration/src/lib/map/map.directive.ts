import { AdvancedMapToolComponent } from './advanced-map-tool';
import { MapDetailsToolComponent } from './map-details-tool';
import { MapLegendToolComponent } from './map-legend';
import { MapProximityToolComponent } from './map-proximity-tool';
import { MapToolComponent } from './map-tool';
import { MapToolsComponent } from './map-tools';

export const INTEGRATION_MAP_DIRECTIVES = [
  AdvancedMapToolComponent,
  MapProximityToolComponent,
  MapToolComponent,
  MapToolsComponent,
  MapDetailsToolComponent,
  MapLegendToolComponent
] as const;
