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
    public legend: Legend[] = [],
    protected dataService?: DataService
  ) {
    this.options = options;
    this.id = this.generateId();
    this.ol = this.createOlSource();

    // legend
    const style = this.options.legendOptions ?
    this.options.legendOptions.stylesAvailable ?
      this.options.legendOptions.stylesAvailable[0].name : '' : '';

    this.legend = style ? this.getLegend(style) : this.getLegend();

    if (this.options.legendOptions !== undefined || this.options.legendOptions) {
      let legendItemOptions: Legend = {
        url: this.options.legendOptions.url ? this.options.legendOptions.url : undefined
      } as Legend;
      legendItemOptions = ObjectUtils.removeUndefined(legendItemOptions);
      this.legend = this.legend.map((l: Legend) => ObjectUtils.mergeDeep(l, legendItemOptions));
    }
  }

  protected abstract createOlSource(): olSource;

  protected generateId(): string {
    return generateIdFromSourceOptions(this.options);
  }

  getLegend(style?: string, scale?: number): Legend[] {
    return this.legend;
  }

  setLegend(style: string, scale: number): Legend[] {
    this.legend = this.getLegend(style, scale);
    return this.legend;
  }
}
