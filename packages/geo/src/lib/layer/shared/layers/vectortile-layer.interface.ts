import olStyle from 'ol/style/Style';
import olLayerVectorTile from 'ol/layer/VectorTile';

import { LayerOptions } from './layer.interface';

import { MVTDataSource } from '../../../datasource/shared/datasources/mvt-datasource';

import { MVTDataSourceOptions } from '../../../datasource/shared/datasources/mvt-datasource.interface';

import { StyleByAttribute, MapboxStyle } from '../../../style/shared/vector/vector-style.interface';
import RenderFeature from 'ol/render/Feature';
import Feature from 'ol/Feature';

export interface VectorTileLayerOptions extends LayerOptions {
  style?: olStyle | olStyle[] | ((arg0: RenderFeature | Feature<any>, arg1: number) => void | olStyle | olStyle[]);
  source?:
    | MVTDataSource;
  sourceOptions?:
    | MVTDataSourceOptions;
  ol?: olLayerVectorTile;
  declutter?: boolean;
  styleByAttribute?: StyleByAttribute;
  hoverStyle?: StyleByAttribute;
  mapboxStyle ?: MapboxStyle;
}
