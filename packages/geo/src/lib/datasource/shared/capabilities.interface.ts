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
