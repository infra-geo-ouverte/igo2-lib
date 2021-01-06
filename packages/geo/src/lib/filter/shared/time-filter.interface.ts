import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { WMSDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';
import { TimeFilterType, TimeFilterStyle } from './time-filter.enum';
import { BehaviorSubject } from 'rxjs';

export interface TimeFilterOptions {
  min?: string;
  max?: string;
  range?: boolean;
  value?: string;
  values?: [string, string];
  type?: TimeFilterType;
  format?: string;
  style?: TimeFilterStyle;
  step?: number;
  timeInterval?: number;
  current?: boolean;
  enabled?: boolean;
}

export interface TimeFilterableDataSourceOptions extends WMSDataSourceOptions {
  timeFilterable?: boolean;
  timeFilter?: TimeFilterOptions;
}

export interface TimeFilterableDataSource extends WMSDataSource {
  options: TimeFilterableDataSourceOptions;
  timeFilter$: BehaviorSubject<TimeFilterOptions>;
  setTimeFilter(ogcFilters: TimeFilterOptions, triggerEvent?: boolean );
  filterByDate(date: Date | [Date, Date]);
  filterByYear(year: string | [string, string]);
}
