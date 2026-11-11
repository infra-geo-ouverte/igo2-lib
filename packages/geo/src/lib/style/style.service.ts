import { Injectable, inject } from '@angular/core';

import olLayerVector from 'ol/layer/Vector';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { isAnyOlStyle } from './shared/style-ol.utils';
import {
  AnyOlStyle,
  AnyStyle,
  EngineLayerStyle,
  StyleEngine,
  StyleEngineKind
} from './shared/style.interface';
import { randomOlFlatStyle } from './shared/style.utils';
import { STYLE_ENGINES } from './style.provider';

const ENGINE_PROVIDER_HINT: Record<StyleEngineKind, string> = {
  Geostyler: 'withGeostyler()',
  Mapbox: 'withMapbox()'
};

@Injectable({ providedIn: 'root' })
export class StyleService {
  private readonly engines = inject(STYLE_ENGINES, { optional: true }) ?? [];

  async getStyle(
    options: AnyStyle,
    ol: olLayerVector | olLayerVectorTile
  ): Promise<AnyOlStyle> {
    if (isAnyOlStyle(options)) {
      return options;
    }

    const engine = this.findEngine(options);
    return engine?.getStyle(options, ol) ?? randomOlFlatStyle();
  }

  async getLegend(options: AnyStyle): Promise<string | undefined> {
    if (isAnyOlStyle(options)) {
      return undefined;
    }
    const engine = this.findEngine(options);
    if (!engine?.getLegend) {
      return undefined;
    }

    return engine.getLegend(options);
  }

  private findEngine(options: EngineLayerStyle): StyleEngine | undefined {
    const engine = this.engines.find((e) => e.supports(options));
    if (!engine) {
      const hint = ENGINE_PROVIDER_HINT[options.type];
      const hintMsg = hint
        ? ` Did you forget to add ${hint} to provideStyle(...)?`
        : ` No registered provider handles type "${options.type}".`;
      console.warn(`[StyleService]${hintMsg}`);
    }

    return engine;
  }
}
