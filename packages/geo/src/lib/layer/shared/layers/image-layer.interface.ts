import olLayerImage from 'ol/layer/Image';
import olSourceImage from 'ol/source/Image';

import {
  ArcGISRestImageDataSourceOptions,
  ImageArcGISRestDataSource,
  WMSDataSource,
  WMSDataSourceOptions
} from '../../../datasource/shared/datasources';
import { LayerOptions } from './layer.interface';

export interface ImageLayerOptions extends LayerOptions {
  source?: WMSDataSource | ImageArcGISRestDataSource;
  sourceOptions?: WMSDataSourceOptions | ArcGISRestImageDataSourceOptions;
  tokenKey?: string;
  ol?: olLayerImage<olSourceImage>;
  metadata?: {
    url?: string;
    extern?: boolean;
    abstract?: string;
    keywordList?: string[];
  };
}
