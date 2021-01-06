import { Layer } from '../shared/layers/layer';
import { OutputLayerLegend } from '../shared/layers/layer.interface';

/**
 * Get all the layers legend
 * @return Array of legend
 */
export function getLayersLegends(layers: Layer[], scale?: number): OutputLayerLegend[] {
  const legends = [];

  for (const layer of layers) {
    if (layer.visible === false) { continue; }

    const legendUrls = layer.dataSource.getLegend(undefined, scale) || [];
    for (const legendUrl of legendUrls) {
      if (legendUrl.url === undefined) { continue; }

      // Add legend info to the list
      legends.push({
        title: layer.title,
        url: legendUrl.url
      });
    }
  }

  return legends;
}
