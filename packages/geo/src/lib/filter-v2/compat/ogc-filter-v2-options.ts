import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';
import { OgcFilterConfig } from '../model';

/**
 * JSON contract of the native filter-v2 configuration accepted in contexts:
 * a partial `OgcFilterConfig` normalized at datasource creation.
 */
export type OgcFilterConfigInput = Partial<OgcFilterConfig>;

/**
 * Datasource options carrying a native filter-v2 configuration. When
 * present, the `DataSourceService` creates an `OgcFilterStore` from it and
 * keeps the datasource request parameters in sync through the
 * `OgcFilterFacade`. Takes precedence over the legacy `ogcFilters` pipeline.
 */
export interface OgcFilterableV2DataSourceOptions extends DataSourceOptions {
  ogcFiltersV2?: OgcFilterConfigInput;
}

export function normalizeOgcFilterConfig(
  input: OgcFilterConfigInput
): OgcFilterConfig {
  return {
    enabled: input.enabled ?? true,
    editable: input.editable ?? false,
    geometryName: input.geometryName ?? 'geometry',
    filters: input.filters,
    selectors: input.selectors,
    fields: input.fields
  };
}
