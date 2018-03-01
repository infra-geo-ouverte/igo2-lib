import { Pipe, PipeTransform } from '@angular/core';

import { DataSource, TimeFilterableDataSource } from '../../datasource';

@Pipe({
  name: 'filterableDataSource'
})
export class FilterableDataSourcePipe implements PipeTransform {

  transform(value: DataSource[], arg: string): any {
    let dataSources;

    if (arg === 'time') {
      dataSources = value.filter((dataSource: any) => {
        return dataSource.isTimeFilterable() &&
          dataSource.options.timeFilter !== undefined &&
          Object.keys(dataSource.options.timeFilter).length;
      }) as any[] as TimeFilterableDataSource[];
    }

    return dataSources;
  }

}
