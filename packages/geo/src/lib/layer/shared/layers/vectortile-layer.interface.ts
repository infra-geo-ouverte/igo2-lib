import olStyle from 'ol/style/Style';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { LayerOptions } from './layer.interface';

import { MVTDataSource } from '../../../datasource/shared/datasources/mvt-datasource';

import { MVTDataSourceOptions } from '../../../datasource/shared/datasources/mvt-datasource.interface';

import { StyleByAttribute, MapboxStyle } from '../vector-style.interface';

export interface VectorTileLayerOptions extends LayerOptions {
  style?: { [key: string]: any } | olStyle | olStyle[];
  source?:
    | MVTDataSource;
  sourceOptions?:
    | MVTDataSourceOptions;
  ol?: olLayerVectorTile;
  declutter?: boolean;
  styleByAttribute?: StyleByAttribute;
  mapboxStyle ?: MapboxStyle;
}
