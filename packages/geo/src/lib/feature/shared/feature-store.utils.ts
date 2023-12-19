import { FeatureDataSource } from '../../datasource/shared/datasources';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureStore } from './store';

/**
 * Try to bind a layer to a store if none is bound already.
 * The layer will also be added to the store's map.
 * If no layer is given to that function, a basic one will be created.
 * @param store The store to bind the layer
 * @param layer An optional VectorLayer
 */
export function tryBindStoreLayer(store: FeatureStore, layer?: VectorLayer) {
  if (store.layer !== undefined) {
    if (store.layer.map === undefined) {
      store.map.addLayer(store.layer);
    }
    return;
  }

  layer = layer
    ? layer
    : new VectorLayer({
        source: new FeatureDataSource()
      });
  store.bindLayer(layer);
  if (store.layer.map === undefined) {
    store.map.addLayer(store.layer);
  }
}
