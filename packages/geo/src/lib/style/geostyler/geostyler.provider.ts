import { inject, provideAppInitializer } from '@angular/core';

import { StyleFeature, StyleFeatureKind } from '../shared/style.interface';
import { GeostylerService } from './geostyler.service';

export function withGeostyler(): StyleFeature<StyleFeatureKind.Geostyler> {
  return {
    kind: StyleFeatureKind.Geostyler,
    providers: [
      {
        provide: GeostylerService,
        useClass: GeostylerService,
        deps: []
      },
      // Force instantiate GeostylerService service to avoid require it in any constructor.
      provideAppInitializer(() => {
        inject(GeostylerService);
        return;
      })
    ]
  };
}
