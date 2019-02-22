import { LayerOptions } from '../../layer/shared/layers/layer.interface';

export interface MetadataOptions {
  url: string;
  extern?: boolean;
  abstract?: string;
  keywordList?: string[];
}

export interface MetadataLayerOptions extends LayerOptions {
  metadata?: MetadataOptions;
}
