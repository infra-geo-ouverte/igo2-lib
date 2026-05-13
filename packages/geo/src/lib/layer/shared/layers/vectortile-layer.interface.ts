import olLayerVectorTile from 'ol/layer/VectorTile';

import { MVTDataSource } from '../../../datasource/shared/datasources/mvt-datasource';
import { MVTDataSourceOptions } from '../../../datasource/shared/datasources/mvt-datasource.interface';
import { AnyStyle } from '../../../style/shared/style.types';
import { LayerOptions } from './layer.interface';

export interface VectorTileLayerOptions extends LayerOptions {
  style?: AnyStyle;
  source?: MVTDataSource;
  sourceOptions?: MVTDataSourceOptions;
  ol?: olLayerVectorTile;
  declutter?: boolean;
}
