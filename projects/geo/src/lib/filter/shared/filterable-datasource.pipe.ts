import { Pipe, PipeTransform } from '@angular/core';

import { DataSource } from '../../datasource/shared/datasources/datasource';

import { OgcFilterableDataSource } from './ogc-filter.interface';
import { TimeFilterableDataSource } from './time-filter.interface';

@Pipe({
  name: 'filterableDataSource'
})
export class FilterableDataSourcePipe implements PipeTransform {
  transform(value: DataSource[], arg: string): any {
    let dataSources;

    if (arg === 'time') {
      dataSources = (value.filter((dataSource: any) => {
        return (
          dataSource.isTimeFilterable() &&
          dataSource.options.timeFilter !== undefined &&
          Object.keys(dataSource.options.timeFilter).length
        );
      }) as any[]) as TimeFilterableDataSource[];
    }
    if (arg === 'ogc') {
      dataSources = (value.filter((dataSource: any) => {
        return dataSource.isOgcFilterable();
      }) as any[]) as OgcFilterableDataSource[];
    }
    return dataSources;
  }
}
