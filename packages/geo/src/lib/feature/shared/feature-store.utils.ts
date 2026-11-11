import { FeatureDataSource } from '../../datasource/shared/datasources';
import { LayerService } from '../../layer/shared/layer.service';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import type { FeatureStore } from './store';

/**
 * Try to bind a layer to a store if none is bound already.
 * The layer will also be added to the store's map.
 * If no layer is given to that function, a basic one will be created.
 * @param store The store to bind the layer
 * @param layer An optional VectorLayer
 */
export function tryBindStoreLayer(
  store: FeatureStore,
  layer?: VectorLayer,
  layerService?: LayerService
): VectorLayer {
  if (store.layer !== undefined) {
    if (!store.map.layerController.getById(store.layer.id!)) {
      store.map.layerController.add(store.layer);
    }
    return store.layer;
  }

  if (!layer) {
    if (!layerService) {
      throw new Error('LayerService is required to create a store layer.');
    }
    layer = layerService.createLayer({
      source: new FeatureDataSource()
    }) as VectorLayer;
  }
  store.bindLayer(layer);
  if (!store.map.layerController.getById(layer.id!)) {
    store.map.layerController.add(store.layer);
  }

  return layer;
}
