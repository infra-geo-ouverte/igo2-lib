import olSourceCarto from 'ol/source/CartoDB';

import { uuid } from '@igo2/utils';
import { DataSource } from './datasource';
import { DataSourceLegendOptions } from './datasource.interface';
import { CartoDataSourceOptions } from './carto-datasource.interface';

export class CartoDataSource extends DataSource {
  public ol: olSourceCarto;
  public options: CartoDataSourceOptions;

  get params(): any {
    return this.options.params as any;
  }

  get queryTitle(): string {
    return (this.options as any).queryTitle
      ? (this.options as any).queryTitle
      : 'title';
  }

  get queryHtmlTarget(): string {
    return (this.options as any).queryHtmlTarget
      ? (this.options as any).queryHtmlTarget
      : 'newtab';
  }

  protected createOlSource(): olSourceCarto {
    return new olSourceCarto(this.options);
  }

  protected generateId() {
    return uuid();
  }
}
