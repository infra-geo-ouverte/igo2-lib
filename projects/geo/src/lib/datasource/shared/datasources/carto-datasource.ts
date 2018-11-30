import olSourceCarto from 'ol/source/CartoDB';

import { uuid } from '@igo2/utils';

import { DataSource } from './datasource';
import { DataSourceLegendOptions } from './datasource.interface';
import { CartoDataSourceOptions } from './carto-datasource.interface';

export class CartoDataSource extends DataSource {
  public ol: olSourceCarto;
  public options: CartoDataSourceOptions;

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

  protected createOlSource(): olSourceCarto {
    const crossOrigin = this.options.crossOrigin
      ? this.options.crossOrigin
      : 'Anonymous';
    const sourceOptions = Object.assign(
      {
        crossOrigin: crossOrigin
      },
      this.options
    );
    return new olSourceCarto(sourceOptions);
  }

  protected generateId() {
    return uuid();
  }

  getLegend(): DataSourceLegendOptions[] {
    const legend = super.getLegend();
    if (legend.length > 0) {
      return legend;
    }
    let htmlString = '<table>';
    if (this.options.config.layers[0].legend != null) {
      this.options.config.layers[0].legend.items.forEach(f => {
        if (f['visible'] === true) {
          htmlString +=
            '<tr><td>' +
            '<p><font size="5" color="' +
            f['value'] +
            '"> &#9679</font></p></td>' +
            '<td>' +
            f['name'] +
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
      for (let i = 0; i < types.length; i++) {
        if (layerOptions.cartocss.includes(types[i])) {
          const type = layerOptions.cartocss.split(types[i]).pop();
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
}
