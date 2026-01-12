import { AnyLayer } from '../layer/shared/layers/any-layer';
import { VectorLayer } from '../layer/shared/layers/vector-layer';
import { VectorLayerOptions } from '../layer/shared/layers/vector-layer.interface';
import { isLayerItem } from '../layer/utils/layer.utils';

export function isIdbLayer(layer: AnyLayer): layer is VectorLayer {
  return (
    isLayerItem(layer) &&
    layer.type === 'vector' &&
    (layer.options as VectorLayerOptions).idbInfo?.storeToIdb
  );
}
