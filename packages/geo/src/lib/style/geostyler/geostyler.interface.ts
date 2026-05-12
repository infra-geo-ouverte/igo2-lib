import { Style as GsStyle } from 'geostyler-style';

import { BaseLayerStyle } from '../shared/style.base.interface';

export interface GeostylerLayerStyle extends BaseLayerStyle {
  type: 'Geostyler';
  style: GsStyle;
}
