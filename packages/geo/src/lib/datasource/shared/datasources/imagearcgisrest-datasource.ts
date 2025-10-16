import ImageArcGISRest from 'ol/source/ImageArcGISRest';

import { Legend } from '../../../layer/shared/layers/legend.interface';
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

  getLegend(): Legend {
    const legendInfo = this.options.legendInfo;

    if (!legendInfo) {
      return;
    }
    let htmlString = '';

    for (const legendElement of legendInfo.legend) {
      const src = `${this.options.url}/${legendInfo.layerId}/images/${legendElement.url}`;
      const label = legendElement.label.replace('<Null>', 'Null');
      htmlString += `<tr><td align='left'><img src="${src}" alt ='' /></td><td>${label}</td></tr>`;
    }
    return { html: `<table>${htmlString}</table>` };
  }
}
