import { DataSourceOptions } from './datasource.interface';
import { OSMDataSourceOptions } from './osm-datasource.interface';
import { XYZDataSourceOptions } from './xyz-datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import { WMTSDataSourceOptions } from './wmts-datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { FeatureDataSourceOptions } from './feature-datasource.interface';
import { CartoDataSourceOptions } from './carto-datasource.interface';
import { ArcGISRestDataSourceOptions } from './arcgisrest-datasource.interface';
import { TileArcGISRestDataSourceOptions } from './tilearcgisrest-datasource.interface';

export type AnyDataSourceOptions =
  | DataSourceOptions
  | OSMDataSourceOptions
  | FeatureDataSourceOptions
  | WFSDataSourceOptions
  | XYZDataSourceOptions
  | WMTSDataSourceOptions
  | WMSDataSourceOptions
  | CartoDataSourceOptions
  | ArcGISRestDataSourceOptions
  | TileArcGISRestDataSourceOptions;
