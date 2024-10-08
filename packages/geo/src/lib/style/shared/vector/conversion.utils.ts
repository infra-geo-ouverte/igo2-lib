import olLayerVector from 'ol/layer/Vector';
import olSourceVector from 'ol/source/Vector';

export function olStyleToBasicIgoStyle(layer: olLayerVector<olSourceVector>) {
  const layerOlStyle = layer.getStyle();
  if (typeof layerOlStyle === 'function' || layerOlStyle instanceof Array) {
    return;
  }

  const rStyle = {
    fill: {
      color: layerOlStyle.getFill().getColor()
    },
    stroke: {
      color: layerOlStyle.getStroke().getColor(),
      width: 2
    },
    circle: {
      fill: {
        color: (layerOlStyle.getImage() as any).getFill().getColor()
      },
      stroke: {
        color: (layerOlStyle.getImage() as any).getStroke().getColor(),
        width: 2
      },
      radius: 5
    }
  };
  return rStyle;
}
