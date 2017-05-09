import { DataSourceOptions, DataSourceLegendOptions, FilterableDataSource,
         QueryableDataSource } from './datasource.interface';

export abstract class DataSource {

  public id: string;
  public ol: ol.source.Source;
  public options: DataSourceOptions;

  get title(): string {
    return this.options.alias ? this.options.alias : this.options.title;
  }

  set title(title: string) {
    this.options.title = title;
  }

  constructor(options: DataSourceOptions) {
    this.options = options;
    this.id = this.generateId();
    this.ol = this.createOlSource();
  }

  protected abstract createOlSource(): ol.source.Source;

  protected abstract generateId(): string;

  getLegend(): DataSourceLegendOptions[] {
    return this.options.legend ? [this.options.legend] : [];
  }

  isFilterable(): this is FilterableDataSource {
    const dataSource = this as any as FilterableDataSource;
    if (typeof dataSource.filterByDate === 'function') {
      return dataSource.options.filterable !== undefined ?
        dataSource.options.filterable : true;
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

}
