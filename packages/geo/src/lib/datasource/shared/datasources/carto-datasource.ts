import olSourceCarto from 'ol/source/CartoDB';

import { QueryHtmlTarget } from '../../../query/shared/query.enums';
import { CartoDataSourceOptions } from './carto-datasource.interface';
import { DataSource } from './datasource';

export class CartoDataSource extends DataSource {
  declare public ol: olSourceCarto;
  declare public options: CartoDataSourceOptions;

  get params(): any {
    return this.options.params as any;
  }

  get queryTitle(): string {
    return (this.options as any).queryTitle
      ? (this.options as any).queryTitle
      : 'title';
  }

  get mapLabel(): string {
    return (this.options as any).mapLabel;
  }

  get queryHtmlTarget(): string {
    return (this.options as any).queryHtmlTarget
      ? (this.options as any).queryHtmlTarget
      : QueryHtmlTarget.BLANK;
  }

  get saveableOptions(): Partial<CartoDataSourceOptions> {
    const baseOptions = super.saveableOptions;
    return {
      ...baseOptions,
      params: this.options.params
    };
  }

  protected createOlSource(): olSourceCarto {
    const crossOrigin = this.options.crossOrigin
      ? this.options.crossOrigin
      : 'anonymous';
    const sourceOptions = Object.assign(
      {
        crossOrigin
      },
      this.options
    );
    return new olSourceCarto(sourceOptions);
  }

  public onUnwatch() {
    // empty
  }
}
