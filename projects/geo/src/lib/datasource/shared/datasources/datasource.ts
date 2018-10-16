import olSource from 'ol/source/Source';

import {
  DataSourceOptions,
  DataSourceLegendOptions
} from './datasource.interface';

import { DataService } from './data.service';

export abstract class DataSource {
  public id: string;
  public ol: olSource;

  constructor(
    public options: DataSourceOptions = {},
    protected dataService?: DataService
  ) {
    this.options = options;
    this.id = this.generateId();
    this.ol = this.createOlSource();
  }

  protected abstract createOlSource(): olSource;

  protected abstract generateId(): string;

  getLegend(): DataSourceLegendOptions[] {
    return this.options.legend ? [this.options.legend] : [];
  }
}
