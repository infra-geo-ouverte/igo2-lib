import { Style as GsStyle } from 'geostyler-style';

import { EngineLayerStyle } from '../shared/style.base.interface';

export interface GeostylerLayerStyle extends EngineLayerStyle {
  type: 'Geostyler';
  style: GsStyle;
}
