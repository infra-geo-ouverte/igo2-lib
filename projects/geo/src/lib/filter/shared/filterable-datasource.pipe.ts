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
          this.isTimeFilterable(dataSource) &&
          dataSource.options.timeFilter !== undefined &&
          Object.keys(dataSource.options.timeFilter).length
        );
      }) as any[]) as TimeFilterableDataSource[];
    }
    if (arg === 'ogc') {
      dataSources = (value.filter((dataSource: any) => {
        return this.isOgcFilterable(dataSource);
      }) as any[]) as OgcFilterableDataSource[];
    }
    return dataSources;
  }

  private isTimeFilterable(dataSource: TimeFilterableDataSource) {
    if (
      typeof dataSource.filterByDate === 'function' ||
      typeof dataSource.filterByYear === 'function'
    ) {
      return dataSource.options.timeFilterable !== undefined
        ? dataSource.options.timeFilterable
        : true;
    }

    return false;
  }

  private isOgcFilterable(dataSource: OgcFilterableDataSource) {
    if (
      dataSource.options.isOgcFilterable &&
      dataSource.options.ogcFilters.filtersAreEditable
    ) {
      return true;
    }
    return false;
  }
}
