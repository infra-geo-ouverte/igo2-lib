import olLayerVector from 'ol/layer/Vector';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { EngineLayerStyle } from './style.interface';
import { AnyOlStyle } from './style.types';

export interface StyleEngine<T extends EngineLayerStyle = EngineLayerStyle> {
  readonly type: T['type'];
  supports(options: EngineLayerStyle): options is T;
  getStyle(
    options: T,
    ol: olLayerVectorTile | olLayerVector
  ): Promise<AnyOlStyle>;
  getLegend?(options: T): Promise<string | undefined>;
}
