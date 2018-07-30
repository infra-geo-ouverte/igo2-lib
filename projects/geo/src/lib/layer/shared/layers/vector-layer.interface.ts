import * as ol from 'openlayers';
import { LayerOptions } from './layer.interface';

import { FeatureDataSourceOptions } from '../../../datasource/shared/datasources/feature-datasource.interface';
import { WFSDataSourceOptions } from '../../../datasource/shared/datasources/wfs-datasource.interface';

export interface VectorLayerOptions
  extends LayerOptions,
    ol.olx.layer.VectorOptions {
  source: FeatureDataSourceOptions | WFSDataSourceOptions | any;
  style?: { [key: string]: any } | any;
}
