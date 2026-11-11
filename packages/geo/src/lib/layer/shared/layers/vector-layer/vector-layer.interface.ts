import * as olColor from 'ol/color';
import olLayerVector from 'ol/layer/Vector';
import olSourceVector from 'ol/source/Vector';

import type {
  ArcGISRestDataSource,
  ArcGISRestDataSourceOptions,
  ClusterDataSource,
  ClusterDataSourceOptions,
  FeatureDataSource,
  FeatureDataSourceOptions,
  WFSDataSource,
  WFSDataSourceOptions,
  WebSocketDataSource,
  WebSocketDataSourceOptions
} from '../../../../datasource/shared/datasources';
import { AnyStyle } from '../../../../style/shared';
import { ClusterParam } from '../../clusterParam';
import { LayerOptions } from '../layer.interface';

export interface VectorLayerOptions extends LayerOptions {
  source?:
    | FeatureDataSource
    | WFSDataSource
    | ArcGISRestDataSource
    | WebSocketDataSource
    | ClusterDataSource;
  sourceOptions?:
    | FeatureDataSourceOptions
    | WFSDataSourceOptions
    | ArcGISRestDataSourceOptions
    | WebSocketDataSourceOptions
    | ClusterDataSourceOptions;
  style?: AnyStyle;
  browsable?: boolean;
  exportable?: boolean;
  ol?: olLayerVector<olSourceVector>;
  animation?: VectorAnimation;
  clusterParam?: ClusterParam;
  trackFeature?: string | number;
  preload?: VectorLayerPreloadOptions;
  offline?: VectorLayerOfflineOptions;
}

export interface VectorLayerPreloadOptions {
  bypass: 'visibility' | 'resolution' | 'all';
}

export interface VectorLayerOfflineOptions {
  enabled: boolean;
  contextUri?: string;
}

export interface VectorAnimation {
  duration?: number;
  color?: olColor.Color;
}
