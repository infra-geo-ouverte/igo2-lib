import olSourceTileArcGISRest from 'ol/source/TileArcGISRest';
import { Options } from 'ol/source/TileArcGISRest';

import { QueryHtmlTarget } from '../../../query/shared/query.enums';
import { DataSource } from './datasource';
import { Legend } from './datasource.interface';
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
