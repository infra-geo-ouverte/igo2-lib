import olLayerVectorTile from 'ol/layer/VectorTile';

import { MVTDataSource } from '../../../datasource/shared/datasources/mvt-datasource';
import { MVTDataSourceOptions } from '../../../datasource/shared/datasources/mvt-datasource.interface';
import { HandledLayerStyle } from '../../../style/shared/layer/layer-style.interface';
import { LayerOptions } from './layer.interface';

export interface VectorTileLayerOptions extends LayerOptions {
  style?: HandledLayerStyle;
  source?: MVTDataSource;
  sourceOptions?: MVTDataSourceOptions;
  ol?: olLayerVectorTile;
  declutter?: boolean;
  hoverAttribute?: string;
}
