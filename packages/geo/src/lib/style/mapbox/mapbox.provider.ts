import { StyleEngineKind } from '../shared/style.enum';
import { StyleEngineFeature } from '../shared/style.interface';
import { STYLE_ENGINES } from '../style.provider';
import { MapboxService } from './mapbox.service';

export function withMapbox(): StyleEngineFeature<StyleEngineKind.Mapbox> {
  return {
    kind: StyleEngineKind.Mapbox,
    providers: [
      MapboxService,
      { provide: STYLE_ENGINES, useExisting: MapboxService, multi: true }
    ]
  };
}
