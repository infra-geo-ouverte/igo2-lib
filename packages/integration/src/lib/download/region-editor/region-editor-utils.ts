import { Feature, FEATURE, FeatureStore, GeoJSONGeometry } from '@igo2/geo';
import { uuid } from '@igo2/utils';
import OlFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import { fromExtent } from 'ol/geom/Polygon';
import * as olProj from 'ol/proj';

export enum AddTileErrors {
  CARTO_BACKGROUND = 'Cartographic Background is not the same',
  LEVEL = 'Tile to add not on the same level of those selected',
  ALREADY_SELECTED = 'The tile is already selected',
  ALREADY_DOWNLOADING = 'Region already downloading'
}

export class AddTileError extends Error {

  constructor(readonly addTileError: AddTileErrors) {
    super(addTileError);
  }

}

export function getTileFeature(
  tileGrid,
  coord: [number, number, number],
  regionStore: FeatureStore,
  mapProj: string
): Feature {
  const id = uuid();
  const previousRegion = regionStore.get(id);
  const previousRegionRevision = previousRegion ? previousRegion.meta.revision : 0;

  const polygonGeometry = fromExtent(tileGrid.getTileCoordExtent(coord));

  const feature: OlFeature = new OlFeature(polygonGeometry);

  const projectionIn = 'EPSG:4326';
  const projectionOut = 'EPSG:4326';

  const featuresText: string = new olformat.GeoJSON().writeFeature(
      feature,
      {
          dataProjection: projectionOut,
          featureProjection: projectionIn,
          featureType: 'feature',
          featureNS: 'http://example.com/feature'
      }
  );

  const regionFeature: Feature = {
      type: FEATURE,
      geometry: JSON.parse(featuresText).geometry,
      projection: mapProj,
      properties: {
          id,
          stopOpacity: 1
      },
      meta: {
          id,
          revision: previousRegionRevision + 1
      },
      ol: feature
  };
  return regionFeature;
}

export function geoJSONToFeature(
  geometry: GeoJSONGeometry,
  regionStore: FeatureStore,
  mapProj: string
) {
  const id = uuid();
  const previousRegion = regionStore.get(id);
  const previousRegionRevision = previousRegion ? previousRegion.meta.revision : 0;

  const transformedGeometry = transformGeometry(geometry, mapProj);

  const feature = new OlFeature(transformedGeometry);

  const regionFeature: Feature = {
    type: FEATURE,
    geometry: transformedGeometry,
    projection: mapProj,
    properties: {
      id,
      stopOpacity: 1
    },
    meta: {
      id,
      revision: previousRegionRevision + 1
    },
    ol: feature
  };
  return regionFeature;
}

export function transformGeometry(geoJSONGeometry: GeoJSONGeometry, proj: string): GeoJSONGeometry {
  const geometry = {...geoJSONGeometry};
  const coords = geometry.coordinates;
  switch (geometry.type) {
    case 'Point':
      geometry.coordinates = olProj.transform(coords, 'EPSG:4326', proj);
      break;

    case 'LineString':
      geometry.coordinates = coords.map(
        (coord) => olProj.transform(coord, 'EPSG:4326', proj)
      );
      break;

    case 'Polygon':
      geometry.coordinates = [
        coords[0].map((coord) => olProj.transform(coord, 'EPSG:4326', proj))
      ];
      break;

    default:
      throw Error('Geometry not yet supported for transform');
  }
  return geometry;
}
