import olStyle from 'ol/style/Style';
import olLayerVector from 'ol/layer/Vector';
import olSourceVector from 'ol/source/Vector';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as olColor from 'ol/color';

import { LayerOptions } from './layer.interface';

import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import { WFSDataSource } from '../../../datasource/shared/datasources/wfs-datasource';
import { ArcGISRestDataSource } from '../../../datasource/shared/datasources/arcgisrest-datasource';
import { WebSocketDataSource } from '../../../datasource/shared/datasources/websocket-datasource';
import { ClusterDataSource } from '../../../datasource/shared/datasources/cluster-datasource';

import { FeatureDataSourceOptions } from '../../../datasource/shared/datasources/feature-datasource.interface';
import { WFSDataSourceOptions } from '../../../datasource/shared/datasources/wfs-datasource.interface';
import { ArcGISRestDataSourceOptions } from '../../../datasource/shared/datasources/arcgisrest-datasource.interface';
import { WebSocketDataSourceOptions } from '../../../datasource/shared/datasources/websocket-datasource.interface';
import { ClusterDataSourceOptions } from '../../../datasource/shared/datasources/cluster-datasource.interface';

import { ClusterParam } from '../clusterParam';

import { StyleByAttribute, MapboxStyle } from '../../../style/shared/vector/vector-style.interface';
import RenderFeature from 'ol/render/Feature';
import Feature from 'ol/Feature';

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
  style?: olStyle | olStyle[] | ((arg0: RenderFeature | Feature<any>, arg1: number) => void | olStyle | olStyle[]);
  browsable?: boolean;
  exportable?: boolean;
  ol?: olLayerVector<olSourceVector<OlGeometry>>;
  animation?: VectorAnimation;
  styleByAttribute?: StyleByAttribute;
  hoverStyle?: StyleByAttribute;
  clusterBaseStyle?: { [key: string]: any } | olStyle | olStyle[];
  clusterParam?: ClusterParam;
  trackFeature?: string | number;
  mapboxStyle ?: MapboxStyle;
}

export interface VectorAnimation {
  duration?: number;
  color?: olColor.Color;
}
