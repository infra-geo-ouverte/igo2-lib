import { Layer } from '../shared/layers/layer';
import { LegendMapViewOptions, OutputLayerLegend } from '../shared/layers/layer.interface';

/**
 * Get all the layers legend
 * @return Array of legend
 */
export function getLayersLegends(layers: Layer[], view?: LegendMapViewOptions): OutputLayerLegend[] {
  const legends = [];

  for (const layer of layers) {
    const legendOptions = layer.options.legendOptions;
    if (layer.visible === false) { continue; }

    const legendUrls = layer.dataSource.getLegend(undefined, view) || [];
    for (const legendUrl of legendUrls) {
      if (legendUrl.url === undefined) { continue; }

      // Add legend info to the list
      legends.push({
        title: layer.title || '',
        url: legendUrl.url,
        display: legendOptions ? legendOptions.display === true : true
      });
    }
  }

  return legends;
}
