import { Md5 } from 'ts-md5';
import olSourceImageWMS from 'ol/source/ImageWMS';

import { DataSource } from './datasource';
import { DataSourceLegendOptions } from './datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';

export class WMSDataSource extends DataSource {
  public ol: olSourceImageWMS;

  private queryInfoFormat: string;

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

  constructor(public options: WMSDataSourceOptions) {
    super(options);

    // Important: To use wms versions smaller than 1.3.0, SRS
    // needs to be supplied in the source "params"

    // We need to do this to override the default version
    // of openlayers which is uppercase
    const sourceParams: any = options.params;
    if (sourceParams && sourceParams.version) {
      sourceParams.VERSION = sourceParams.version;
    }
    if (options.refreshIntervalSec && options.refreshIntervalSec > 0) {
      setInterval(() => {
        this.ol.updateParams({'igoRefresh': Math.random()});
      }, options.refreshIntervalSec * 1000); // Convert seconds to MS
    }
  }

  protected createOlSource(): olSourceImageWMS {
    return new olSourceImageWMS(this.options);
  }

  protected generateId() {
    const layers = this.params.layers;
    const chain = 'wms' + this.options.url + layers;

    return Md5.hashStr(chain) as string;
  }

  getLegend(): DataSourceLegendOptions[] {
    let legend = super.getLegend();
    if (legend.length > 0) {
      return legend;
    }

    const sourceParams = this.params;

    let layers = [];
    if (sourceParams.layers !== undefined) {
      layers = sourceParams.layers.split(',');
    }

    const baseUrl = this.options.url.replace(/\?$/, '');
    const params = [
      'REQUEST=GetLegendGraphic',
      'SERVICE=wms',
      'FORMAT=image/png',
      'SLD_VERSION=1.1.0',
      `VERSION=${sourceParams.version || '1.3.0'}`
    ];

    legend = layers.map((layer: string) => {
      return {
        url: `${baseUrl}?${params.join('&')}&LAYER=${layer}`,
        title: layers.length > 1 ? layer : undefined
      };
    });

    return legend;
  }
}
