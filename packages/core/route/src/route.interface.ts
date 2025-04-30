export interface RouteServiceOptions {
  centerKey?: string;
  zoomKey?: string;
  projectionKey?: string;
  contextKey?: string;
  searchKey?: string;
  visibleOnLayersKey?: string;
  visibleOffLayersKey?: string;
  directionsCoordKey?: string;
  directionsOptionsKey?: string;
  toolKey?: string;
  wmsUrlKey?: string;
  wmsLayersKey?: string;
  wmtsUrlKey?: string;
  wmtsLayersKey?: string;
  arcgisUrlKey?: string;
  arcgisLayersKey?: string;
  iarcgisUrlKey?: string;
  iarcgisLayersKey?: string;
  tarcgisUrlKey?: string;
  tarcgisLayersKey?: string;
  vectorKey?: string;
  zoomExtentKey?: string;
  exactMatchKey?: string;
  focusFirstResultKey?: string;
  searchGeomKey?: string;
  sidenavKey?: string;
  urlsKey?: string;
  languageKey?: string;
  positionKey?: string;
  layersKey?: string;
  groupsKey?: string;
  rotationKey?: string;
}

export const ROUTE_OPTIONS: RouteServiceOptions = {
  languageKey: 'lang',
  searchKey: 'search',
  searchGeomKey: 'searchGeom',
  exactMatchKey: 'exactMatch',
  zoomExtentKey: 'zoomExtent',
  focusFirstResultKey: 'sf',
  toolKey: 'tool',
  directionsCoordKey: 'routing',
  directionsOptionsKey: 'routingOptions',
  sidenavKey: 'sidenav',
  visibleOnLayersKey: 'visiblelayers',
  visibleOffLayersKey: 'invisiblelayers',
  vectorKey: 'vector'
};

export const LEGACY_ROUTE_OPTIONS: RouteServiceOptions = {
  projectionKey: 'projection',
  rotationKey: 'rotation',
  zoomKey: 'zoom',
  centerKey: 'center',
  contextKey: 'context',
  layersKey: 'layers',
  wmsUrlKey: 'wmsUrl',
  wmsLayersKey: 'wmsLayers',
  wmtsUrlKey: 'wmtsUrl',
  wmtsLayersKey: 'wmtsLayers',
  arcgisUrlKey: 'arcgisUrl',
  arcgisLayersKey: 'arcgisLayers',
  iarcgisUrlKey: 'iarcgisUrl',
  iarcgisLayersKey: 'iarcgisLayers',
  tarcgisUrlKey: 'tarcgisUrl',
  tarcgisLayersKey: 'tarcgisLayers'
};
