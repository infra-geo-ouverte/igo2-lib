import { firstValueFrom } from 'rxjs';

import { Legend } from '../../datasource/shared/datasources/datasource.interface';
import { AnyLayer } from '../shared';
import { VectorLayer, VectorTileLayer } from '../shared/layers';
import { OutputLayerLegend } from '../shared/layers/legend.interface';
import { isLayerGroup } from './layer.utils';

type StyleLegendLayer = VectorLayer | VectorTileLayer;

function isStyleLegendLayer(layer: AnyLayer): layer is StyleLegendLayer {
  return layer instanceof VectorLayer || layer instanceof VectorTileLayer;
}

function toLegendUrl(legend: string): string | undefined {
  const trimmedLegend = legend.trim();
  if (!trimmedLegend) {
    return undefined;
  }

  if (trimmedLegend.startsWith('data:')) {
    return trimmedLegend;
  }

  if (trimmedLegend.startsWith('<')) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmedLegend)}`;
  }

  return trimmedLegend;
}

/**
 * Get all the layers legend
 * @return Array of legend
 */
export async function getLayersLegends(
  layers: AnyLayer[]
): Promise<OutputLayerLegend[]> {
  const legends: OutputLayerLegend[] = [];

  for (const layer of layers) {
    if (isLayerGroup(layer)) {
      continue;
    }
    if (layer.visible === false) {
      continue;
    }

    const legendOptions = layer.options.legendOptions;
    let layerLegends: Legend[] | undefined;

    if (isStyleLegendLayer(layer)) {
      const layerStyle = await firstValueFrom(layer.style$);
      if (layerStyle) {
        layerLegends = await layer.getLegend(layerStyle);
      }
    }

    if (!layerLegends) {
      layerLegends = layer.dataSource.getLegend();
    }

    for (const legendItem of layerLegends) {
      const legendUrl = legendItem.url ?? toLegendUrl(legendItem.html ?? '');
      if (!legendUrl) {
        continue;
      }

      // Add legend info to the list
      legends.push({
        title: layer.title || '',
        url: legendUrl,
        display:
          legendOptions?.display === undefined ? true : legendOptions.display,
        isInResolutionsRange: layer.isInResolutionsRange
      });
    }
  }

  return legends;
}
