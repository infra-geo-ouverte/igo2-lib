import Feature from 'ol/Feature';
import olLayerVectorTile from 'ol/layer/VectorTile';
import RenderFeature from 'ol/render/Feature';
import olStyle from 'ol/style/Style';

import { MVTDataSource } from '../../../datasource/shared/datasources/mvt-datasource';
import { MVTDataSourceOptions } from '../../../datasource/shared/datasources/mvt-datasource.interface';
import { IgoStyle } from '../../../style/shared/vector/vector-style.interface';
import { LayerOptions } from './layer.interface';

export interface VectorTileLayerOptions extends LayerOptions {
  style?:
    | olStyle
    | olStyle[]
    | ((
        arg0: RenderFeature | Feature<any>,
        arg1: number
      ) => void | olStyle | olStyle[]);
  source?: MVTDataSource;
  sourceOptions?: MVTDataSourceOptions;
  ol?: olLayerVectorTile;
  declutter?: boolean;
  igoStyle?: IgoStyle;
}
