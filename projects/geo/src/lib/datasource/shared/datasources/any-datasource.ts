import { OSMDataSource } from './osm-datasource';
import { XYZDataSource } from './xyz-datasource';
import { WMSDataSource } from './wms-datasource';
import { WMTSDataSource } from './wmts-datasource';
import { WFSDataSource } from './wfs-datasource';
import { FeatureDataSource } from './feature-datasource';

export type AnyDataSource =
  | OSMDataSource
  | FeatureDataSource
  | WFSDataSource
  | XYZDataSource
  | WMTSDataSource
  | WMSDataSource;
