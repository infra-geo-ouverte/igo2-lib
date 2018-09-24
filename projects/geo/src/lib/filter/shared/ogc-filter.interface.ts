import olGeometry from 'ol/geom/Geometry';
import olFormatFilter from 'ol/format/filter/Filter';

import { DataSource } from '../../datasource/shared/datasources/datasource';
import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

export interface OgcFilter extends olFormatFilter {}

export interface WFSWriteGetFeatureOptions {
  filter?: olFormatFilter;

  featureNS: string;
  featurePrefix: string;
  featureTypes: string[];
  srsName?: string;
  handle?: string;
  outputFormat?: string;
  maxFeatures?: number;
  geometryName?: string;
  propertyNames?: string[];
  startIndex?: number;
  count?: number;
  bbox?: [number, number, number, number];
  resultType?: string;
}

export type AnyBaseOgcFilterOptions =
  | OgcFilterCondionsArrayOptions
  | OgcFilterSpatialOptions
  | OgcFilterDuringOptions
  | OgcFilterIsBetweenOptions
  | OgcFilterEqualToOptions
  | OgcFilterGreaterLessOptions
  | OgcFilterIsLikeOptions
  | OgcFilterIsNullOptions;

export type IgoOgcFilterObject =
  | IgoLogicalArrayOptions
  | AnyBaseOgcFilterOptions;

export interface OgcFiltersOptions {
  enabled?: boolean;
  editable?: boolean;
  filters?: IgoLogicalArrayOptions | AnyBaseOgcFilterOptions;
  interfaceOgcFilters?: any[];
  filtered?: boolean;
}

export interface OgcFilterableDataSourceOptions extends DataSourceOptions {
  ogcFilters?: OgcFiltersOptions;
}
export interface OgcFilterableDataSource extends DataSource {
  options: OgcFilterableDataSourceOptions;
}

export interface IgoLogicalArrayOptions {
  logical: string;
  filters: IgoLogicalArrayOptions | AnyBaseOgcFilterOptions[];
}

export interface OgcFilterCondionsArrayOptions {
  conditions: OgcFilter[];
}

export interface OgcFilterSpatialOptions {
  geometryName: string;
  geometry?: olGeometry;
  wkt_geometry?: string;
  extent?: [number, number, number, number];
  srsName?: string;
  active: boolean;
  id: string;
}
export interface OgcFilterAttributeOptions {
  propertyName: string;
  operator: string;
  active?: boolean;
  id?: string;
}

export interface OgcFilterDuringOptions extends OgcFilterAttributeOptions {
  begin: string;
  end: string;
}
export interface OgcFilterIsBetweenOptions extends OgcFilterAttributeOptions {
  lowerBoundary: number;
  upperBoundary: number;
}
export interface OgcFilterEqualToOptions extends OgcFilterAttributeOptions {
  expression: string | number;
  matchCase?: boolean;
}
export interface OgcFilterGreaterLessOptions extends OgcFilterAttributeOptions {
  expression: number;
}
export interface OgcFilterIsLikeOptions extends OgcFilterAttributeOptions {
  pattern: string;
  wildCard?: string;
  singleChar?: string;
  escapeChar?: string;
  matchCase: boolean;
}
export interface OgcFilterIsNullOptions extends OgcFilterAttributeOptions {}

export interface OgcInterfaceFilterOptions {
  filterid?: any;
  propertyName?: string;
  igoSpatialSelector?: string;
  operator?: string;
  active?: boolean;
  id?: string;
  begin?: string;
  end?: string;
  lowerBoundary?: number;
  upperBoundary?: number;
  expression?: string | number;
  pattern?: string;
  wildCard?: string;
  singleChar?: string;
  escapeChar?: string;
  matchCase?: boolean;
  geometryName?: string;
  geometry?: olGeometry;
  wkt_geometry?: string;
  extent?: [number, number, number, number];
  srsName?: string;
  parentLogical?: string;
  abbrev?: string;
}
