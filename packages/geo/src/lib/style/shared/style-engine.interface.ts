import olLayerVector from 'ol/layer/Vector';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { BaseLayerStyle } from './style.interface';
import { AnyOlStyle } from './style.types';

export interface StyleEngine<T extends BaseLayerStyle = BaseLayerStyle> {
  readonly type: T['type'];
  supports(options: BaseLayerStyle): options is T;
  getStyle(
    options: T,
    ol?: olLayerVectorTile | olLayerVector
  ): Promise<AnyOlStyle>;
  getLegend?(options: T): Promise<string | undefined>;
}
