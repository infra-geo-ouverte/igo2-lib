import olSourceVector from 'ol/source/Vector';
import * as olloadingstrategy from 'ol/loadingstrategy';
import * as olformat from 'ol/format';

import { uuid } from '@igo2/utils';

import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';

export class WFSDataSource extends DataSource {
  public ol: olSourceVector;
  public ogcFilterWriter: OgcFilterWriter;

  constructor(public options: WFSDataSourceOptions) {
    super(options);
    this.options = this.checkWfsOptions(options);
    this.ogcFilterWriter = new OgcFilterWriter();
  }

  protected generateId() {
    return uuid();
  }

  protected createOlSource(): olSourceVector {
    const wfsOptions = this.options;

    return new olSourceVector({
      format: this.getFormatFromOptions(),
      overlaps: false,
      url: (extent, resolution, proj) => {
        const baseWfsQuery = 'service=WFS&request=GetFeature';
        // Mandatory
        const url = wfsOptions.url;
        // Optional
        const outputFormat = wfsOptions.params.outputFormat
          ? 'outputFormat=' + wfsOptions.params.outputFormat
          : '';
        const wfsVersion = wfsOptions.params.version
          ? 'version=' + wfsOptions.params.version
          : 'version=' + '2.0.0';

        let paramTypename = 'typename';
        let paramMaxFeatures = 'maxFeatures';
        if (
          wfsOptions.params.version === '2.0.0' ||
          !wfsOptions.params.version
        ) {
          paramTypename = 'typenames';
          paramMaxFeatures = 'count';
        }

        const featureTypes =
          paramTypename + '=' + wfsOptions.params.featureTypes;

        const maxFeatures = wfsOptions.params.maxFeatures
          ? paramMaxFeatures + '=' + wfsOptions.params.maxFeatures
          : paramMaxFeatures + '=5000';
        const srsname = wfsOptions.params.srsname
          ? 'srsname=' + wfsOptions.params.srsname
          : 'srsname=' + proj.getCode();

        wfsOptions.params.xmlFilter = this.ogcFilterWriter.buildFilter(
          (wfsOptions as any).ogcFilters.filters,
          extent,
          proj,
          wfsOptions.params.fieldNameGeometry
        );

        let baseUrl = `${url}?${baseWfsQuery}&${wfsVersion}&${featureTypes}&`;
        baseUrl += `${outputFormat}&${srsname}&${maxFeatures}`;

        const patternFilter = /filter=.*/gi;
        if (patternFilter.test(wfsOptions.params.xmlFilter)) {
          baseUrl += `&${wfsOptions.params.xmlFilter}`;
        }

        this.options['download'] = Object.assign({}, this.options['download'], {
          dynamicUrl: baseUrl
        });

        return baseUrl;
      },
      strategy: olloadingstrategy.bbox
    });
  }

  private getFormatFromOptions() {
    let olFormatCls;

    const outputFormat = this.options.params.outputFormat.toLowerCase();
    const patternGml3 = new RegExp('.*?gml.*?');
    const patternGeojson = new RegExp('.*?json.*?');

    if (patternGeojson.test(outputFormat)) {
      olFormatCls = olformat.GeoJSON;
    }
    if (patternGml3.test(outputFormat)) {
      olFormatCls = olformat.WFS;
    }

    return new olFormatCls();
  }

  private checkWfsOptions(
    wfsDataSourceOptions: WFSDataSourceOptions
  ): WFSDataSourceOptions {
    const mandatoryParamMissing: any[] = [];

    if (!wfsDataSourceOptions.url) {
      mandatoryParamMissing.push('url');
    }
    ['featureTypes', 'fieldNameGeometry', 'outputFormat'].forEach(element => {
      if (wfsDataSourceOptions.params[element] === undefined) {
        mandatoryParamMissing.push(element);
      }
    });

    if (mandatoryParamMissing.length > 0) {
      throw new Error(
        `A mandatory parameter is missing
          for your WFS datasource source.
          (Mandatory parameter(s) missing :` + mandatoryParamMissing
      );
    }

    // Look at https://github.com/openlayers/openlayers/pull/6400
    const patternGml = new RegExp('.*?gml.*?');

    if (patternGml.test(wfsDataSourceOptions.params.outputFormat)) {
      wfsDataSourceOptions.params.version = '1.1.0';
    }

    return Object.assign({}, wfsDataSourceOptions, {
      wfsCapabilities: { xml: '', GetPropertyValue: false }
    });
  }
}
