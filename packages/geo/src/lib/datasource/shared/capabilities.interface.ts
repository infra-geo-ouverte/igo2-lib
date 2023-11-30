export enum TypeCapabilities {
  wms = 'wms',
  wmts = 'wmts',
  arcgisrest = 'esriJSON',
  imagearcgisrest = 'esriJSON',
  tilearcgisrest = 'esriJSON'
}

export type TypeCapabilitiesStrings = keyof typeof TypeCapabilities;
