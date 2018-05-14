import { DataSourceOptions, DataSourceLegendOptions, TimeFilterableDataSource,
         QueryableDataSource, OgcFilterableDataSource } from './datasource.interface';
import { DataService } from './data.service';

export abstract class DataSource {

  public id: string;
  public ol: ol.source.Source;

  get title(): string {
    return this.options.alias ? this.options.alias : this.options.title;
  }

  set title(title: string) {
    this.options.title = title;
  }

  constructor(public options: DataSourceOptions, protected dataSourceService?: DataService) {
    this.options = options;
    this.id = this.generateId();
    this.ol = this.createOlSource();
  }

  protected abstract createOlSource(): ol.source.Source;

  protected abstract generateId(): string;

  getLegend(): DataSourceLegendOptions[] {
    return this.options.legend ? [this.options.legend] : [];
  }

  isTimeFilterable(): this is TimeFilterableDataSource {
    const dataSource = this as any as TimeFilterableDataSource;
    if (typeof dataSource.filterByDate === 'function' ||
    typeof dataSource.filterByYear === 'function') {
      return dataSource.options.timeFilterable !== undefined ?
        dataSource.options.timeFilterable : true;
    }

    return false;
  }

  isQueryable(): this is QueryableDataSource {
    const layer = this as any as QueryableDataSource;
    if (typeof layer.getQueryUrl === 'function') {
      return layer.options.queryable !== undefined ?
        layer.options.queryable : true;
    }

    return false;
  }

  isOgcFilterable(): this is OgcFilterableDataSource {
    const dataSource = this as any as OgcFilterableDataSource;
    if (dataSource.options.isOgcFilterable && dataSource.options.ogcFilters.filtersAreEditable) {
      return true;
    }
    return false;
  }

}
