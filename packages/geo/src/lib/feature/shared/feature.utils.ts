import * as olextent from 'ol/extent';
import * as olproj from 'ol/proj';
import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';
import OlFormatGeoJSON from 'ol/format/GeoJSON';

import {
  getEntityId,
  getEntityRevision,
  getEntityProperty
} from '@igo2/common';

import { IgoMap } from '../../map';
import { FeatureMotion } from './feature.enums';
import { Feature } from './feature.interfaces';

/**
 * Create an Openlayers feature object out of a feature definition.
 * The output object has a reference to the feature id.
 * @param feature Feature definition
 * @param projectionOut Feature object projection
 * @returns OpenLayers feature object
 */
export function featureToOl(
  feature: Feature,
  projectionOut: string
): OlFeature {
  const olFormat = new OlFormatGeoJSON();
  const olFeature = olFormat.readFeature(feature, {
    dataProjection: feature.projection,
    featureProjection: projectionOut
  });

  olFeature.setId(getEntityId(feature));

  if (feature.projection !== undefined) {
    olFeature.set('_projection', feature.projection);
  }

  if (feature.extent !== undefined) {
    olFeature.set('_extent', feature.extent);
  }

  const mapTitle = getEntityProperty(feature, 'meta.mapTitle');
  if (mapTitle !== undefined) {
    olFeature.set('_mapTitle', mapTitle);
  }

  olFeature.set('_entityRevision', getEntityRevision(feature));

  return olFeature;
}

/**
 * Compute an OL feature extent in it's map projection
 * @param map Map
 * @param olFeature OL feature
 * @returns Extent in the map projection
 */
export function computeOlFeatureExtent(
  map: IgoMap,
  olFeature: OlFeature
): [number, number, number, number] {
  let extent = olextent.createEmpty();

  const olFeatureExtent = olFeature.get('_extent');
  const olFeatureProjection = olFeature.get('_projection');
  if (olFeatureExtent !== undefined && olFeatureProjection !== undefined) {
    extent = olproj.transformExtent(
      olFeatureExtent,
      olFeatureProjection,
      map.projection
    );
  }

  return extent;
}

/**
 * Compute a multiple OL features extent in their map projection
 * @param map Map
 * @param olFeatures OL features
 * @returns Extent in the map projection
 */
export function computeOlFeaturesExtent(
  map: IgoMap,
  olFeatures: OlFeature[]
): [number, number, number, number] {
  const extent = olextent.createEmpty();

  olFeatures.forEach((olFeature: OlFeature) => {
    const olGeometry = olFeature.getGeometry();
    const featureExtent = computeOlFeatureExtent(map, olFeature);
    if (olextent.isEmpty(featureExtent) && olGeometry !== null) {
      olextent.extend(featureExtent, olGeometry.getExtent());
    }
    olextent.extend(extent, featureExtent);
  });

  return extent;
}

/**
 * Scale an extent.
 * @param extent Extent
 * @param Scaling factor
 * @returns Scaled extent
 */
export function scaleExtent(
  extent: [number, number, number, number],
  scale: number
): [number, number, number, number] {
  const [width, height] = olextent.getSize(extent);
  return [
    extent[0] - width * scale * 0.5,
    extent[1] - height * scale * 0.5,
    extent[2] + width * scale * 0.5,
    extent[3] + height * scale * 0.5
  ];
}

/**
 * Return true if features are out of view.
 * If features are too close to the edge, they are considered out of view.
 * We define the edge as 5% of the extent size.
 * @param map Map
 * @param featuresExtent The features's extent
 * @returns Return true if features are out of view
 */
export function featuresAreOutOfView(
  map: IgoMap,
  featuresExtent: [number, number, number, number]
) {
  const mapExtent = map.getExtent();
  const edgeRatio = 0.05;
  const viewExtent = scaleExtent(mapExtent, edgeRatio * -1);

  return !olextent.containsExtent(viewExtent, featuresExtent);
}

/**
 * Return true if features are too deep into the view. This results
 * in features being too small.
 * Features are considered too small if their extent occupies less than
 * 1% of the map extent.
 * @param map Map
 * @param featuresExtent The features's extent
 * @returns Return true if features are too deep in the view
 */
export function featuresAreTooDeepInView(
  map: IgoMap,
  featuresExtent: [number, number, number, number]
) {
  const mapExtent = map.getExtent();
  const mapExtentArea = olextent.getArea(mapExtent);
  const featuresExtentArea = olextent.getArea(featuresExtent);
  const areaRatio = 0.01;

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
export function moveToFeatures(
  map: IgoMap,
  olFeatures: OlFeature[],
  motion = FeatureMotion.Default,
  scale = 1
) {
  const featuresExtent = computeOlFeaturesExtent(map, olFeatures);
  const viewExtent = scaleExtent(featuresExtent, scale);

  if (motion === FeatureMotion.Zoom) {
    map.viewController.zoomToExtent(viewExtent);
  } else if (motion === FeatureMotion.Move) {
    map.viewController.moveToExtent(viewExtent);
  } else if (motion === FeatureMotion.Default) {
    if (
      featuresAreOutOfView(map, featuresExtent) ||
      featuresAreTooDeepInView(map, featuresExtent)
    ) {
      map.viewController.zoomToExtent(viewExtent);
    }
  }
}

/**
 * Hide an OL feature
 * @param olFeature OL feature
 */
export function hideOlFeature(olFeature: OlFeature) {
  olFeature.setStyle(new olstyle.Style({}));
}
