import olSource from 'ol/source/Source';
import { SubjectStatus } from '@igo2/utils';
import { Subject } from 'rxjs';

import {
  DataSourceOptions,
  DataSourceLegendOptions
} from './datasource.interface';

import { DataService } from './data.service';

export abstract class DataSource {
  public id: string;
  public ol: olSource;
  public layerStatus$: Subject<SubjectStatus>;

  constructor(
    public options: DataSourceOptions = {},
    protected dataService?: DataService
  ) {
    this.layerStatus$ = new Subject();
    this.layerStatus$.subscribe(status => {
      this.onLayerStatusChange(status);
    });
    this.options = options;
    this.id = this.generateId();
    this.ol = this.createOlSource();

  }

  protected abstract createOlSource(): olSource;

  protected abstract generateId(): string;

  getLegend(): DataSourceLegendOptions[] {
    return this.options.legend ? [this.options.legend] : [];
  }

  protected abstract onLayerStatusChange(status: SubjectStatus): void;
}
