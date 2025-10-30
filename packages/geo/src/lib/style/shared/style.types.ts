import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { OlParserStyleFct } from 'geostyler-openlayers-parser';

import { GeostylerLayerStyle } from '../geostyler/geostyler.interface';
import { MapboxLayerStyle } from '../mapbox/mapbox.interface';
import { BaseLayerStyle } from './style.base.interface';

export type LayerStyle = GeostylerLayerStyle | MapboxLayerStyle;

export type AnyOlStyle =
  | StyleLike
  | FlatStyleLike
  | OlParserStyleFct
  | undefined;
export type AnyStyle = AnyOlStyle | BaseLayerStyle;
