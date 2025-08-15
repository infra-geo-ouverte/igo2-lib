import olClusterSource from 'ol/source/Cluster';
import olSource from 'ol/source/Source';
import olVectorSource from 'ol/source/Vector';

import {
  LegendMapViewOptions,
  LegendOptions
} from '../../../layer/shared/layers/legend.interface';
import { generateIdFromSourceOptions } from '../../../utils/id-generator';
import { DataService } from './data.service';
import { DataSourceOptions, Legend } from './datasource.interface';

export abstract class DataSource {
  public id: string;
  public ol: olSource | olVectorSource | olClusterSource;
  private legend: Legend[];

  get saveableOptions(): Partial<DataSourceOptions> {
    return {
      id: this.options.id,
      type: this.options.type,
      url: this.options.url
    };
  }

  constructor(
    public options: DataSourceOptions = {},
    protected dataService?: DataService
  ) {
    this.options = options;
    this.id = this.options.id || this.generateId();
    this.ol = this.createOlSource();
  }

  protected abstract createOlSource(): olSource;

  protected generateId(): string {
    return generateIdFromSourceOptions(this.options);
  }

 public getLegend(style?: string, view?: LegendMapViewOptions): Legend[] {
     return this.legend ? this.legend : [];
  }

  public setLegend(options: LegendOptions): Legend[] {
    if (options.url) {
      this.legend = [{ url: options.url }];
    } else if (options.html) {
      this.legend = [{ html: options.html }];
    } else {
      this.legend = [];
    }

    return this.legend;
  }

  protected abstract onUnwatch();
}
