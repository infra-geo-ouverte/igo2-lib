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
  OgcFilterableDataSourceOptions,
  OgcFiltersOptions,
  OgcInterfaceFilterOptions
} from './ogc-filter.interface';

@Injectable({
  providedIn: 'platform'
})
export class OGCFilterService {
  public filterByOgc(wmsDatasource: WMSDataSource, filterString: string) {
    const appliedFilter = new OgcFilterWriter().formatProcessedOgcFilter(
      filterString,
      wmsDatasource.options.params.LAYERS
    );
    wmsDatasource.ol.updateParams({ FILTER: appliedFilter });
  }

  public setOgcWFSFiltersOptions(options: WFSDataSourceOptions) {
    if (!options?.ogcFilters?.enabled) return;

    const ogcFilters = options.ogcFilters;
    const geometryField = options.paramsWFS.fieldNameGeometry;
    const projection = new olProjection({ code: options.paramsWFS.srsName });
    const ogcFilterWriter = new OgcFilterWriter();

    if (ogcFilters.filters) {
      ogcFilters.filters = ogcFilterWriter.checkIgoFiltersProperties(
        ogcFilters.filters,
        geometryField,
        projection,
        true
      );
    }

    let interfaceFilters: OgcInterfaceFilterOptions[];
    if (!ogcFilters.interfaceOgcFilters) {
      interfaceFilters = ogcFilterWriter.defineInterfaceFilterSequence(
        ogcFilters.filters,
        geometryField
      );
    } else {
      if (!ogcFilters.advancedOgcFilters) {
        interfaceFilters = this.mergeInterfaceFilters(
          ogcFilters.filters,
          ogcFilters.interfaceOgcFilters
        );
      } else {
        const activeFilters = (ogcFilters.interfaceOgcFilters ?? []).filter(
          (f) => f.active === true
        );

        if (ogcFilters.interfaceOgcFilters.length > 1) {
          activeFilters[0].parentLogical = activeFilters[1].parentLogical;
        }
        interfaceFilters = activeFilters;
      }

      ogcFilters.interfaceOgcFilters =
        ogcFilterWriter.defineInterfaceFilterSequence(
          interfaceFilters,
          geometryField
        );
    }
  }

  public setOgcWMSFiltersOptions(wmsDatasource: OgcFilterableDataSource) {
    const options = wmsDatasource.options;
    const ogcFilterWriter = new OgcFilterWriter();
    const ogcFilters = options?.ogcFilters as OgcFiltersOptions;

    if (!ogcFilters?.enabled) {
      this.resetOgcFilters(ogcFilters);
      return;
    }

    const filterBy = !ogcFilters?.advancedOgcFilters
      ? this.buildStandardOgcFilters(options, ogcFilterWriter)
      : this.buildAdvancedOgcFilters(options, ogcFilterWriter);

    if (!filterBy) return;

    this.filterByOgc(wmsDatasource as WMSDataSource, filterBy);
    ogcFilters.filtered = true;
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

  private buildStandardOgcFilters(
    options: OgcFilterableDataSourceOptions,
    ogcFilterWriter: OgcFilterWriter
  ): string | undefined {
    const ogcFilters = options?.ogcFilters;
    if (!ogcFilters?.filters) return;

    ogcFilters.filters = ogcFilterWriter.checkIgoFiltersProperties(
      ogcFilters.filters,
      options.fieldNameGeometry,
      undefined,
      true
    );

    if (!ogcFilters.interfaceOgcFilters) {
      ogcFilters.interfaceOgcFilters =
        ogcFilterWriter.defineInterfaceFilterSequence(
          // With some wms server, this param must be set to make spatials call.
          ogcFilters.filters,
          options.fieldNameGeometry
        );
    } else {
      const mergedInterfaceOgcFilters = this.mergeInterfaceFilters(
        ogcFilters.filters,
        ogcFilters.interfaceOgcFilters
      );
      ogcFilters.interfaceOgcFilters =
        ogcFilterWriter.defineInterfaceFilterSequence(
          mergedInterfaceOgcFilters,
          options.fieldNameGeometry
        );
    }

    return ogcFilterWriter.buildFilter(
      ogcFilters.filters,
      undefined,
      undefined,
      undefined,
      options
    );
  }

  private resetOgcFilters(options: OgcFiltersOptions): void {
    options.filters = undefined;
    options.interfaceOgcFilters = [];
    options.filtered = false;
  }

  private buildAdvancedOgcFilters(
    options: OgcFilterableDataSourceOptions,
    ogcFilterWriter: OgcFilterWriter
  ): string | undefined {
    const { ogcFilters, fieldNameGeometry } = options;
    const currentFilters = ogcFilters.interfaceOgcFilters ?? [];

    // Build the sequence using writer
    const newFilterSequence = ogcFilterWriter.defineInterfaceFilterSequence(
      currentFilters,
      fieldNameGeometry
    );
    ogcFilters.interfaceOgcFilters = newFilterSequence;
    // Get only active filters
    const activeFilters = ogcFilters.interfaceOgcFilters.filter(
      (f) => f.active === true
    );
    if (
      activeFilters.length > 1 &&
      activeFilters[1].parentLogical !== undefined
    ) {
      activeFilters[0].parentLogical = activeFilters[1].parentLogical;
    }
    ogcFilters.filters =
      ogcFilterWriter.rebuiltIgoOgcFilterObjectFromSequence(activeFilters);
    // Build the final filter string
    return ogcFilterWriter.buildFilter(
      ogcFilters.filters,
      undefined,
      undefined,
      undefined,
      options
    );
  }
}
