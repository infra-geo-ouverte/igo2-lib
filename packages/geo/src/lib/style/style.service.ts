import { Injectable, inject } from '@angular/core';

import olLayerVector from 'ol/layer/Vector';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { StyleEngine } from './shared/style-engine.interface';
import { StyleEngineKind } from './shared/style.enum';
import { isAnyOlStyle, isEngineLayerStyle } from './shared/style.guards';
import { EngineLayerStyle } from './shared/style.interface';
import { AnyOlStyle, AnyStyle } from './shared/style.types';
import { randomOlFlatStyle } from './shared/style.utils';
import { STYLE_ENGINES } from './style.provider';

const ENGINE_PROVIDER_HINT: Record<StyleEngineKind, string> = {
  Geostyler: 'withGeostyler()',
  Mapbox: 'withMapbox()'
};

type ResolvedEngine = { engine: StyleEngine; layerStyle: EngineLayerStyle };

@Injectable({ providedIn: 'root' })
export class StyleService {
  private readonly engines = inject(STYLE_ENGINES, { optional: true }) ?? [];

  private resolveEngine(
    options: AnyStyle,
    warn = false
  ): ResolvedEngine | undefined {
    if (!isEngineLayerStyle(options)) return undefined;

    const engine = this.engines.find((e) => e.supports(options));
    if (!engine && warn) {
      const hint = ENGINE_PROVIDER_HINT[options.type];
      const hintMsg = hint
        ? ` Did you forget to add ${hint} to provideStyle(...)?`
        : ` No registered provider handles type "${options.type}".`;
      console.warn(`[StyleService]${hintMsg}`);
    }

    return engine ? { engine, layerStyle: options } : undefined;
  }

  async getStyle(
    options: AnyStyle,
    ol?: olLayerVector | olLayerVectorTile
  ): Promise<AnyOlStyle> {
    const resolved = this.resolveEngine(options, true);
    if (resolved) {
      return resolved.engine.getStyle(resolved.layerStyle, ol);
    }

    if (isAnyOlStyle(options)) {
      return options satisfies AnyOlStyle;
    }

    return randomOlFlatStyle();
  }

  async getLegend(options: AnyStyle): Promise<string | undefined> {
    const resolved = this.resolveEngine(options);
    if (resolved?.engine.getLegend) {
      return resolved.engine.getLegend(resolved.layerStyle);
    }

    return undefined;
  }
}
