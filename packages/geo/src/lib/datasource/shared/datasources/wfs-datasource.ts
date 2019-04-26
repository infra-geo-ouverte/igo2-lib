import olSourceVector from 'ol/source/Vector';
import * as OlLoadingStrategy from 'ol/loadingstrategy';
import * as OlFormat from 'ol/format';

import { uuid } from '@igo2/utils';

import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSService } from './wfs.service';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import { OgcFilterableDataSourceOptions } from '../../../filter/shared/ogc-filter.interface';

export class WFSDataSource extends DataSource {
  public ol: olSourceVector;

  constructor(
    public options: WFSDataSourceOptions,
    protected wfsService: WFSService
  ) {
    super(options);
    this.options = this.wfsService.checkWfsOptions(options);
    this.wfsService.getSourceFieldsFromWFS(this.options);
  }

  protected createOlSource(): olSourceVector {

    const ogcFiltersDefaultValue = true; // default values for wfs.
    let ogcFilters  = (this.options as OgcFilterableDataSourceOptions).ogcFilters;
    // reassignation of params to paramsWFS and url to urlWFS to have a common interface with wms-wfs datasources
    this.options.paramsWFS = this.options.params;
    const paramsWFS = this.options.paramsWFS;
    this.options.urlWfs = this.options.url;
    paramsWFS.version = paramsWFS.version || '2.0.0';

    ogcFilters = ogcFilters || {} ;
    ogcFilters.enabled = ogcFilters.enabled || ogcFiltersDefaultValue;
    ogcFilters.editable =   ogcFilters.editable || ogcFiltersDefaultValue;
    ogcFilters.geometryName = paramsWFS.fieldNameGeometry || 'geometry';

    const url = this.options.urlWfs;
    const outputFormat = paramsWFS.outputFormat ? `outputFormat=${paramsWFS.outputFormat}` : '';
    const wfsVersion = paramsWFS.version  ?  `version=${paramsWFS.version}` : 'version=2.0.0';

    const paramTypename = paramsWFS.version === '2.0.0' ? 'typenames' : 'typename';
    const paramMaxFeatures = paramsWFS.version === '2.0.0' ? 'count' : 'maxFeatures';
    const featureTypes = `${paramTypename}=${paramsWFS.featureTypes}`;
    const maxFeatures = paramsWFS.maxFeatures ? `${paramMaxFeatures}=${paramsWFS.maxFeatures}` : `${paramMaxFeatures}=5000`;

    let downloadBaseUrl = `${url}?service=WFS&request=GetFeature&${wfsVersion}&${featureTypes}&`;
    downloadBaseUrl += `${outputFormat}&${maxFeatures}`;

    this.options.download = Object.assign({}, this.options.download, {
      dynamicUrl: downloadBaseUrl
    });

    return new olSourceVector({
      format: this.getFormatFromOptions(),
      overlaps: false,
      url: (extent, resolution, proj) => {
        const srsname = paramsWFS.srsName ? `srsname=${paramsWFS.srsName}` : `srsname=${proj.getCode()}`;
        let filters;
        const ogcfilters = (this.options as OgcFilterableDataSourceOptions).ogcFilters;
        if (ogcfilters && ogcfilters.enabled) {
          filters = ogcFilters.filters;
        }
        paramsWFS.xmlFilter = new OgcFilterWriter().buildFilter(
          filters,
          extent,
          proj,
          ogcFilters.geometryName
        );

        let baseUrl = `${url}?service=WFS&request=GetFeature&${wfsVersion}&${featureTypes}&`;
        baseUrl += `${outputFormat}&${srsname}&${maxFeatures}`;

        const patternFilter = /(filter|bbox)=.*/gi;
        baseUrl = patternFilter.test(paramsWFS.xmlFilter) ? `${baseUrl}&${paramsWFS.xmlFilter}` : baseUrl;

        this.options.download = Object.assign({}, this.options.download, {
          dynamicUrl: baseUrl
        });

        return baseUrl;
      },
      strategy: OlLoadingStrategy.bbox
    });
  }

  private getFormatFromOptions() {
    let olFormatCls;

    const outputFormat = this.options.paramsWFS.outputFormat.toLowerCase();
    const patternGml3 = new RegExp('.*?gml.*?');
    const patternGeojson = new RegExp('.*?json.*?');

    if (patternGeojson.test(outputFormat)) {
      olFormatCls = OlFormat.GeoJSON;
    }
    if (patternGml3.test(outputFormat)) {
      olFormatCls = OlFormat.WFS;
    }

    return new olFormatCls();
  }
}
