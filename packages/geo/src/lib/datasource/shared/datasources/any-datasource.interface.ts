import { ArcGISRestDataSourceOptions } from './arcgisrest-datasource.interface';
import { CartoDataSourceOptions } from './carto-datasource.interface';
import { ClusterDataSourceOptions } from './cluster-datasource.interface';
import { DataSourceOptions } from './datasource.interface';
import { FeatureDataSourceOptions } from './feature-datasource.interface';
import { ArcGISRestImageDataSourceOptions } from './imagearcgisrest-datasource.interface';
import { MVTDataSourceOptions } from './mvt-datasource.interface';
import { OSMDataSourceOptions } from './osm-datasource.interface';
import { TileArcGISRestDataSourceOptions } from './tilearcgisrest-datasource.interface';
import { TileDebugDataSourceOptions } from './tiledebug-datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import { WMTSDataSourceOptions } from './wmts-datasource.interface';
import { XYZDataSourceOptions } from './xyz-datasource.interface';

export type AnyDataSourceOptions =
  | DataSourceOptions
  | OSMDataSourceOptions
  | FeatureDataSourceOptions
  | WFSDataSourceOptions
  | XYZDataSourceOptions
  | TileDebugDataSourceOptions
  | WMTSDataSourceOptions
  | WMSDataSourceOptions
  | CartoDataSourceOptions
  | ArcGISRestDataSourceOptions
  | ArcGISRestImageDataSourceOptions
  | TileArcGISRestDataSourceOptions
  | MVTDataSourceOptions
  | ClusterDataSourceOptions;
