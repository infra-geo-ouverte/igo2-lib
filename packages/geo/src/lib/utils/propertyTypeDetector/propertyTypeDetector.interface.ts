
export interface GeoServiceDefinition  {
  url: string;
  type:
  | 'wms'
  | 'wfs'
  | 'vector'
  | 'wmts'
  | 'xyz'
  | 'osm'
  | 'tiledebug'
  | 'carto'
  | 'arcgisrest'
  | 'imagearcgisrest'
  | 'tilearcgisrest'
  | 'websocket'
  | 'mvt'
  | 'cluster';
  columnsForLayerName?: string[]
}
