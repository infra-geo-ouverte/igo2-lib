import { AnyLayerOptions } from "../shared/layers/any-layer.interface";
import { VectorTileLayerOptions } from "../shared/layers/vectortile-layer.interface";


export function computeMVTOptionsOnHover(layerOptions: AnyLayerOptions) {
  const vectorTileLayerOptions = layerOptions as VectorTileLayerOptions;
  if (
    vectorTileLayerOptions.sourceOptions?.type === 'mvt' &&
    (vectorTileLayerOptions.styleByAttribute?.hoverStyle || vectorTileLayerOptions.hoverStyle)) {
    const fc = vectorTileLayerOptions.sourceOptions.featureClass;
    vectorTileLayerOptions.sourceOptions.featureClass = fc ? fc : 'feature';
  }
  return layerOptions;
}
