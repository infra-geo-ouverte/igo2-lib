import { Style as GsStyle } from 'geostyler-style';

import { BaseLayerStyle } from '../shared/style.base.interface';

export type GeostylerLegendType = 'svg';

export interface GeostylerLayerStyle extends BaseLayerStyle {
  editable?: boolean;
  type: 'Geostyler';
  style: GsStyle;
}
