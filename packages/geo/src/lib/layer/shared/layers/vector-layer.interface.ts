import * as olColor from 'ol/color';
import olLayerVector from 'ol/layer/Vector';
import olSourceVector from 'ol/source/Vector';

import { ArcGISRestDataSource } from '../../../datasource/shared/datasources/arcgisrest-datasource';
import { ArcGISRestDataSourceOptions } from '../../../datasource/shared/datasources/arcgisrest-datasource.interface';
import { ClusterDataSource } from '../../../datasource/shared/datasources/cluster-datasource';
import { ClusterDataSourceOptions } from '../../../datasource/shared/datasources/cluster-datasource.interface';
import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import { FeatureDataSourceOptions } from '../../../datasource/shared/datasources/feature-datasource.interface';
import { WebSocketDataSource } from '../../../datasource/shared/datasources/websocket-datasource';
import { WebSocketDataSourceOptions } from '../../../datasource/shared/datasources/websocket-datasource.interface';
import { WFSDataSource } from '../../../datasource/shared/datasources/wfs-datasource';
import { WFSDataSourceOptions } from '../../../datasource/shared/datasources/wfs-datasource.interface';
import { HandledLayerStyle } from '../../../style/shared/layer/layer-style.interface';
import { ClusterParam } from '../clusterParam';
import { LayerOptions } from './layer.interface';

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
  style?: HandledLayerStyle;
  browsable?: boolean;
  exportable?: boolean;
  ol?: olLayerVector<olSourceVector>;
  animation?: VectorAnimation;
  clusterParam?: ClusterParam;
  trackFeature?: string | number;
  idbInfo?: IdbInfo;
  hoverAttribute?: string;
}

export interface IdbInfo {
  storeToIdb: boolean;
  contextUri?: string;
  /** Interfaces restricted for system usage*/
  _firstLoad?: boolean;
  _deleteFromIdb?: boolean;
}

export interface VectorAnimation {
  duration?: number;
  color?: olColor.Color;
}
