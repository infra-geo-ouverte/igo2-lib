import { LayerOptions } from '../../layer/shared/layers/layer.interface';

export interface MetadataOptions {
  url: string;
  extern?: boolean;
}

export interface MetadataLayerOptions extends LayerOptions {
  metadata?: MetadataOptions;
}
