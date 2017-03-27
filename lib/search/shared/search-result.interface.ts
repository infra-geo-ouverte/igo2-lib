export interface SearchResult {
  id: string;
  source: string;
  type: SearchResultType;
  format: SearchResultFormat;
  title: string;
  title_html?: string;
  icon?: string;

  projection?: string;
  geometry?: SearchResultGeometry;
  extent?: ol.Extent;
  properties?: {[key: string]: any};
}

export interface SearchResultGeometry {
  type: ol.geom.GeometryType;
  coordinates: [any];
}

export enum SearchResultType {
  Layer = <any> 'Layer',
  Feature = <any> 'Feature'
}

export enum SearchResultFormat {
  WMS,
  GeoJSON
}
