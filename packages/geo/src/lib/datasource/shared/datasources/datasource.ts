import olSource from 'ol/source/Source';

import {
  DataSourceOptions,
  DataSourceLegendOptions
} from './datasource.interface';

import { DataService } from './data.service';
import { generateIdFromSourceOptions } from '../../utils/id-generator';

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

  protected generateId(): string {
    return generateIdFromSourceOptions(this.options);
  }

  getLegend(): DataSourceLegendOptions[] {
    return this.options.legend ? [this.options.legend] : [];
  }
}
