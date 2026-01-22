import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { Style as GsStyle } from 'geostyler-style';

export interface GeostylerLayerStyle {
  editable?: boolean;
  type: 'Geostyler';
  style: GsStyle;
}

export type LayerStyle = GeostylerLayerStyle;

export type AnyStyle = LayerStyle | AnyOlStyle;
export type AnyOlStyle = StyleLike | FlatStyleLike;
