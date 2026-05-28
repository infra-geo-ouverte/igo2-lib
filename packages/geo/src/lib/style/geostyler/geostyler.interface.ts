import { Style as GsStyle } from 'geostyler-style';

import { EngineLayerStyle } from '../shared/style.interface';

export interface GeostylerLayerStyle extends EngineLayerStyle<GsStyle> {
  type: 'Geostyler';
  style: GsStyle;
}
