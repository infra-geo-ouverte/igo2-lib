import { TimeFilterStyle, TimeFilterType } from './time-filter.enum';

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
