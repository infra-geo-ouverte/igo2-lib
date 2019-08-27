import { Layer } from '../shared/layers/layer';
import { OutputLayerLegend } from '../shared/layers/layer.interface';

/**
 * Get all the layers legend
 * @return Array of legend
 */
export function getLayersLegends(layers: Layer[], scale?: number): OutputLayerLegend[] {
  const legends = [];
  const newCanvas = document.createElement('canvas');
  const newContext = newCanvas.getContext('2d');
  newContext.font = '20px Calibri';

  let heightPos = 0;
  for (const layer of layers) {
    if (layer.visible === false) { continue; }

    const legendUrls = layer.dataSource.getLegend(undefined, scale) || [];
    for (const legendUrl of legendUrls) {
      if (legendUrl.url === undefined) { continue; }

      const title = layer.title;
      // Create an image for the legend
      const legendImage = new Image();
      legendImage.crossOrigin = 'anonymous';
      legendImage.src = legendUrl.url;
      legendImage.onload = () => {
        newContext.fillText(title, 0, heightPos);
        newContext.drawImage(legendImage, 0, heightPos + 20);
        heightPos += legendImage.height + 5;
      };
      // Add legend info to the list
      legends.push({
        title,
        url: legendUrl.url,
        image: legendImage
      });
    }
  }

  return legends;
}
