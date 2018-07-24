import { DataSource } from '../../datasource/shared/datasources/datasource';
import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

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
}

export interface TimeFilterableDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.ImageWMSOptions {
  timeFilterable?: boolean;
  timeFilter?: TimeFilterOptions;
}

export interface TimeFilterableDataSource extends DataSource {
  options: TimeFilterableDataSourceOptions;
  filterByDate(date: Date | [Date, Date]);
  filterByYear(year: string | [string, string]);
}
