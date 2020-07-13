import olSourceTileArcGISRest from 'ol/source/TileArcGISRest';

import { DataSource } from './datasource';
import { Legend } from './datasource.interface';
import { TileArcGISRestDataSourceOptions } from './tilearcgisrest-datasource.interface';
import { QueryHtmlTarget } from '../../../query/shared/query.enums';

export class TileArcGISRestDataSource extends DataSource {
  public ol: olSourceTileArcGISRest;
  public options: TileArcGISRestDataSourceOptions;

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
    return new olSourceTileArcGISRest(this.options);
  }

  getLegend(): Legend[] {
    const legend = super.getLegend();
    if (this.options.legendInfo === undefined || legend.length > 0) {
      return legend;
    }

    const id = parseInt(this.options.layer, 10);
    const lyr = this.options.legendInfo.layers[id];
    let htmlString = '<table><tr><td>' + lyr.layerName + '</td></tr>';

    for (const lyrLegend of lyr.legend) {
      const src = `${this.options.url}/${lyr.layerId}/images/${
        lyrLegend.url
      }`;
      const label = lyrLegend.label.replace('<Null>', 'Null');
      htmlString +=
        `<tr><td align='left'><img src="` +
        src +
        `" alt ='' /></td><td>` +
        label +
        '</td></tr>';
    }
    htmlString += '</table>';
    return [{ html: htmlString }];
  }

  public onUnwatch() {}
}
