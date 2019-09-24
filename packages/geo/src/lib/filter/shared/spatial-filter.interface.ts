import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { WMSDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';

export interface SpatialFilter {
  type: string;
  queryType?: string;
  buffer?: number;
  item: string;
}
