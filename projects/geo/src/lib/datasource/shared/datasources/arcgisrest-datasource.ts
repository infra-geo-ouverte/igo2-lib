import olSourceVector from 'ol/source/Vector';
import olFormatEsriJSON from 'ol/format/EsriJSON';
import * as olloadingstrategy from 'ol/loadingstrategy';

import { uuid } from '@igo2/utils';

import { DataSource } from './datasource';
import { ArcGISRestDataSourceOptions } from './arcgisrest-datasource.interface';

export class ArcGISRestDataSource extends DataSource {
  public ol: olSourceVector;
  public options: ArcGISRestDataSourceOptions;

  protected createOlSource(): olSourceVector {
    const esrijsonFormat = new olFormatEsriJSON();
    return new olSourceVector({
      attributions: this.options.params.attributions,
      overlaps: false,
      format: esrijsonFormat,
      url: function(extent, resolution, proj) {
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
        if (this.options.params.timeFilter) {
          const time = `time=${this.options.params.timeExtent}`;
          params.push(time);
        }
        return `${baseUrl}?${params.join('&')}`;
      }.bind(this),
      strategy: olloadingstrategy.bbox
    });
  }

  protected generateId() {
    return uuid();
  }
}
