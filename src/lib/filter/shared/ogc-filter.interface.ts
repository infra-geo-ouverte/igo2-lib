import { Md5 } from 'ts-md5';

export interface OgcFilter extends ol.format.filter.Filter {

}

export interface WFSWriteGetFeatureOptions extends ol.olx.format.WFSWriteGetFeatureOptions {
}


export type AnyBaseOgcFilterOptions =
OgcFilterCondionsArrayOptions |OgcFilterSpatialOptions | OgcFilterDuringOptions |
OgcFilterIsBetweenOptions | OgcFilterEqualToOptions | OgcFilterGreaterLessOptions |
OgcFilterIsLikeOptions | OgcFilterIsNullOptions

export type IgoOgcFilterObject = IgoLogicalArrayOptions | AnyBaseOgcFilterOptions

export interface OgcFiltersOptions {
  filtersAreEditable: boolean;
  filters: IgoLogicalArrayOptions[] | AnyBaseOgcFilterOptions;
  interfaceOgcFilters: any[];
}

export interface IgoLogicalArrayOptions {
  logical: string,
  filters: IgoLogicalArrayOptions[] | AnyBaseOgcFilterOptions
}

export interface OgcFilterCondionsArrayOptions {
  conditions: OgcFilter[]
}

export interface OgcFilterSpatialOptions {
  geometryName: string;
  geometry?: ol.geom.Geometry;
  wkt_geometry?: string;
  extent?: ol.Extent;
  srsName?: string;
  active: boolean;
  id: Md5;
}
export interface OgcFilterAttributeOptions {
  propertyName: string;
  active: boolean;
  id: Md5;
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
export interface OgcFilterIsNullOptions extends OgcFilterAttributeOptions {
}

export interface OgcInterfaceFilterOptions {
  filterid?: any;
  propertyName?: string;
  igoSpatialSelector?: string;
  operator?: string;
  active?: boolean;
  id?: Md5;
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
  geometry?: ol.geom.Geometry;
  extent?: ol.Extent;
  srsName?: string;
  parentLogical?: string;
  abbrev?: string;
}
