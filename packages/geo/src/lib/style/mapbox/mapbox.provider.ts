import { StyleEngineFeature } from '../shared/style.interface';
import { STYLE_ENGINES } from '../style.provider';
import { MapboxService } from './mapbox.service';

export function withMapbox(): StyleEngineFeature<'Mapbox'> {
  return {
    kind: 'Mapbox',
    providers: [
      MapboxService,
      { provide: STYLE_ENGINES, useExisting: MapboxService, multi: true }
    ]
  };
}
