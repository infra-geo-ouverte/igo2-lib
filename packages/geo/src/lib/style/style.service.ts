import { Injectable, inject } from '@angular/core';

import olLayerVector from 'ol/layer/Vector';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { StyleEngine } from './shared/style-engine.interface';
import { AnyOlStyle, AnyStyle } from './shared/style.types';
import { isAnyOlStyle, randomOlFlatStyle } from './shared/style.utils';
import { STYLE_ENGINES } from './style.provider';

@Injectable({ providedIn: 'root' })
export class StyleService {
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
    if (isAnyOlStyle(options)) {
      return options satisfies AnyOlStyle;
    }

    const engine = this.getEngines().find((e) => e.supports(options));
    if (!engine) {
      return randomOlFlatStyle();
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
