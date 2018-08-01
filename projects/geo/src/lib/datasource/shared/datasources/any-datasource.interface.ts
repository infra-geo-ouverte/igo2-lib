import { OSMDataSourceOptions } from './osm-datasource.interface';
import { XYZDataSourceOptions } from './xyz-datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import { WMTSDataSourceOptions } from './wmts-datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export type AnyDataSourceOptions =
  | OSMDataSourceOptions
  | FeatureDataSourceOptions
  | WFSDataSourceOptions
  | XYZDataSourceOptions
  | WMTSDataSourceOptions
  | WMSDataSourceOptions;
