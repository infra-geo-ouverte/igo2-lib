import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { isOlStyleLikeOrFlatLike } from '../shared';
import {
  HandledLayerStyle,
  OlStyleLikeOrFlatLike
} from '../shared/layer/layer-style.interface';

@Injectable()
export class StyleService {
  constructor() {}
  getLayerOlStyle(
    options: HandledLayerStyle
  ): Observable<OlStyleLikeOrFlatLike> {
    return isOlStyleLikeOrFlatLike(options) ? of(options) : of(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLegendFromLayerStyle(options: HandledLayerStyle): Observable<string> {
    return of(undefined);
  }
}
