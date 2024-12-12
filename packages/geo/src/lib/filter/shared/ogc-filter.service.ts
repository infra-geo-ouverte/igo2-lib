import { Injectable } from '@angular/core';

import olProjection from 'ol/proj/Projection';

import type { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import type { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { searchFilter } from './filter.utils';
import { OgcFilterWriter } from './ogc-filter';
import {
  AnyBaseOgcFilterOptions,
  IgoLogicalArrayOptions,
  OgcFilterableDataSource,
  OgcInterfaceFilterOptions
} from './ogc-filter.interface';

@Injectable()
export class OGCFilterService {
  public filterByOgc(wmsDatasource: WMSDataSource, filterString: string) {
    const appliedFilter = new OgcFilterWriter().formatProcessedOgcFilter(
      filterString,
      wmsDatasource.options.params.LAYERS
    );
    wmsDatasource.ol.updateParams({ FILTER: appliedFilter });
  }

  public setOgcWFSFiltersOptions(options: WFSDataSourceOptions) {
    const ogcFilterWriter = new OgcFilterWriter();

    if (options.ogcFilters.enabled && options.ogcFilters.filters) {
      options.ogcFilters.filters = ogcFilterWriter.checkIgoFiltersProperties(
        options.ogcFilters.filters,
        options.paramsWFS.fieldNameGeometry,
        new olProjection({ code: options.paramsWFS.srsName }),
        true
      );
      if (!options.ogcFilters.interfaceOgcFilters) {
        options.ogcFilters.interfaceOgcFilters =
          ogcFilterWriter.defineInterfaceFilterSequence(
            options.ogcFilters.filters,
            options.paramsWFS.fieldNameGeometry
          );
      } else {
        const mergedInterfaceOgcFilters = this.mergeInterfaceFilters(
          options.ogcFilters.filters,
          options.ogcFilters.interfaceOgcFilters
        );

        options.ogcFilters.interfaceOgcFilters =
          ogcFilterWriter.defineInterfaceFilterSequence(
            mergedInterfaceOgcFilters,
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
        options.ogcFilters.interfaceOgcFilters =
          ogcFilterWriter.defineInterfaceFilterSequence(
            // With some wms server, this param must be set to make spatials call.
            options.ogcFilters.filters,
            options.fieldNameGeometry
          );
      } else {
        const mergedInterfaceOgcFilters = this.mergeInterfaceFilters(
          options.ogcFilters.filters,
          options.ogcFilters.interfaceOgcFilters
        );

        options.ogcFilters.interfaceOgcFilters =
          ogcFilterWriter.defineInterfaceFilterSequence(
            mergedInterfaceOgcFilters,
            options.fieldNameGeometry
          );
      }
      this.filterByOgc(
        wmsDatasource as WMSDataSource,
        ogcFilterWriter.buildFilter(
          options.ogcFilters.filters,
          undefined,
          undefined,
          undefined,
          wmsDatasource.options
        )
      );
      options.filtered = true;
    } else {
      options.ogcFilters.filters = undefined;
      options.ogcFilters.interfaceOgcFilters = [];
      options.filtered = false;
    }
  }

  private mergeInterfaceFilters(
    filters: IgoLogicalArrayOptions | AnyBaseOgcFilterOptions,
    interfaceOgcFilters: OgcInterfaceFilterOptions[]
  ) {
    return interfaceOgcFilters.map((interfaceOgc) => {
      const filter = searchFilter(
        filters,
        'propertyName',
        interfaceOgc.propertyName
      );

      if (filter) {
        return { ...interfaceOgc, filterid: filter.filterid };
      }
      return interfaceOgc;
    });
  }
}
