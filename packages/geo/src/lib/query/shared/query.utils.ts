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
export function setLayerQueryable(layer: AnyLayer, queryable: boolean) {
  let dataSource = layer.dataSource as QueryableDataSource;
  dataSource.options.queryable = queryable;
}
export function setLayerQueryFormat(layer: AnyLayer, format) {
  let dataSource = layer.dataSource as QueryableDataSource;
  dataSource.options.queryFormat = format;
}

export function getShortLayerId(layer: AnyLayer): string {
  return layer.id.toString().split('.')[0];
}

export function getIdsSameLayer(layers: AnyLayer[]): string[] {
  // check if same id many times
  let sameIdFind = [];
  for (let i = 0; i < layers.length ; i++ ) {
    let layId = getShortLayerId(layers[i]) ;
    if (layId === 'searchPointerSummaryId') {
      continue;
    }
    for (let j = i + 1 ; j < layers.length ; j++ ) {
      let layId2 = getShortLayerId(layers[j]) ;
      if (layId === layId2) {
        sameIdFind.push(layId);
      }
    }
  }
  return sameIdFind;
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
