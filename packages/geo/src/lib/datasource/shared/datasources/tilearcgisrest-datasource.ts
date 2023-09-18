import olSourceTileArcGISRest from 'ol/source/TileArcGISRest';
import { Options } from 'ol/source/TileArcGISRest';

import { DataSource } from './datasource';
import { Legend } from './datasource.interface';
import { TileArcGISRestDataSourceOptions } from './tilearcgisrest-datasource.interface';
import { QueryHtmlTarget } from '../../../query/shared/query.enums';

export class TileArcGISRestDataSource extends DataSource {
  public declare ol: olSourceTileArcGISRest;
  public declare options: TileArcGISRestDataSourceOptions;

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
        `" alt ='' /></td><td class="mat-typography">` +
        label +
        '</td></tr>';
    }
    htmlString += '</table>';
    return [{ html: htmlString }];
  }

  public onUnwatch() {}
}
