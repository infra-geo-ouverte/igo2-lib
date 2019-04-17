import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import { OgcFilterWriter } from './ogc-filter';
import { OgcFilterableDataSource } from './ogc-filter.interface';

@Injectable()
export class OGCFilterService {
  constructor() {}

  public filterByOgc(wmsDatasource: WMSDataSource, filterString: string) {
    let appliedFilter = '';
    const wmsDatasourceLayers = wmsDatasource.options.params.layers;
    if (filterString.length > 0 && wmsDatasourceLayers.indexOf(',') !== -1) {
      wmsDatasourceLayers.split(',').forEach(element => {
        appliedFilter = appliedFilter + '(' + filterString.replace('filter=', '') + ')';
      });
      appliedFilter = 'filter=' + appliedFilter;
    } else {
      appliedFilter = filterString;
    }
    const wmsFilterValue = appliedFilter.length > 0
        ? appliedFilter.substr(7, appliedFilter.length + 1)
        : undefined;
    wmsDatasource.ol.updateParams({ filter: wmsFilterValue });
  }

  public setOgcWFSFiltersOptions(wfsDatasource: OgcFilterableDataSource) {
    const options: any = wfsDatasource.options;
    const ogcFilterWriter = new OgcFilterWriter();

    if (options.ogcFilters.enabled && options.ogcFilters.filters) {
      options.ogcFilters.filters = ogcFilterWriter.checkIgoFiltersProperties(
        options.ogcFilters.filters,
        options.paramsWFS.fieldNameGeometry,
        true
      );
      options.ogcFilters.interfaceOgcFilters = ogcFilterWriter.defineInterfaceFilterSequence(
        options.ogcFilters.filters,
        options.paramsWFS.fieldNameGeometry
      );
    } else {
      options.ogcFilters.interfaceOgcFilters = [];
    }
  }

  public setOgcWMSFiltersOptions(wmsDatasource: OgcFilterableDataSource) {
    const options: any = wmsDatasource.options;
    const ogcFilterWriter = new OgcFilterWriter();

    if (options.ogcFilters.enabled && options.ogcFilters.filters) {
      options.ogcFilters.filters = ogcFilterWriter.checkIgoFiltersProperties(
        options.ogcFilters.filters,
        options.fieldNameGeometry,
        true
      );
      options.ogcFilters.interfaceOgcFilters = ogcFilterWriter.defineInterfaceFilterSequence(
        // With some wms server, this param must be set to make spatials call.
        options.ogcFilters.filters,
        options.fieldNameGeometry
      );
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
