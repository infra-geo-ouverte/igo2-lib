import Feature from 'ol/Feature';
import * as olColor from 'ol/color';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import olLayerVector from 'ol/layer/Vector';
import RenderFeature from 'ol/render/Feature';
import olSourceVector from 'ol/source/Vector';
import olStyle from 'ol/style/Style';

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
import { IgoStyle } from '../../../style/shared/vector/vector-style.interface';
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
  style?:
    | olStyle
    | olStyle[]
    | ((
        arg0: RenderFeature | Feature<any>,
        arg1: number
      ) => void | olStyle | olStyle[]);
  browsable?: boolean;
  exportable?: boolean;
  ol?: olLayerVector<olSourceVector<OlGeometry>>;
  animation?: VectorAnimation;
  clusterParam?: ClusterParam;
  trackFeature?: string | number;
  idbInfo?: IdbInfo;
  igoStyle?: IgoStyle;
}

export interface IdbInfo {
  storeToIdb: boolean;
  contextUri: string;
  firstLoad: boolean;
}

export interface VectorAnimation {
  duration?: number;
  color?: olColor.Color;
}
