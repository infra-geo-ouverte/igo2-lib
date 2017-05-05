import { Pipe, PipeTransform } from '@angular/core';

import { DataSource, FilterableDataSource } from '../../datasource';

@Pipe({
  name: 'filterableDataSource'
})
export class FilterableDataSourcePipe implements PipeTransform {

  transform(value: DataSource[], arg: string): any {
    let dataSources;

    if (arg === 'time') {
      dataSources = value.filter(dataSource => {
        return dataSource.isFilterable() &&
          dataSource.options.timeFilter !== undefined;
      }) as any[] as FilterableDataSource[];
    }

    return dataSources;
  }

}
