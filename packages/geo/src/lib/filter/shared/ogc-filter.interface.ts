import olGeometry from 'ol/geom/Geometry';
import olFormatFilter from 'ol/format/filter/Filter';

import { DataSource } from '../../datasource/shared/datasources/datasource';
import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';
import { OgcFilterOperatorType } from './ogc-filter.enum';

export interface OgcFilter extends olFormatFilter {}

export interface WFSWriteGetFeatureOptions {
  featureNS?: string;
  featurePrefix?: string;
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
  filter?: olFormatFilter;
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
  pushButtons?: IgoPushButton;
  interfaceOgcFilters?: OgcInterfaceFilterOptions[];
  filtered?: boolean;
  advancedOgcFilters?: boolean;
  geometryName?: string;
  allowedOperatorsType?: OgcFilterOperatorType;
}

export interface IgoPushButton  {
  groups?: PushButtonGroup[];
  bundles?: OgcPushButtonBundle[];
}

export interface PushButtonGroup  {
  enabled?: boolean;
  title?: string;
  name: string;
  ids?;
  computedButtons?: OgcPushButtonBundle[];
}

export interface OgcPushButtonBundle  {
  id?: string;
  logical?: string;
  vertical?: boolean;
  buttons: OgcPushButton[];
}

export interface OgcPushButton {
  title: string;
  tooltip?: string;
  enabled: boolean;
  filters: IgoOgcFilterObject;
  color?: string;
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
  active?: boolean;
  begin?: string;
  end?: string;
  escapeChar?: string;
  expression?: string | number;
  extent?: [number, number, number, number];
  filterid?: any;
  geometry?: olGeometry;
  geometryName?: string;
  igoSpatialSelector?: string;
  level?: number;
  lowerBoundary?: number;
  matchCase?: boolean;
  operator?: string;
  parentLogical?: string;
  pattern?: string;
  propertyName?: string;
  singleChar?: string;
  srsName?: string;
  upperBoundary?: number;
  wildCard?: string;
  wkt_geometry?: string;
  // id?: string;
  // abbrev?: string;

}
