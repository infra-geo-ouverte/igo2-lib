import { Injectable, inject } from '@angular/core';

import { Observable, mergeMap, of } from 'rxjs';

import { GeostylerService } from '../geostyler/geostyler.service';
import { isGeostylerLayerStyle, isOlStyleLikeOrFlatLike } from '../shared';
import {
  HandledLayerStyle,
  OlStyleLikeOrFlatLike
} from '../shared/layer/layer-style.interface';

@Injectable()
export class StyleService {
  constructor() {}
  private geostylerService = inject(GeostylerService, { optional: true });

  getLayerOlStyle(
    options: HandledLayerStyle
  ): Observable<OlStyleLikeOrFlatLike> {
    if (isGeostylerLayerStyle(options)) {
      if (this.geostylerService) {
        return this.geostylerService
          .geostylerToOl(options.style)
          .pipe(mergeMap((wo) => of(wo.output)));
      } else {
        console.error(
          'Your app is not build to handle geostyler styles formats. You must provide withGeostyler()'
        );
      }
    }
    return isOlStyleLikeOrFlatLike(options) ? of(options) : of(undefined);
  }

  getLegendFromLayerStyle(options: HandledLayerStyle): Observable<string> {
    if (isGeostylerLayerStyle(options)) {
      if (this.geostylerService) {
        return this.geostylerService.geostylerStyleToLegend(options.style);
      } else {
        console.error(
          'Your app is not build to handle geostyler styles formats. You must provide withGeostyler()'
        );
      }
    }
    return of(undefined);
  }
}
