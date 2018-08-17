import olSourceTileArcGISRest from 'ol/source/TileArcGISRest';
import * as olextent from 'ol/extent';

import { uuid } from '@igo2/utils';
import { DataSource } from './datasource';
import { DataSourceLegendOptions } from './datasource.interface';
import { TileArcGISRestDataSourceOptions } from './tilearcgisrest-datasource.interface';

import { QueryFormat } from '../../../query/shared/query.enum';

export class TileArcGISRestDataSource extends DataSource {
  public ol: olSourceTileArcGISRest;

  constructor(public options: TileArcGISRestDataSourceOptions) {
    super(options);
  }

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

  protected createOlSource(): olSourceTileArcGISRest {
    return new olSourceTileArcGISRest(this.options);
  }

  protected generateId() {
    return uuid();
  }

  getLegend(): DataSourceLegendOptions[] {
    const id = parseInt(this.options.layer);
    const lyr = this.options.legendInfo.layers[id];
    let htmlString = '<table><tr><td>' + lyr.layerName + '</td></tr>';

    for (let i = 0; i < lyr.legend.length; i++) {
      const src = `${this.options.url}/${lyr.layerId}/images/${
        lyr.legend[i].url
      }`;
      const label = lyr.legend[i].label.replace('<Null>', 'Null');
      htmlString +=
        "<tr><td align='left'><img src=\"" +
        src +
        "\" alt ='' /></td><td>" +
        label +
        '</td></tr>';
    }
    htmlString += '</table>';
    return [{ html: htmlString }];
  }
}
