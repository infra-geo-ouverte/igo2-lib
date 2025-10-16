import olFormatEsriJSON from 'ol/format/EsriJSON';
import * as olloadingstrategy from 'ol/loadingstrategy';
import olSourceVector from 'ol/source/Vector';

import { ArcGISRestDataSourceOptions } from './arcgisrest-datasource.interface';
import { DataSource } from './datasource';

export class ArcGISRestDataSource extends DataSource {
  declare public ol: olSourceVector;
  declare public options: ArcGISRestDataSourceOptions;

  get saveableOptions(): Partial<ArcGISRestDataSourceOptions> {
    const baseOptions = super.saveableOptions;
    return {
      ...baseOptions,
      params: this.options.params,
      url: this.options.url
    };
  }

  protected createOlSource(): olSourceVector {
    const esrijsonFormat = new olFormatEsriJSON();
    return new olSourceVector({
      attributions: this.options.params.attributions,
      overlaps: false,
      format: esrijsonFormat,
      url: function (extent) {
        const baseUrl = this.options.url + '/' + this.options.layer + '/query/';
        const geometry = encodeURIComponent(
          '{"xmin":' +
            extent[0] +
            ',"ymin":' +
            extent[1] +
            ',"xmax":' +
            extent[2] +
            ',"ymax":' +
            extent[3] +
            ',"spatialReference":{"wkid":102100}}'
        );
        const params = [
          'f=json',
          `geometry=${geometry}`,
          'geometryType=esriGeometryEnvelope',
          'inSR=102100',
          'spatialRel=esriSpatialRelIntersects',
          'outFields=*',
          'returnGeometry=true',
          'outSR=102100'
        ];
        if (this.options.params.time) {
          const time = `time=${this.options.params.time}`;
          params.push(time);
        }
        if (this.options.params.customParams) {
          this.options.params.customParams.forEach((element) => {
            params.push(element);
          });
        }
        return `${baseUrl}?${params.join('&')}`;
      }.bind(this),
      strategy: olloadingstrategy.bbox
    });
  }

  public onUnwatch() {
    // empty
  }
}
