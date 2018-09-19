import olSourceVector from 'ol/source/Vector';
import * as olloadingstrategy from 'ol/loadingstrategy';
import * as olformat from 'ol/format';

import { uuid } from '@igo2/utils';

import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSService } from './wfs.service';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import {  OgcFilterableDataSource } from '../../../filter/shared/ogc-filter.interface';


export class WFSDataSource extends DataSource {
  public ol: olSourceVector;
  public ogcFilterWriter: OgcFilterWriter;

  constructor(
    public options: WFSDataSourceOptions,
    protected wfsService: WFSService) {
    super(options);
    this.options = this.wfsService.checkWfsOptions(options);
    this.ogcFilterWriter = new OgcFilterWriter();
    this.wfsService.getSourceFieldsFromWFS(this.options);

    if (!(options as any).ogcFilters) {
      (options as any).ogcFilters = { enabled: true, editable: true }; // default values for wfs.
    }

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

        if ((wfsOptions as any).ogcFilters && (wfsOptions as any).ogcFilters.enabled) {
          wfsOptions.params.xmlFilter = this.ogcFilterWriter.buildFilter(
            (wfsOptions as any).ogcFilters.filters,
            extent,
            proj,
            wfsOptions.params.fieldNameGeometry
          );
        }

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
}
