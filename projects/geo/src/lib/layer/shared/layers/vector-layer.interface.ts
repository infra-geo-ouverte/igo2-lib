import Style from 'ol/style/Style';
import VectorLayerOL from 'ol/layer/Vector';

import { LayerOptions } from './layer.interface';

import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import { WFSDataSource } from '../../../datasource/shared/datasources/wfs-datasource';

// import { FeatureDataSourceOptions } from '../../../datasource/shared/datasources/feature-datasource.interface';
// import { WFSDataSourceOptions } from '../../../datasource/shared/datasources/wfs-datasource.interface';

export interface VectorLayerOptions extends LayerOptions {
  source?: FeatureDataSource | WFSDataSource;
  // sourceOptions?: FeatureDataSourceOptions | WFSDataSourceOptions;
  style?: { [key: string]: any } | Style | Style[];
  ol?: VectorLayerOL;
}
