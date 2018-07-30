import * as ol from 'openlayers';
import { LayerOptions } from './layer.interface';

import { WMSDataSourceOptions } from '../../../datasource/shared/datasources/wms-datasource.interface';

export interface ImageLayerOptions
  extends LayerOptions,
    ol.olx.layer.ImageOptions {
  token?: string;
  source: WMSDataSourceOptions | any;
}
