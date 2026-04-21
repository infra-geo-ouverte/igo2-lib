import { Injectable, inject } from '@angular/core';

import olLayerVector from 'ol/layer/Vector';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { AnyOlStyle, AnyStyle, BaseLayerStyle } from './shared/style.interface';
import { LayerRandomOlStyleFunction, isAnyOlStyle } from './shared/style.utils';
import { STYLE_ENGINES } from './style.provider';

export interface StyleEngine<T extends BaseLayerStyle = BaseLayerStyle> {
  readonly type: T['type'];
  supports(options: BaseLayerStyle): options is T;
  getStyle(options: T, ol?): Promise<AnyOlStyle>;
  getLegend?(options: T): Promise<string | undefined>;
}

@Injectable({ providedIn: 'root' })
export class StyleServiceV2 {
  private readonly engines = (
    inject(STYLE_ENGINES, { optional: true }) ?? []
  ).filter((e) => e && typeof e.supports === 'function');

  private getEngines(): StyleEngine[] {
    return this.engines ?? [];
  }

  async getStyle(
    options: AnyStyle,
    ol?: olLayerVector | olLayerVectorTile
  ): Promise<AnyOlStyle> {
    if (isAnyOlStyle(options)) return options;

    const engine = this.getEngines().find((e) => e.supports(options));
    if (!engine) {
      return LayerRandomOlStyleFunction();
    }

    return engine.getStyle(options, ol);
  }

  async getLegend(options: AnyStyle): Promise<string | undefined> {
    if (isAnyOlStyle(options)) return undefined;
    const engine = this.getEngines().find((e) => e.supports(options));
    if (!engine?.getLegend) return undefined;
    return engine.getLegend(options);
  }
}
