import { EnvironmentProviders, Provider } from '@angular/core';

import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { StyleEngineKind } from './style.enum';

export type AnyOlStyle = StyleLike | FlatStyleLike;

export interface BaseLayerStyle<
  TypeT extends string = string,
  PayloadT = unknown
> {
  editable?: boolean;
  type: TypeT;
  style: PayloadT;
}

export type AnyStyle = AnyOlStyle | BaseLayerStyle;

export interface StyleEngineFeature<KindT extends StyleEngineKind> {
  kind: KindT;
  providers: (Provider | EnvironmentProviders)[];
}
