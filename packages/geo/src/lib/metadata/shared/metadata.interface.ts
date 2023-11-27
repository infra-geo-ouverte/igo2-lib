import { TypeCatalogStrings } from '../../catalog/shared/catalog.enum';
import { LayerOptions } from '../../layer/shared/layers/layer.interface';

export interface MetadataOptions {
  url: string;
  extern?: boolean;
  abstract?: string;
  keywordList?: string[];
  layerTitle?: string;
  type?: TypeCatalogStrings;
}

export interface MetadataLayerOptions extends LayerOptions {
  metadata?: MetadataOptions;
}
