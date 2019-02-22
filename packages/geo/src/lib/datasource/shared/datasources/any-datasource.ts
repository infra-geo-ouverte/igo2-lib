import { DataSource } from './datasource';
import { OSMDataSource } from './osm-datasource';
import { XYZDataSource } from './xyz-datasource';
import { WMSDataSource } from './wms-datasource';
import { WMTSDataSource } from './wmts-datasource';
import { WFSDataSource } from './wfs-datasource';
import { FeatureDataSource } from './feature-datasource';
import { CartoDataSource } from './carto-datasource';
import { ArcGISRestDataSource } from './arcgisrest-datasource';
import { TileArcGISRestDataSource } from './tilearcgisrest-datasource';

export type AnyDataSource =
  | DataSource
  | OSMDataSource
  | FeatureDataSource
  | WFSDataSource
  | XYZDataSource
  | WMTSDataSource
  | WMSDataSource
  | CartoDataSource
  | ArcGISRestDataSource
  | TileArcGISRestDataSource;
