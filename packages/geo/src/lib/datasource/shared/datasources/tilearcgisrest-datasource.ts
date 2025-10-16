import olSourceTileArcGISRest from 'ol/source/TileArcGISRest';
import { Options } from 'ol/source/TileArcGISRest';

import { QueryHtmlTarget } from '../../../query/shared/query.enums';
import { DataSource } from './datasource';
import { TileArcGISRestDataSourceOptions } from './tilearcgisrest-datasource.interface';

export class TileArcGISRestDataSource extends DataSource {
  declare public ol: olSourceTileArcGISRest;
  declare public options: TileArcGISRestDataSourceOptions;

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

  get saveableOptions(): Partial<TileArcGISRestDataSourceOptions> {
    const baseOptions = super.saveableOptions;
    return {
      ...baseOptions,
      params: this.options.params
    };
  }

  protected createOlSource(): olSourceTileArcGISRest {
    return new olSourceTileArcGISRest(this.options as Options);
  }

  public onUnwatch() {
    // empty
  }
}
