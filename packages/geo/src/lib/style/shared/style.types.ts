import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { OlParserStyleFct } from 'geostyler-openlayers-parser';

import { EngineLayerStyle } from './style.base.interface';

export type AnyOlStyle = StyleLike | FlatStyleLike | OlParserStyleFct;
export type AnyStyle = AnyOlStyle | EngineLayerStyle;
