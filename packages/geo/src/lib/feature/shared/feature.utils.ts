import * as olextent from 'ol/extent';
import * as olproj from 'ol/proj';
import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';
import type { GeometryLayout } from 'ol/geom/Geometry';
import OlPolygon from 'ol/geom/Polygon';
import OlPoint from 'ol/geom/Point';
import OlLineString from 'ol/geom/LineString';
import OlRenderFeature from 'ol/render/Feature';
import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlLayer from 'ol/layer/Layer';
import OlSource from 'ol/source/Source';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { uuid } from '@igo2/utils';

import {
  EntityKey,
  getEntityId,
  getEntityTitle,
  getEntityRevision,
  getEntityIcon,
  getEntityProperty
} from '@igo2/common';

import { IgoMap } from '../../map';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureDataSource } from '../../datasource';
import { FEATURE, FeatureMotion } from './feature.enums';
import { Feature, FeatureGeometry } from './feature.interfaces';
import { FeatureStore } from './store';

/**
 * Create an Openlayers feature object out of a feature definition.
 * The output object has a reference to the feature id.
 * @param feature Feature definition
 * @param projectionOut Feature object projection
 * @returns OpenLayers feature object
 */
export function featureToOl(
  feature: Feature,
  projectionOut: string,
  getId?: (Feature) => EntityKey
): OlFeature<OlGeometry> {
  getId = getId ? getId : getEntityId;

  const olFormat = new OlFormatGeoJSON();
  const olFeature = olFormat.readFeature(feature, {
    dataProjection: feature.projection,
    featureProjection: projectionOut
  });

  olFeature.setId(getId(feature));

  const title = getEntityTitle(feature);
  if (title !== undefined) {
    olFeature.set('_title', title, true);
  }

  if (feature.extent !== undefined) {
    olFeature.set('_extent', feature.extent, true);
  }

  if (feature.projection !== undefined) {
    olFeature.set('_projection', feature.projection, true);
  }

  const mapTitle = getEntityProperty(feature, 'meta.mapTitle');
  if (mapTitle !== undefined) {
    olFeature.set('_mapTitle', mapTitle, true);
  }

  olFeature.set('_entityRevision', getEntityRevision(feature), true);

  const icon = getEntityIcon(feature);
  if (icon !== undefined) {
    olFeature.set('_icon', icon, true);
  }

  if (feature.meta && feature.meta.style) {
    olFeature.set('_style', feature.meta.style, true);
  }

  if (feature.sourceId) {
    olFeature.set('_sourceId', feature.sourceId, true);
  }

  return olFeature;
}

export function renderFeatureFromOl(
  olRenderFeature: OlRenderFeature,
  projectionIn: string,
  olLayer?: OlLayer<OlSource>,
  projectionOut = 'EPSG:4326'
): Feature {
  let geom;
  let title;
  let exclude;
  let excludeOffline;

  if (olLayer) {
    title = olLayer.get('title');
    if (olLayer.get('sourceOptions')) {
      exclude = olLayer.get('sourceOptions').excludeAttribute;
      excludeOffline = olLayer.get('sourceOptions').excludeAttributeOffline;
    }
  } else {
    title = olRenderFeature.get('_title');
  }

  const olFormat = new OlFormatGeoJSON();
  const properties = olRenderFeature.getProperties();
  const geometryType = olRenderFeature.getType();

  if (geometryType === 'Polygon') {
    const ends = olRenderFeature.getEnds() as number[];
    geom = new OlPolygon(
      olRenderFeature.getFlatCoordinates(),
      'XY' as GeometryLayout,
      ends
    );
  } else if (geometryType === 'Point') {
    geom = new OlPoint(olRenderFeature.getFlatCoordinates(), 'XY' as GeometryLayout);
  } else if (geometryType === 'LineString') {
    geom = new OlLineString(
      olRenderFeature.getFlatCoordinates(),
      'XY' as GeometryLayout,
    );
  }

  const geometry = olFormat.writeGeometryObject(geom, {
    dataProjection: projectionOut,
    featureProjection: projectionIn
  }) as FeatureGeometry;

  const id = olRenderFeature.getId() ? olRenderFeature.getId() : uuid();
  const mapTitle = olRenderFeature.get('_mapTitle');
  const extent = olproj.transformExtent(olRenderFeature.getExtent(), projectionIn, projectionOut) as [number, number, number, number];
  return {
    type: FEATURE,
    projection: projectionOut,
    extent,
    meta: {
      id,
      title: title ? title : mapTitle ? mapTitle : id,
      mapTitle,
      excludeAttribute: exclude,
      excludeAttributeOffline: excludeOffline
    },
    properties,
    geometry,
    ol: olRenderFeature
  };
}
/**
 * Create a feature object out of an OL feature
 * The output object has a reference to the feature id.
 * @param olFeature OL Feature
 * @param projectionIn OL feature projection
 * @param olLayer OL Layer
 * @param projectionOut Feature projection
 * @returns Feature
 */
export function featureFromOl(
  olFeature: OlFeature<OlGeometry>,
  projectionIn: string,
  olLayer?: OlLayer<OlSource>,
  projectionOut = 'EPSG:4326'
): Feature {
  let title;
  let exclude;
  let excludeOffline;
  let idColumn; // for arcgisrest and tilearcgisrest source
  const olFormat = new OlFormatGeoJSON();

  const keys = olFeature.getKeys().filter((key: string) => {
    return !key.startsWith('_') && key !== 'geometry';
  });
  const properties = keys.reduce((acc: object, key: string) => {
    acc[key] = olFeature.get(key);
    return acc;
  }, {});

  const geometry = olFormat.writeGeometryObject(olFeature.getGeometry(), {
    dataProjection: projectionOut,
    featureProjection: projectionIn
  }) as FeatureGeometry;

  if (olLayer) {
    title = olLayer.get('title');
    const sourceOptions = olLayer.get('sourceOptions');
    if (sourceOptions) {
      exclude = sourceOptions.excludeAttribute;
      excludeOffline = sourceOptions.excludeAttributeOffline;
      idColumn =
        sourceOptions.idColumn ||
        ((sourceOptions.type === 'arcgisrest' || sourceOptions.type === 'tilearcgisrest') ? 'OBJECTID' : undefined );
    }
  } else {
    title = olFeature.get('_title');
  }
  const mapTitle = olFeature.get('_mapTitle');
  const id = olFeature.getId() ? olFeature.getId() : olFeature.get(idColumn) ? olFeature.get(idColumn) : uuid();
  const newFeature = olFeature.get('_newFeature');

  return {
    type: FEATURE,
    projection: projectionOut,
    extent: olFeature.get('_extent'),
    meta: {
      id,
      title: title ? title : mapTitle ? mapTitle : id,
      mapTitle,
      revision: olFeature.getRevision(),
      style: olFeature.get('_style'),
      excludeAttribute: exclude,
      excludeAttributeOffline: excludeOffline
    },
    properties,
    geometry,
    ol: olFeature
  };
}

/**
 * Compute an OL feature extent in it's map projection
 * @param map Map
 * @param olFeature OL feature
 * @returns Extent in the map projection
 */
export function computeOlFeatureExtent(
  map: IgoMap,
  olFeature: OlFeature<OlGeometry>
): [number, number, number, number] {
  let olExtent = olextent.createEmpty();

  const olFeatureExtent = olFeature.get('_extent');
  const olFeatureProjection = olFeature.get('_projection');
  if (olFeatureExtent !== undefined && olFeatureProjection !== undefined) {
    olExtent = olproj.transformExtent(
      olFeatureExtent,
      olFeatureProjection,
      map.projection
    );
  } else {
    const olGeometry = olFeature.getGeometry();
    if (olGeometry !== null) {
      olExtent = olGeometry.getExtent();
    }
  }

  return olExtent as [number, number, number, number];
}

/**
 * Compute a multiple OL features extent in their map projection
 * @param map Map
 * @param olFeatures OL features
 * @returns Extent in the map projection
 */
export function computeOlFeaturesExtent(
  map: IgoMap,
  olFeatures: OlFeature<OlGeometry>[]
): [number, number, number, number] {
  const extent = olextent.createEmpty();

  olFeatures.forEach((olFeature: OlFeature<OlGeometry>) => {
    const featureExtent = computeOlFeatureExtent(map, olFeature);
    olextent.extend(extent, featureExtent);
  });

  return extent as [number, number, number, number];
}

/**
 * Scale an extent.
 * @param extent Extent
 * @param Scaling factors for top, right, bottom and left directions, in that order
 * @returns Scaled extent
 */
export function scaleExtent(
  extent: [number, number, number, number],
  scale: [number, number, number, number]
): [number, number, number, number] {
  const [width, height] = olextent.getSize(extent);
  return [
    scale[3] ? extent[0] - width * scale[3] : extent[0],
    scale[2] ? extent[1] - height * scale[2] : extent[1],
    scale[1] ? extent[2] + width * scale[1] : extent[2],
    scale[0] ? extent[3] + height * scale[0] : extent[3]
  ];
}

/**
 * Return true if features are out of view.
 * If features are too close to the edge, they are considered out of view.
 * By default, we define the edge as 5% (0.05) of the extent size.
 * @param map Map
 * @param featuresExtent The features's extent
 * @param edgeRatio Number or Number[] Single value OR an array =>
 *  [top,right,bottom,left] directions, in that order
 * @returns Return true if features are out of view
 */
export function featuresAreOutOfView(
  map: IgoMap,
  featuresExtent: [number, number, number, number],
  edgeRatio: number | number[] = 0.05
) {
  const edgesRatio = Array.isArray(edgeRatio) ? edgeRatio :[edgeRatio,edgeRatio,edgeRatio,edgeRatio];
  const mapExtent = map.viewController.getExtent();
  const scale = [-1, -1, -1, -1].map((x,i) => x * edgesRatio[i]);
  const viewExtent = scaleExtent(mapExtent, scale as [
    number,
    number,
    number,
    number
  ]);

  return !olextent.containsExtent(viewExtent, featuresExtent);
}

/**
 * Return true if features are too deep into the view. This results
 * in features being too small.
 * Features are considered too small if their extent occupies less than
 * 1% of the map extent.
 * @param map Map
 * @param featuresExtent The features's extent
 * @param areaRatio The features extent to view extent acceptable ratio
 * @returns Return true if features are too deep in the view
 */
export function featuresAreTooDeepInView(
  map: IgoMap,
  featuresExtent: [number, number, number, number],
  areaRatio?: number
) {
  // An area ratio of 0.004 means that the feature extent's width and height
  // should be about 1/16 of the map extent's width and height
  areaRatio = areaRatio ? areaRatio : 0.004;
  const mapExtent = map.viewController.getExtent();
  const mapExtentArea = olextent.getArea(mapExtent);
  const featuresExtentArea = olextent.getArea(featuresExtent);

  if (featuresExtentArea === 0 && map.viewController.getZoom() > 13) {
    // In case it's a point
    return false;
  }

  return featuresExtentArea / mapExtentArea < areaRatio;
}

/**
 * Fit view to include the features extent.
 * By default, this method will let the features occupy about 50% of the viewport.
 * @param map Map
 * @param olFeatures OL features
 * @param motion To motion to the new map view
 * @param scale If this is defined, the original view will be scaled
 *  by that factor before any logic is applied.
 */
export function moveToOlFeatures(
  map: IgoMap,
  olFeatures: OlFeature<OlGeometry>[],
  motion: FeatureMotion = FeatureMotion.Default,
  scale?: [number, number, number, number],
  areaRatio?: number
) {
  const featuresExtent = computeOlFeaturesExtent(map, olFeatures);
  let viewExtent = featuresExtent;
  if (scale !== undefined) {
    viewExtent = scaleExtent(viewExtent, scale);
  }

  if (motion === FeatureMotion.Zoom) {
    map.viewController.zoomToExtent(viewExtent);
  } else if (motion === FeatureMotion.Move) {
    map.viewController.moveToExtent(viewExtent);
  } else if (motion === FeatureMotion.Default) {
    if (
      featuresAreOutOfView(map, featuresExtent) ||
      featuresAreTooDeepInView(map, featuresExtent, areaRatio)
    ) {
      map.viewController.zoomToExtent(viewExtent);
    }
  }
}

/**
 * Hide an OL feature
 * @param olFeature OL feature
 */
export function hideOlFeature(olFeature: OlFeature<OlGeometry>) {
  olFeature.setStyle(new olstyle.Style({}));
}

/**
 * Try to bind a layer to a store if none is bound already.
 * The layer will also be added to the store's map.
 * If no layer is given to that function, a basic one will be created.
 * @param store The store to bind the layer
 * @param layer An optional VectorLayer
 */
export function tryBindStoreLayer(store: FeatureStore, layer?: VectorLayer) {
  if (store.layer !== undefined) {
    if (store.layer.map === undefined) {
      store.map.addLayer(store.layer);
    }
    return;
  }

  layer = layer
    ? layer
    : new VectorLayer({
        source: new FeatureDataSource()
      });
  store.bindLayer(layer);
  if (store.layer.map === undefined) {
    store.map.addLayer(store.layer);
  }
}

/**
 * Compute a diff between a source array of Ol features and a target array
 * @param source Source array of OL features
 * @param starget Target array of OL features
 * @returns Features to add and remove
 */
export function computeOlFeaturesDiff(
  source: OlFeature<OlGeometry>[],
  target: OlFeature<OlGeometry>[]
): {
  add: OlFeature<OlGeometry>[];
  remove: OlFeature<OlGeometry>[];
} {
  const olFeaturesMap = new Map();
  target.forEach((olFeature: OlFeature<OlGeometry>) => {
    olFeaturesMap.set(olFeature.getId(), olFeature);
  });

  const olFeaturesToRemove = [];
  source.forEach((olFeature: OlFeature<OlGeometry>) => {
    const newOlFeature = olFeaturesMap.get(olFeature.getId());
    if (newOlFeature === undefined) {
      olFeaturesToRemove.push(olFeature);
    } else if (
      newOlFeature.get('_entityRevision') !== olFeature.get('_entityRevision')
    ) {
      olFeaturesToRemove.push(olFeature);
    } else {
      olFeaturesMap.delete(newOlFeature.getId());
    }
  });

  const olFeaturesToAddIds = Array.from(olFeaturesMap.keys());
  const olFeaturesToAdd = target.filter((olFeature: OlFeature<OlGeometry>) => {
    return olFeaturesToAddIds.indexOf(olFeature.getId()) >= 0;
  });

  return {
    add: olFeaturesToAdd,
    remove: olFeaturesToRemove
  };
}
