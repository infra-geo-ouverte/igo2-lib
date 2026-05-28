import { EnvironmentProviders, Provider } from '@angular/core';

import olLayerVector from 'ol/layer/Vector';
import olLayerVectorTile from 'ol/layer/VectorTile';
import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

export const StyleEngineKind = ['Geostyler', 'Mapbox'] as const;
export type StyleEngineKind = (typeof StyleEngineKind)[number];

export type AnyOlStyle = StyleLike | FlatStyleLike;
export type AnyStyle = AnyOlStyle | EngineLayerStyle;

export interface EngineLayerStyle<TStyle = unknown> {
  type: StyleEngineKind;
  style?: TStyle;
}

export interface StyleEngineFeature<KindT extends StyleEngineKind> {
  kind: KindT;
  providers: (Provider | EnvironmentProviders)[];
}

export interface ConfigurableStylesOptions {
  // Restricted to OL due to new Overlay(...) is out of injection context and not use LayerService
  base?: AnyOlStyle;
  selection?: AnyOlStyle;
  focus?: AnyOlStyle;
}
export interface StyleEngine<T extends EngineLayerStyle = EngineLayerStyle> {
  readonly type: StyleEngineKind;
  supports(options: EngineLayerStyle): options is T;
  getStyle(
    options: T,
    ol: olLayerVectorTile | olLayerVector
  ): Promise<AnyOlStyle>;
  getLegend?(options: T): Promise<string | undefined>;
}

export enum FontType {
  Arial = 'Arial',
  ArialBlack = 'Arial Black',
  Verdana = 'Verdana',
  Tahoma = 'Tahoma',
  TrebuchetMS = 'Trebuchet MS',
  Impact = 'Impact',
  TimesNewRoman = 'Times New Roman',
  Georgia = 'Georgia',
  AmericanTypewriter = 'American Typewriter',
  Courier = 'Courier',
  LucidaConsole = 'Lucida Console',
  BrushScriptMT = 'Brush Script MT',
  ComicSansMS = 'Comic Sans MS'
}
