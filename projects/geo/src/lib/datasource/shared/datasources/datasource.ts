import {
  DataSourceOptions,
  DataSourceLegendOptions
} from './datasource.interface';

import { DataService } from './data.service';

export abstract class DataSource {
  public id: string;
  public ol: ol.source.Source;

  constructor(
    public options: DataSourceOptions = {},
    protected dataSourceService?: DataService
  ) {
    this.options = options;
    this.id = this.generateId();
    this.ol = this.createOlSource();
  }

  protected abstract createOlSource(): ol.source.Source;

  protected abstract generateId(): string;

  getLegend(): DataSourceLegendOptions[] {
    return this.options.legend ? [this.options.legend] : [];
  }
}
