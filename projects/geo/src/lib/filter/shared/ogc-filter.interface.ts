import Geometry from 'ol/geom/Geometry';
import Filter from 'ol/format/filter/Filter';

import { DataSource } from '../../datasource/shared/datasources/datasource';
import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

export interface OgcFilter extends Filter {}

export interface WFSWriteGetFeatureOptions
  extends ol.olx.format.WFSWriteGetFeatureOptions {
  filter: any;
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
  filtersAreEditable: boolean;
  filters: IgoLogicalArrayOptions[] | AnyBaseOgcFilterOptions;
  interfaceOgcFilters: any[];
}

export interface OgcFilterableDataSourceOptions extends DataSourceOptions {
  isOgcFilterable?: boolean;
  ogcFilters?: OgcFiltersOptions;
}
export interface OgcFilterableDataSource extends DataSource {
  options: OgcFilterableDataSourceOptions;
}

export interface IgoLogicalArrayOptions {
  logical: string;
  filters: IgoLogicalArrayOptions[] | AnyBaseOgcFilterOptions;
}

export interface OgcFilterCondionsArrayOptions {
  conditions: OgcFilter[];
}

export interface OgcFilterSpatialOptions {
  geometryName: string;
  geometry?: Geometry;
  wkt_geometry?: string;
  extent?: [number, number, number, number];
  srsName?: string;
  active: boolean;
  id: string;
}
export interface OgcFilterAttributeOptions {
  propertyName: string;
  active: boolean;
  id: string;
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
  matchCase: boolean;
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
  geometry?: Geometry;
  extent?: [number, number, number, number];
  srsName?: string;
  parentLogical?: string;
  abbrev?: string;
}
