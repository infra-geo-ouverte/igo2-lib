import OlLayer from 'ol/layer/Layer';
import OlSource from 'ol/source/Source';

import { AnyLayer } from '../../layer/shared/layers/any-layer';
import { QueryableDataSource } from './query.interfaces';

/**
 * Whether a layer is queryable
 * @param layer Layer
 * @returns True if the layer s squeryable
 */
export function layerIsQueryable(layer: AnyLayer): boolean {
  const dataSource = layer.dataSource as QueryableDataSource;
  return dataSource.options.queryable === true;
}

/**
 * Whether an OL layer is queryable
 * @param layer Layer
 * @returns True if the ol layer is queryable
 */
export function olLayerIsQueryable(olLayer: OlLayer<OlSource>): boolean {
  const layer = olLayer.get('_layer');
  return layer === undefined ? false : layerIsQueryable(layer);
}

/**
 * Whether a layer's feature is queryable
 * @param layer Layer
 * @returns True if the layer's feature is queryable
 */
export function layerFeatureIsQueryable(layer: AnyLayer): boolean {
  const dataSource = layer.dataSource as QueryableDataSource;
  return dataSource.options.queryLayerFeatures ? (dataSource.options.queryLayerFeatures === true) : true;
}

/**
 * Whether an OL Vector layer is queryable
 * @param layer Layer
 * @returns True if the ol vector layer is queryable
 */
export function olLayerFeatureIsQueryable(olLayer: OlLayer<OlSource>): boolean {
  const layer = olLayer.get('_layer');
  return layer === undefined ? false : (layerIsQueryable(layer) && layerFeatureIsQueryable(layer));
}
