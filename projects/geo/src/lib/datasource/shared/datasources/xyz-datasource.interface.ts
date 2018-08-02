import olSourceXYZ from 'ol/source/XYZ';
import { DataSourceOptions } from './datasource.interface';

export interface XYZDataSourceOptions extends DataSourceOptions {
  projection?: string;
  url?: string;
  urls?: string[];
  ol?: olSourceXYZ;
}
