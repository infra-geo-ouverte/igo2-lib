import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { Style as GsStyle } from 'geostyler-style';

export interface GeostylerLayerStyle {
  editable?: boolean;
  type: 'Geostyler';
  style: GsStyle;
}

export type LayerStyle = GeostylerLayerStyle;

export type HandledLayerStyle = LayerStyle | OlStyleLikeOrFlatLike;
export type OlStyleLikeOrFlatLike = StyleLike | FlatStyleLike;
