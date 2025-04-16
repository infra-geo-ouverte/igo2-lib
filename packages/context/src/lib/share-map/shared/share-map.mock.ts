import { RouteServiceOptions } from '@igo2/core/route';
import {
  AnyLayer,
  ArcGISRestImageDataSourceOptions,
  IgoMap,
  ImageArcGISRestDataSource,
  ImageLayer,
  ImageLayerOptions,
  LayerGroup,
  LayerGroupOptions,
  MapViewOptions,
  TileLayer,
  TileLayerOptions,
  WMSDataSource,
  WMSDataSourceOptions,
  WMTSDataSource,
  WMTSDataSourceOptions
} from '@igo2/geo';

import { DetailedContext } from '../../context-manager';
import { ShareMapRouteKeysOptions, ShareOption } from './share-map.interface';

export const MOCK_SHARE_OPTION: ShareOption = {
  layerlistControls: {
    querystring: ''
  }
};

export const SHARE_MAP_KEYS_DEFAULT_OPTIONS_MOCK: ShareMapRouteKeysOptions = {
  languageKey: 'lang',
  context: 'ctx',
  urls: 'urls',
  position: 'pos',
  layers: 'layers',
  groups: 'groups',
  center: 'ctr',
  zoom: 'z',
  projection: 'p',
  rotation: 'r',
  opacity: 'o'
};

export const ROUTE_OPTION_LEGACY_MOCK: RouteServiceOptions = {
  centerKey: 'center',
  zoomKey: 'zoom',
  projectionKey: 'projection',
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
  tarcgisLayersKey: 'tarcgisLayers',
  rotationKey: 'rotation'
};

/*********** CONTEXT Config ***********/
export const CONTEXT_MOCK: DetailedContext = {
  layers: [],
  map: {
    view: {
      center: [-71.51804, 46.58602],
      projection: 'EPSG:4326',
      zoom: 9,
      rotation: 0
    }
  }
};

/*********** WMS Layer ***********/
const imageLayerOptions: ImageLayerOptions = {
  visible: true,
  zIndex: 11,
  opacity: 1,
  title: 'Établissements MTQ',
  sourceOptions: {
    type: 'wms',
    url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
    params: {
      LAYERS: 'etablissement_mtq',
      VERSION: '1.3.0'
    }
  }
};

function createWmsLayer(options: ImageLayerOptions): ImageLayer {
  options.source = new WMSDataSource(
    options.sourceOptions as WMSDataSourceOptions
  );
  const layer = new ImageLayer(options);
  return layer;
}

/*********** WMTS Layer ***********/

const tileLayerOptions: TileLayerOptions = {
  visible: false,
  zIndex: 11,
  opacity: 1,
  title: 'Quebec Base Map',
  sourceOptions: {
    type: 'wmts',
    url: 'https://geoegl.msp.gouv.qc.ca/apis/carto/wmts/1.0.0/wmts',
    layer: 'carte_gouv_qc_ro',
    matrixSet: 'EPSG_3857',
    version: '1.3.0'
  }
};

function createWmtsLayer(options: TileLayerOptions): TileLayer {
  options.source = new WMTSDataSource(
    options.sourceOptions as WMTSDataSourceOptions
  );
  const layer = new TileLayer(options);
  return layer;
}

/*********** IMAGEARCGISREST Layer ***********/

const imagearcgisrestOption: ImageLayerOptions = {
  title: 'Port de pêche essentiel',
  visible: true,
  opacity: 0.5,
  sourceOptions: {
    layer: '0',
    type: 'imagearcgisrest',
    url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/SmallCraftHarbours_Fr/MapServer',
    params: {
      LAYERS: 'show:0'
    }
  }
};

function createImagearcgisrestLayer(options: ImageLayerOptions): ImageLayer {
  options.source = new ImageArcGISRestDataSource(
    options.sourceOptions as ArcGISRestImageDataSourceOptions
  );
  const layer = new ImageLayer(options);
  return layer;
}

function createGroup(
  children: AnyLayer[] | null,
  options: LayerGroupOptions
): LayerGroup {
  return new LayerGroup(children, options);
}

export const MAP_MOCK = createMap();

function createMap(): IgoMap {
  const QUEBEC_BASE_MAP = createWmtsLayer(tileLayerOptions);
  const IMAGE_ARCGIS_REST_LAYER = createImagearcgisrestLayer(
    imagearcgisrestOption
  );
  const ETABLISSEMENT_LAYER = createWmsLayer(imageLayerOptions);
  const view: MapViewOptions = {
    projection: 'EPSG:4326',
    center: [-71.51804, 46.58602],
    rotation: 0,
    zoom: 9
  };

  const map = new IgoMap({ view });

  map.layerController.add(
    ETABLISSEMENT_LAYER,
    QUEBEC_BASE_MAP,
    IMAGE_ARCGIS_REST_LAYER
  );

  return map;
}

/*********** GROUPS MOCK ***********/
export const MAP_GROUP_MOCK = createMapGroup();

function createMapGroup(): IgoMap {
  const IMAGE_ARCGIS_REST_LAYER = createImagearcgisrestLayer(
    imagearcgisrestOption
  );

  const view: MapViewOptions = {
    projection: 'EPSG:4326',
    center: [-71.51804, 46.58602],
    rotation: 0,
    zoom: 9
  };

  const LAYER_GROUP_MOCK = createGroup(null, {
    title: 'test1',
    type: 'group'
  });

  const LAYER_GROUP_CHILDREN_MOCK = createGroup([IMAGE_ARCGIS_REST_LAYER], {
    title: 'test2',
    type: 'group'
  });

  const map = new IgoMap({ view });

  map.layerController.add(LAYER_GROUP_MOCK, LAYER_GROUP_CHILDREN_MOCK);

  return map;
}
