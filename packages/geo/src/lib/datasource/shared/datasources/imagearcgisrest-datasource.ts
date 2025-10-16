import ImageArcGISRest from 'ol/source/ImageArcGISRest';

import { QueryHtmlTarget } from '../../../query/shared/query.enums';
import { DataSource } from './datasource';
import { ArcGISRestImageDataSourceOptions } from './imagearcgisrest-datasource.interface';

export class ImageArcGISRestDataSource extends DataSource {
  declare public ol: ImageArcGISRest;
  declare public options: ArcGISRestImageDataSourceOptions;

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

  get saveableOptions(): Partial<ArcGISRestImageDataSourceOptions> {
    const baseOptions = super.saveableOptions;
    return {
      ...baseOptions,
      params: this.options.params
    };
  }

  protected createOlSource(): ImageArcGISRest {
    const params =
      this.options.layer === undefined
        ? this.options.params
        : Object.assign(
            { LAYERS: `show:${this.options.layer}` },
            this.options.params
          );

    if (typeof params.renderingRule === 'object') {
      params.renderingRule = JSON.stringify(params.renderingRule);
    }

    return new ImageArcGISRest({
      ratio: 1,
      params,
      url: this.options.url
    });
  }

  public onUnwatch() {
    // empty
  }
}
