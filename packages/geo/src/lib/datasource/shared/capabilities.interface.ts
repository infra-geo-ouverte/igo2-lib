export enum TypeCapabilities {
  wms = 'wms',
  wmts = 'wmts',
  arcgisrest = 'esriJSON',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  imagearcgisrest = 'esriJSON',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  tilearcgisrest = 'esriJSON'
}

export type TypeCapabilitiesStrings = keyof typeof TypeCapabilities;

export interface ArcGISRestCapabilitiesLayer {
  id: number;
  name: string;
  parentLayerId: number;
  defaultVisibility?: boolean;
  subLayerIds: number[];
  minScale: number;
  maxScale: number;
  type: ArcGISRestCapabilitiesLayerTypes;
  geometryType?: string;
}

export enum ArcGISRestCapabilitiesLayerTypes {
  FeatureLayer = 'Feature Layer',
  RasterLayer = 'Raster Layer',
  GroupLayer = 'Group Layer'
}

/**
 * Interface representing an ArcGIS Vector Tile Service response.
 * For detailed information, see the ArcGIS Vector Tile Service documentation:
 * https://developers.arcgis.com/rest/services-reference/enterprise/vector-tile-service/
 */
export interface IArcgisVectorTileServerCapabilities {
  currentVersion: number;
  name: string;
  capabilities?: string; // e.g., "TilesOnly,Tilemap"
  type: 'indexedVector';
  tileMap?: string;
  defaultStyles?: string;
  tiles: string[]; // array of tile URL templates, e.g. ["tile/{z}/{y}/{x}.pbf"]
  exportTilesAllowed?: boolean;
  maxExportTilesCount?: number;
  initialExtent: vectorTileExtent;
  fullExtent: vectorTileExtent;
  minScale?: number;
  maxScale?: number;
  tileInfo: TileInfo;
  maxzoom?: number;
  minLOD?: number;
  maxLOD?: number;
  resourceInfo?: ResourceInfo;
  copyrightText?: string;
  [key: string]: unknown;
}

interface Lod {
  level: number;
  resolution: number;
  scale: number;
}

interface Point {
  x: number;
  y: number;
}

interface SpatialReference {
  wkid?: number;
  latestWkid?: number;
  [key: string]: any;
}

interface vectorTileExtent {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference: SpatialReference;
}

interface TileInfo {
  rows: number;
  cols: number;
  dpi: number;
  format: string; // e.g., "pbf", "mvt"
  origin: Point;
  spatialReference: SpatialReference;
  lods: Lod[];
}

interface ResourceInfo {
  styleVersion: number;
  tileCompression: string; // e.g. "gzip"
  cacheInfo: { storageInfo: { packetSize: number; storageFormat: string } };
}

export const GetCapabilitiesParams = ['request', 'service', 'version'] as const;
export type GetCapabilitiesParams = (typeof GetCapabilitiesParams)[number];
