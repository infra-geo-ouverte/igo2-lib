import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { WMSDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';

export interface TimeFilterOptions {
  min?: string;
  max?: string;
  range?: boolean;
  value?: string;
  values?: [string, string];
  type?: 'date' | 'time' | 'datetime';
  format?: string;
  style?: 'calendar' | 'slider';
  step?: number;
  timeInterval?: number;
  current?: boolean;
}

export interface TimeFilterableDataSourceOptions extends WMSDataSourceOptions {
  timeFilterable?: boolean;
  timeFilter?: TimeFilterOptions;
}

export interface TimeFilterableDataSource extends WMSDataSource {
  options: TimeFilterableDataSourceOptions;
  filterByDate(date: Date | [Date, Date]);
  filterByYear(year: string | [string, string]);
}
