import { LayerOptions, VectorLayerOptions } from '@igo2/geo';

export const OSM_LAYER = {
  title: 'OSM',
  sourceOptions: {
    type: 'osm'
  },
  baseLayer: true,
  visible: true
} satisfies LayerOptions;

export const MAP_SERVER_LAYER = {
  title: 'NewEditionWorkspace - NOT REAL BACKEND',
  visible: false,
  workspace: {
    enabled: true
  },
  sourceOptions: {
    type: 'wfs',
    url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
    params: {
      featureTypes: 'etablissement_mtq',
      fieldNameGeometry: 'geometry',
      version: '2.0.0',
      outputFormat: 'geojson'
    },
    // Enable edition mode so this layer is bound to NewEditionWorkspace.
    // This demo keeps write buttons disabled because no writable backend is configured.
    edition: {
      enabled: true,
      baseUrl: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
      addUrl: '?service=WFS&request=Transaction',
      deleteUrl: '?service=WFS&request=Transaction&featureId=',
      modifyUrl: '?service=WFS&request=Transaction',
      geomType: 'Point',
      hasGeometry: true,
      modifyMethod: 'post',
      modifyButton: true,
      deleteButton: true
    },
    sourceFields: [
      {
        name: 'idetablis',
        alias: 'ID',
        primary: true,
        validation: { readonly: true }
      },
      { name: 'nometablis', alias: 'Name' },
      { name: 'typetablis', alias: 'Type' }
    ]
  }
} satisfies VectorLayerOptions;

/**
 * This layer uses OGC API for Features as a source and edition backend.
 */
export const FEATURES_LAYER = {
  title: 'NewEditionWorkspace - REAL BACKEND',
  visible: true,
  workspace: {
    enabled: true
  },
  sourceOptions: {
    type: 'vector',
    url: 'https://igo.unit.mtq.min.intra/apis/pygeoapi/v0/collections/vdq-bornefontaine/items?f=json',
    // Enable edition mode so this layer is bound to NewEditionWorkspace.
    // This demo keeps write buttons disabled because no writable backend is configured.
    edition: {
      enabled: true,
      baseUrl:
        'https://igo.unit.mtq.min.intra/apis/pygeoapi/v0/collections/vdq-bornefontaine/items',
      addUrl: '?service=WFS&request=Transaction',
      deleteUrl: '?service=WFS&request=Transaction&featureId=',
      modifyUrl: '?service=WFS&request=Transaction',
      geomType: 'Point',
      hasGeometry: true,
      modifyMethod: 'post',
      modifyButton: true,
      deleteButton: true
    },
    sourceFields: [
      {
        name: 'id',
        alias: 'ID',
        primary: true,
        validation: { readonly: true }
      },
      { name: 'nom_topographie', alias: 'Nom topographie' },
      { name: 'ville', alias: 'Ville' },
      { name: 'arrondissement', alias: 'Arrondissement' },
      { name: 'id_voie_publique', alias: 'ID voie publique' }
    ]
  }
} satisfies VectorLayerOptions;

// TODO
/**
 * Layer config for a local server. Property `workspace.enabled` must be set to `true` in order to be used.
 */
export const LOCAL_LAYER = {
  title: 'NewEditionWorkspace - test',
  visible: false,
  workspace: {
    enabled: false
  },
  sourceOptions: {
    type: 'vector',
    url: 'http://localhost:5000/collections/test/items',
    formatOptions: {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    },
    // Enable edition mode so this layer is bound to NewEditionWorkspace.
    // This demo keeps write buttons disabled because no writable backend is configured.
    edition: {
      enabled: true,
      baseUrl: 'http://localhost:5000/collections/test/items',
      addUrl: '',
      deleteUrl: '',
      modifyUrl: '',
      geomType: 'Point',
      hasGeometry: true,
      modifyMethod: 'put',
      modifyButton: true,
      deleteButton: true
    }
  }
} satisfies VectorLayerOptions;
