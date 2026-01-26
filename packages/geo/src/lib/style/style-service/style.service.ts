import { Injectable } from '@angular/core';

import { isAnyOlStyle, LayerRandomOlStyleFunction } from '../shared';
import { AnyOlStyle, AnyStyle } from '../shared/layer/layer-style.interface';

@Injectable()
export class StyleService {
  async getStyle(options: AnyStyle): Promise<AnyOlStyle> {
    return isAnyOlStyle(options) ? options : LayerRandomOlStyleFunction();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getLegend(options: AnyStyle): Promise<string | undefined> {
    return undefined;
  }
}
