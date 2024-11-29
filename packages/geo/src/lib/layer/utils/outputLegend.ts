import { Layer } from '../shared/layers/layer';
import { OutputLayerLegend } from '../shared/layers/legend.interface';

/**
 * Get all the layers legend
 * @return Array of legend
 */
export function getLayersLegends(layers: Layer[]): OutputLayerLegend[] {
  const legends = [];

  for (const layer of layers) {
    const legendOptions = layer.options.legendOptions;
    if (layer.visible === false) {
      continue;
    }

    const legendUrls = layer.dataSource.getLegend() || [];
    for (const legendUrl of legendUrls) {
      if (legendUrl.url === undefined) {
        continue;
      }

      // Add legend info to the list
      legends.push({
        title: layer.title || '',
        url: legendUrl.url,
        display:
          legendOptions?.display === undefined ? true : legendOptions.display,
        isInResolutionsRange: layer.isInResolutionsRange
      });
    }
  }

  return legends;
}
