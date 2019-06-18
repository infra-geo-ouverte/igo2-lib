import olSource from 'ol/source/Source';

import {
  DataSourceOptions,
  Legend
} from './datasource.interface';

import { DataService } from './data.service';
import { generateIdFromSourceOptions } from '../../utils/id-generator';
import { ObjectUtils } from '@igo2/utils';

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

  public abstract getLegend(style?: string, scale?: number): Legend[];
}
