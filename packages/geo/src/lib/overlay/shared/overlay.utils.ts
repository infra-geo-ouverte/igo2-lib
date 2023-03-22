
import { FeatureDataSource } from '../../datasource';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { createOverlayLayerStyle } from '../../style/shared/overlay/overlay-style.utils';


/**
 * Create an overlay layer and it's source
 * @returns Overlay layer
 */
export function createOverlayLayer(): VectorLayer {
  const overlayDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: 'Overlay',
    zIndex: 300,
    source: overlayDataSource,
    style: createOverlayLayerStyle()
  });
}
