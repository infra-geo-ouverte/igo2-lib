import { ArcGISRestDataSource } from './arcgisrest-datasource';
import { CartoDataSource } from './carto-datasource';
import { ClusterDataSource } from './cluster-datasource';
import { DataSource } from './datasource';
import { FeatureDataSource } from './feature-datasource';
import { ImageArcGISRestDataSource } from './imagearcgisrest-datasource';
import { MVTDataSource } from './mvt-datasource';
import { OSMDataSource } from './osm-datasource';
import { TileArcGISRestDataSource } from './tilearcgisrest-datasource';
import { TileDebugDataSource } from './tiledebug-datasource';
import { WebSocketDataSource } from './websocket-datasource';
import { WFSDataSource } from './wfs-datasource';
import { WMSDataSource } from './wms-datasource';
import { WMTSDataSource } from './wmts-datasource';
import { XYZDataSource } from './xyz-datasource';

export type AnyDataSource =
  | DataSource
  | OSMDataSource
  | FeatureDataSource
  | WFSDataSource
  | XYZDataSource
  | TileDebugDataSource
  | WMTSDataSource
  | WMSDataSource
  | CartoDataSource
  | ArcGISRestDataSource
  | ImageArcGISRestDataSource
  | TileArcGISRestDataSource
  | WebSocketDataSource
  | MVTDataSource
  | ClusterDataSource;
