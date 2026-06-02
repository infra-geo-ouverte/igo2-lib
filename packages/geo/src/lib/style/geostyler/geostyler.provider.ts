import { StyleEngineFeature } from '../shared/style.interface';
import { STYLE_ENGINES } from '../style.provider';
import { GeostylerService } from './geostyler.service';

export function withGeostyler(): StyleEngineFeature<'Geostyler'> {
  return {
    kind: 'Geostyler',
    providers: [
      GeostylerService,
      { provide: STYLE_ENGINES, useExisting: GeostylerService, multi: true }
    ]
  };
}
