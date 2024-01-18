import { ShareMapApiComponent } from './share-map/share-map-api.component';
import { ShareMapUrlComponent } from './share-map/share-map-url.component';
import { ShareMapComponent } from './share-map/share-map.component';

export * from './shared';
export * from './share-map/share-map.component';
export * from './share-map/share-map-url.component';
export * from './share-map/share-map-api.component';

export const SHARE_MAP_DIRECTIVES = [
  ShareMapComponent,
  ShareMapUrlComponent,
  ShareMapApiComponent
] as const;
