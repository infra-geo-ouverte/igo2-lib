import olSourceCarto from 'ol/source/CartoDB';

import { QueryHtmlTarget } from '../../../query/shared/query.enums';
import { CartoDataSourceOptions } from './carto-datasource.interface';
import { DataSource } from './datasource';
import { Legend } from './datasource.interface';

export class CartoDataSource extends DataSource {
  public declare ol: olSourceCarto;
  public declare options: CartoDataSourceOptions;

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

  getLegend(): Legend[] {
    const legend = super.getLegend();
    if (legend.length > 0) {
      return legend;
    }

    let htmlString = '<table>';
    if (this.options.config.layers[0].legend) {
      this.options.config.layers[0].legend.items.forEach((f) => {
        if (f.visible === true) {
          htmlString +=
            '<tr><td>' +
            '<p><font size="5" color="' +
            f.value +
            '"> &#9679</font></p></td>' +
            '<td>' +
            f.name +
            '</td></tr>';
        }
      });
      htmlString += '</table>';
      return [{ html: htmlString }];
    } else {
      // Try to build the legend from the cartocss options
      const layerOptions = this.options.config.layers[0].options;
      // All available cartocss style options
      const types = [
        'polygon-fill:',
        'marker-fill:',
        'shield-fill:',
        'building-fill:',
        'line-color:'
      ];
      for (const oneType of types) {
        if (layerOptions.cartocss.includes(oneType)) {
          const type = layerOptions.cartocss.split(oneType).pop();
          const color = type.substr(0, type.indexOf(';'));
          if (color.includes('ramp')) {
            const colors = color.split(', (')[1].split(',');
            const data = color.split(', (')[2].split(',');
            for (let j = 0; j < colors.length; j++) {
              colors[j] = colors[j].replace(/("|\))/g, '');
              data[j] = data[j].replace(/("|\))/g, '');
              if (data[j].replace(/\s+/g, '') === '=') {
                data[j] = 'Autres';
              }
              htmlString +=
                '<tr><td>' +
                '<p><font size="5" color="' +
                colors[j] +
                '"> &#9679</font></p></td>' +
                '<td>' +
                data[j] +
                '</td></tr>';
            }
            break;
          } else {
            const title = layerOptions.layer_name
              ? layerOptions.layer_name
              : '';
            htmlString +=
              '<tr><td>' +
              '<p><font size="5" color="' +
              color +
              '"> &#9679</font></p>' +
              '</td><td>' +
              title +
              '</td></tr>';
            break;
          }
        }
      }
      htmlString += '</table>';
      return [{ html: htmlString }];
    }
  }

  public onUnwatch() {}
}
