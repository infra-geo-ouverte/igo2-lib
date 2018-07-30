import FeatureOL from 'ol/Feature';
import Style from 'ol/style/Style';
import VectorLayerOL from 'ol/layer/Vector';

import { LayerOptions } from './layer.interface';

import { FeatureDataSourceOptions } from '../../../datasource/shared/datasources/feature-datasource.interface';
import { WFSDataSourceOptions } from '../../../datasource/shared/datasources/wfs-datasource.interface';

export interface VectorLayerOptions extends LayerOptions {
  source: FeatureDataSourceOptions | WFSDataSourceOptions;
  style?: { [key: string]: any } | Style | Style[];
  renderOrder?: (feature1: FeatureOL, feature2: FeatureOL) => number;
  renderBuffer?: number;
  declutter?: boolean;
  updateWhileAnimating?: boolean;
  updateWhileInteracting?: boolean;
  ol?: VectorLayerOL;
}
