import { StyleEngineKind } from '../shared/style.enum';
import { StyleEngineFeature } from '../shared/style.interface';
import { STYLE_ENGINES } from '../style.provider';
import { GeostylerService } from './geostyler.service';

export function withGeostyler(): StyleEngineFeature<StyleEngineKind.Geostyler> {
  return {
    kind: StyleEngineKind.Geostyler,
    providers: [
      GeostylerService,
      { provide: STYLE_ENGINES, useExisting: GeostylerService, multi: true }
    ]
  };
}
