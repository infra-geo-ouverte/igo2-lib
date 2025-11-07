import ImageArcGISRest from 'ol/source/ImageArcGISRest';

import { QueryHtmlTarget } from '../../../query/shared/query.enums';
import { DataSource } from './datasource';
import { Legend } from './datasource.interface';
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

  getLegend(): Legend[] {
    const legendInfo = this.options.legendInfo;
    const legend = super.getLegend();
    if (
      legendInfo === undefined ||
      this.options.layer === undefined ||
      legend.length > 0
    ) {
      return legend;
    }

    if (!legendInfo) {
      return;
    }
    let htmlString = '<table>';

    for (const legendElement of legendInfo.legend) {
      const src = `${this.options.url}/${legendInfo.layerId}/images/${legendElement.url}`;
      const label = legendElement.label.replace('<Null>', 'Null');
      htmlString +=
        `<tr><td align='left'><img src="` +
        src +
        `" alt ='' /></td><td >` +
        label +
        '</td></tr>';
    }
    htmlString += '</table>';
    return [{ html: htmlString }];
  }

  public onUnwatch() {
    // empty
  }
}
