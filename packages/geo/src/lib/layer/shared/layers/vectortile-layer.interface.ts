import olLayerVectorTile from 'ol/layer/VectorTile';
import { StyleLike } from 'ol/style/Style';

import { MVTDataSource } from '../../../datasource/shared/datasources/mvt-datasource';
import { MVTDataSourceOptions } from '../../../datasource/shared/datasources/mvt-datasource.interface';
import { IgoStyle } from '../../../style/shared/layer/layer-style.interface';
import { LayerOptions } from './layer.interface';

export interface VectorTileLayerOptions extends LayerOptions {
  style?: StyleLike;
  source?: MVTDataSource;
  sourceOptions?: MVTDataSourceOptions;
  ol?: olLayerVectorTile;
  declutter?: boolean;
  igoStyle?: IgoStyle;
  hoverAttribute?: string;
}
