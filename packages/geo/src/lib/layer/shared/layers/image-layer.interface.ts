import olLayerImage from 'ol/layer/Image';

import { LayerOptions } from './layer.interface';

import { WMSDataSource } from '../../../datasource/shared/datasources/wms-datasource';
import { WMSDataSourceOptions } from '../../../datasource/shared/datasources/wms-datasource.interface';

export interface ImageLayerOptions extends LayerOptions {
  source?: WMSDataSource;
  sourceOptions?: WMSDataSourceOptions;
  token?: string;
  ol?: olLayerImage;
}
