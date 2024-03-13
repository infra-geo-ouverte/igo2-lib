export enum TypeCapabilities {
  wms = 'wms',
  wmts = 'wmts',
  arcgisrest = 'esriJSON',
  imagearcgisrest = 'esriJSON',
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
