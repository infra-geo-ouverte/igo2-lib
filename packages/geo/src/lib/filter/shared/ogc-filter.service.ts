import { Injectable } from '@angular/core';

import olProjection from 'ol/proj/Projection';

import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { OgcFilterWriter } from './ogc-filter';
import { OgcFilterableDataSource } from './ogc-filter.interface';

@Injectable()
export class OGCFilterService {
  constructor() {}

  public filterByOgc(wmsDatasource: WMSDataSource, filterString: string) {
    const appliedFilter = new OgcFilterWriter().formatProcessedOgcFilter(filterString, wmsDatasource.options.params.LAYERS);
    wmsDatasource.ol.updateParams({ FILTER: appliedFilter });
  }

  public setOgcWFSFiltersOptions(wfsDatasource: OgcFilterableDataSource) {
    const options: any = wfsDatasource.options;
    const ogcFilterWriter = new OgcFilterWriter();

    if (options.ogcFilters.enabled && options.ogcFilters.filters) {
      options.ogcFilters.filters = ogcFilterWriter.checkIgoFiltersProperties(
        options.ogcFilters.filters,
        options.paramsWFS.fieldNameGeometry,
        new olProjection({ code: options.paramsWFS.srsName }),
        true
      );
      if (!options.ogcFilters.interfaceOgcFilters) {
        options.ogcFilters.interfaceOgcFilters = ogcFilterWriter.defineInterfaceFilterSequence(
          options.ogcFilters.filters,
          options.paramsWFS.fieldNameGeometry
        );
      }
    }
  }

  public setOgcWMSFiltersOptions(wmsDatasource: OgcFilterableDataSource) {
    const options: any = wmsDatasource.options;
    const ogcFilterWriter = new OgcFilterWriter();

    if (options.ogcFilters.enabled && options.ogcFilters.filters) {
      options.ogcFilters.filters = ogcFilterWriter.checkIgoFiltersProperties(
        options.ogcFilters.filters,
        options.fieldNameGeometry,
        undefined,
        true
      );
      if (!options.ogcFilters.interfaceOgcFilters) {
        options.ogcFilters.interfaceOgcFilters = ogcFilterWriter.defineInterfaceFilterSequence(
          // With some wms server, this param must be set to make spatials call.
          options.ogcFilters.filters,
          options.fieldNameGeometry
        );
      }
      this.filterByOgc(
        wmsDatasource as WMSDataSource,
        ogcFilterWriter.buildFilter(options.ogcFilters.filters)
      );
      options.filtered = true;
    } else {
      options.ogcFilters.filters = undefined;
      options.ogcFilters.interfaceOgcFilters = [];
      options.filtered = false;
    }
  }
}
