import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { isAnyOlStyle } from '../shared';
import {
  AnyStyle,
  AnyOlStyle
} from '../shared/layer/layer-style.interface';

@Injectable()
export class StyleService {
  getStyle(
    options: AnyStyle
  ): Observable<AnyOlStyle> {
    return isAnyOlStyle(options) ? of(options) : of(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLegend(options: AnyStyle): Observable<string> {
    return of(undefined);
  }
}
