import ImageLayerOL from 'ol/layer/Image';

import { LayerOptions } from './layer.interface';

import { WMSDataSourceOptions } from '../../../datasource/shared/datasources/wms-datasource.interface';

export interface ImageLayerOptions extends LayerOptions {
  source: WMSDataSourceOptions;
  token?: string;
  ol?: ImageLayerOL;
}
