import olFeature from 'ol/Feature';
import * as olStyle from 'ol/style';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as olGeom from 'ol/geom';
import OlGeoJSON from 'ol/format/GeoJSON';
import * as olProj from 'ol/proj';


import { EntityStore } from '@igo2/common';
import { uuid } from '@igo2/utils';

import { Direction, FeatureWithDirection, FeatureWithStop, Stop } from './directions.interface';
import { createOverlayMarkerStyle } from '../../overlay/shared/overlay-marker-style.utils';
import { FeatureStore } from '../../feature/shared/store';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { tryBindStoreLayer } from '../../feature/shared/feature.utils';
import { tryAddLoadingStrategy } from '../../feature/shared/strategies.utils';
import { FeatureStoreLoadingStrategy } from '../../feature/shared/strategies/loading';
import { FEATURE, FeatureMotion } from '../../feature/shared/feature.enums';
import { LanguageService } from '@igo2/core';
import { FeatureGeometry } from '../../feature/shared/feature.interfaces';
import { DirectionType } from './directions.enum';

/**
 * Function that updat the sort of the list base on the provided field.
 * @param source stop store
 * @param direction asc / desc sort order
 * @param field the field to use to sort the view
 */
export function updateStoreSorting(stopsStore: EntityStore<Stop>, direction: 'asc' | 'desc' = 'asc', field = 'order') {
  stopsStore.view.sort({
    direction,
    valueAccessor: (stop: Stop) => stop[field]
  });
}


/**
 * Function that compute the order property based on the provide list order.
 * @param source stop store
 * @param stop stops list (this list order must be used!)
 * @param emit if the store must emit a update change
 */
export function computeStopOrderBasedOnListOrder(stopsStore: EntityStore<Stop>, stops: Stop[], emit: boolean) {
  let cnt = 0;
  const stopsCnt = stops.length;
  const localStops = [...stops];
  localStops.map(s => {
    const stop = stopsStore.get(s.id);
    if (stop) {
      stop.order = cnt;
      if (cnt === 0) {
        stop.relativePosition = 'start';
      } else if (cnt === stopsCnt - 1) {
        stop.relativePosition = 'end';
      } else {
        stop.relativePosition = 'intermediate';
      }
      cnt += 1;
    }
  });
  if (emit) {
    stopsStore.updateMany(stops);
  }
}

/**
 * Function that add a stop to the stop store. Stop are always added before the last stop.
 * @param source stop store
 */
export function addStopToStore(stopsStore: EntityStore<Stop>): Stop {

  const lastStop = stopsStore.view.all()[stopsStore.count - 1];
  const lastStopId = lastStop.id;
  const lastStopOrder = lastStop.order;
  stopsStore.get(lastStopId).order = lastStopOrder + 1;
  const id = uuid();
  stopsStore.insert(
    {
      id,
      order: lastStopOrder,
      relativePosition: 'intermediate'
    });
  return stopsStore.get(id);
}

/**
 * Create a style for the directions stops and routes
 * @param feature OlFeature
 * @returns OL style function
 */
export function directionsStyle(
  feature: olFeature<OlGeometry>,
  resolution: number
): olStyle.Style | olStyle.Style[] {
  const vertexStyle = [
    new olStyle.Style({
      geometry: feature.getGeometry(),
      image: new olStyle.Circle({
        radius: 7,
        stroke: new olStyle.Stroke({ color: '#FF0000', width: 3 })
      })
    })
  ];

  const stopStyle = createOverlayMarkerStyle({
    text: feature.get('stopText'),
    opacity: feature.get('stopOpacity'),
    markerColor: feature.get('stopColor'),
    markerOutlineColor: [255, 255, 255]
  });

  const routeStyle = [
    new olStyle.Style({
      stroke: new olStyle.Stroke({ color: `rgba(106, 121, 130, ${feature.get('active') ? 0.75 : 0})`, width: 10 })
    }),
    new olStyle.Style({
      stroke: new olStyle.Stroke({ color: `rgba(79, 169, 221, ${feature.get('active') ? 0.75 : 0})`, width: 6 })
    })
  ];

  if (feature.get('type') === DirectionType.Stop) {
    return stopStyle;
  }
  if (feature.get('type') === 'vertex') {
    return vertexStyle;
  }
  if (feature.get('type') === DirectionType.Route) {
    return routeStyle;
  }
}

export function initStopsFeatureStore(stopsFeatureStore: FeatureStore<FeatureWithStop>, languageService: LanguageService) {
  const loadingStrategy = new FeatureStoreLoadingStrategy({
    motion: FeatureMotion.None
  });

  const stopsLayer = new VectorLayer({
    id: 'igo-direction-stops-layer',
    title: languageService.translate.instant('igo.geo.directionsForm.stopLayer'),
    zIndex: 911,
    source: new FeatureDataSource(),
    showInLayerList: true,
    workspace: {
      enabled: false,
    },
    linkedLayers: {
      linkId: 'igo-direction-stops-layer',
      links: [
        {
          bidirectionnal: false,
          syncedDelete: true,
          linkedIds: ['igo-direction-route-layer'],
          properties: []
        }
      ]
    },
    exportable: true,
    browsable: false,
    style: directionsStyle
  });
  tryBindStoreLayer(stopsFeatureStore, stopsLayer);
  stopsFeatureStore.layer.visible = true;
  tryAddLoadingStrategy(stopsFeatureStore, loadingStrategy);
}

export function initRoutesFeatureStore(routesFeatureStore: FeatureStore<FeatureWithDirection>, languageService: LanguageService) {
  const loadingStrategy = new FeatureStoreLoadingStrategy({
    motion: FeatureMotion.None
  });

  const routeLayer = new VectorLayer({
    id: 'igo-direction-route-layer',
    title: languageService.translate.instant('igo.geo.directionsForm.routeLayer'),
    zIndex: 910,
    source: new FeatureDataSource(),
    showInLayerList: true,
    workspace: {
      enabled: false,
    },
    linkedLayers: {
      linkId: 'igo-direction-route-layer'
    },
    exportable: true,
    browsable: false,
    style: directionsStyle
  });
  tryBindStoreLayer(routesFeatureStore, routeLayer);
  routesFeatureStore.layer.visible = true;
  tryAddLoadingStrategy(routesFeatureStore, loadingStrategy);
}


export function addStopToStopsFeatureStore(
  stop: Stop,
  stopsFeatureStore: FeatureStore<FeatureWithStop>,
  projection: string,
  languageService: LanguageService) {
  let stopColor;
  let stopText;

  switch (stop.relativePosition) {
    case 'start':
      stopColor = '#008000';
      stopText = languageService.translate.instant('igo.geo.directionsForm.start');
      break;
    case 'end':
      stopColor = '#f64139';
      stopText = languageService.translate.instant('igo.geo.directionsForm.end');
      break;
    default:
      stopColor = '#ffd700';
      stopText = `${languageService.translate.instant('igo.geo.directionsForm.intermediate')} # ${stop.order}`;
      break;
  }

  const geometry = new olGeom.Point(
    olProj.transform(stop.coordinates, projection, stopsFeatureStore.map.projection)
  );

  const geojsonGeom = new OlGeoJSON().writeGeometryObject(geometry, {
    featureProjection: stopsFeatureStore.map.projection,
    dataProjection: stopsFeatureStore.map.projection
  }) as FeatureGeometry;

  const previousStop = stopsFeatureStore.get(stop.id);
  const previousStopRevision = previousStop ? previousStop.meta.revision : 0;

  const stopFeatureStore: FeatureWithStop = {
    type: FEATURE,
    geometry: geojsonGeom,
    projection: stopsFeatureStore.map.projection,
    properties: {
      id: stop.id,
      type: DirectionType.Stop,
      stopText,
      stopColor,
      stopOpacity: 1,
      stop
    },
    meta: {
      id: stop.id,
      revision: previousStopRevision + 1
    },
    ol: new olFeature({ geometry })
  };
  stopsFeatureStore.update(stopFeatureStore);
}

export function addDirectionToRoutesFeatureStore(
  routesFeatureStore: FeatureStore,
  direction: Direction,
  projection: string,
  active: boolean = false,
  moveToExtent = false) {
  const geom = direction.geometry.coordinates;
  const geometry4326 = new olGeom.LineString(geom);
  const geometry = geometry4326.transform(
    projection,
    routesFeatureStore.map.projection
  );
  // todo
  /*if (moveToExtent) {
    this.zoomRoute(geometryMapProjection.getExtent());
  }*/

  const geojsonGeom = new OlGeoJSON().writeGeometryObject(geometry, {
    featureProjection: routesFeatureStore.map.projection,
    dataProjection: routesFeatureStore.map.projection
  }) as FeatureGeometry;


  const previousRoute = routesFeatureStore.get(direction.id);
  const previousRouteRevision = previousRoute
    ? previousRoute.meta.revision
    : 0;

  const routeFeatureStore: FeatureWithDirection = {
    type: FEATURE,
    geometry: geojsonGeom,
    projection: routesFeatureStore.map.projection,
    properties: {
      id: direction.id,
      type: DirectionType.Route,
      active,
      direction
    },
    meta: {
      id: direction.id,
      revision: previousRouteRevision + 1
    },
    ol: new olFeature({ geometry })
  };
  routesFeatureStore.update(routeFeatureStore);
}

export function formatDistance(distance: number): string {
  if (distance === 0) {
    return;
  }
  if (distance >= 100000) {
    return Math.round(distance / 1000) + ' km';
  }
  if (distance >= 10000) {
    return Math.round(distance / 100) / 10 + ' km';
  }
  if (distance >= 100) {
    return Math.round(distance / 100) / 10 + ' km';
  }
  return distance + ' m';
}

export function formatDuration(duration: number): string {
  if (duration >= 3600) {
    const hour = Math.floor(duration / 3600);
    const minute = Math.round((duration / 3600 - hour) * 60);
    if (minute === 60) {
      return hour + 1 + ' h';
    }
    return hour + ' h ' + minute + ' min';
  }

  if (duration >= 60) {
    return Math.round(duration / 60) + ' min';
  }
  return duration + ' s';
}

export function formatInstruction(
  type,
  modifier,
  route,
  direction,
  stepPosition,
  exit,
  languageService: LanguageService,
  lastStep = false
) {
  let directiveFr;
  let directiveEn;
  let image = 'forward';
  let cssClass = 'rotate-270';
  const translatedDirection = translateBearing(direction, languageService);
  const translatedModifier = translateModifier(modifier, languageService);
  const enPrefix = modifier === 'straight' ? '' : 'on the ';
  const frPrefix = modifier === 'straight' ? '' : 'à ';

  let frAggregatedDirection = frPrefix + translatedModifier;
  let enAggregatedDirection = enPrefix + translatedModifier;

  if (modifier && modifier.search('slight') >= 0) {
    enAggregatedDirection = translatedModifier;
  }

  if (modifier === 'uturn') {
    image = 'forward';
    cssClass = 'rotate-90';
  } else if (modifier === 'sharp right') {
    image = 'subdirectory-arrow-right';
    cssClass = 'icon-flipped';
  } else if (modifier === 'right') {
    image = 'subdirectory-arrow-right';
    cssClass = 'icon-flipped';
  } else if (modifier === 'slight right') {
    image = 'forward';
    cssClass = 'rotate-290';
  } else if (modifier === 'straight') {
    image = 'forward';
  } else if (modifier === 'slight left') {
    image = 'forward';
    cssClass = 'rotate-250';
  } else if (modifier === 'left') {
    image = 'subdirectory-arrow-left';
    cssClass = 'icon-flipped';
  } else if (modifier === 'sharp left') {
    image = 'subdirectory-arrow-left';
    cssClass = 'icon-flipped';
  }

  if (type === 'turn') {
    if (modifier === 'straight') {
      directiveFr = 'Continuer sur ' + route;
      directiveEn = 'Continue on ' + route;
    } else if (modifier === 'uturn') {
      directiveFr = 'Faire demi-tour sur ' + route;
      directiveEn = 'Make u-turn on ' + route;
    } else {
      directiveFr = 'Tourner ' + frAggregatedDirection + ' sur ' + route;
      directiveEn = 'Turn ' + translatedModifier + ' onto ' + route;
    }
  } else if (type === 'new name') {
    directiveFr =
      'Continuer en direction ' + translatedDirection + ' sur ' + route;
    directiveEn = 'Head ' + translatedDirection + ' on ' + route;
    image = 'compass';
    cssClass = '';
  } else if (type === 'depart') {
    directiveFr =
      'Aller en direction ' + translatedDirection + ' sur ' + route;
    directiveEn = 'Head ' + translatedDirection + ' on ' + route;
    image = 'compass';
    cssClass = '';
  } else if (type === 'arrive') {
    if (lastStep) {
      let coma = ', ';
      if (!translatedModifier) {
        frAggregatedDirection = '';
        enAggregatedDirection = '';
        coma = '';
      }
      directiveFr = 'Vous êtes arrivé' + coma + frAggregatedDirection;
      directiveEn =
        'You have reached your destination' + coma + enAggregatedDirection;
    } else {
      directiveFr = 'Vous atteignez le point intermédiare sur ' + route;
      directiveEn = 'You have reached the intermediate stop onto ' + route;
      image = 'map-marker';
      cssClass = '';
    }
  } else if (type === 'merge') {
    directiveFr = 'Continuer sur ' + route;
    directiveEn = 'Continue on ' + route;
    image = 'forward';
    cssClass = 'rotate-270';
  } else if (type === 'on ramp') {
    directiveFr = "Prendre l'entrée d'autoroute " + frAggregatedDirection;
    directiveEn = 'Take the ramp ' + enAggregatedDirection;
  } else if (type === 'off ramp') {
    directiveFr = "Prendre la sortie d'autoroute " + frAggregatedDirection;
    directiveEn = 'Take exit ' + enAggregatedDirection;
  } else if (type === 'fork') {
    if (modifier.search('left') >= 0) {
      directiveFr = 'Garder la gauche sur ' + route;
      directiveEn = 'Merge left onto ' + route;
    } else if (modifier.search('right') >= 0) {
      directiveFr = 'Garder la droite sur ' + route;
      directiveEn = 'Merge right onto ' + route;
    } else {
      directiveFr = 'Continuer sur ' + route;
      directiveEn = 'Continue on ' + route;
    }
  } else if (type === 'end of road') {
    directiveFr =
      'À la fin de la route, tourner ' + translatedModifier + ' sur ' + route;
    directiveEn =
      'At the end of the road, turn ' + translatedModifier + ' onto ' + route;
  } else if (type === 'use lane') {
    directiveFr = 'Prendre la voie de ... ';
    directiveEn = 'Take the lane ...';
  } else if (type === 'continue' && modifier !== 'uturn') {
    directiveFr = 'Continuer sur ' + route;
    directiveEn = 'Continue on ' + route;
    image = 'forward';
    cssClass = 'rotate-270';
  } else if (type === 'roundabout') {
    directiveFr = 'Au rond-point, prendre la ' + exit;
    directiveFr += exit === 1 ? 're' : 'e';
    directiveFr += ' sortie vers ' + route;
    directiveEn = 'At the roundabout, take the ' + exit;
    directiveEn += exit === 1 ? 'st' : 'rd';
    directiveEn += ' exit towards ' + route;
    image = 'chart-donut';
    cssClass = '';
  } else if (type === 'rotary') {
    directiveFr = 'Rond-point rotary....';
    directiveEn = 'Roundabout rotary....';
    image = 'chart-donut';
    cssClass = '';
  } else if (type === 'roundabout turn') {
    directiveFr = 'Rond-point, prendre la ...';
    directiveEn = 'Roundabout, take the ...';
    image = 'chart-donut';
    cssClass = '';
  } else if (type === 'exit roundabout') {
    directiveFr = 'Poursuivre vers ' + route;
    directiveEn = 'Continue to ' + route;
    image = 'forward';
    cssClass = 'rotate-270';
  } else if (type === 'notification') {
    directiveFr = 'notification ....';
    directiveEn = 'notification ....';
  } else if (modifier === 'uturn') {
    directiveFr =
      'Faire demi-tour et continuer en direction ' +
      translatedDirection +
      ' sur ' +
      route;
    directiveEn =
      'Make u-turn and head ' + translatedDirection + ' on ' + route;
  } else {
    directiveFr = '???';
    directiveEn = '???';
  }

  if (lastStep) {
    image = 'flag-variant';
    cssClass = '';
  }
  if (stepPosition === 0) {
    image = 'compass';
    cssClass = '';
  }

  /*let directive;
  if (this.browserLanguage === 'fr') {
    directive = directiveFr;
  } else if (this.browserLanguage === 'en') {
    directive = directiveEn;
  }*/

  return { instruction: directiveFr, image, cssClass };
}

export function translateModifier(modifier, languageService: LanguageService) {
  const translate = languageService.translate;
  if (modifier === 'uturn') {
    return translate.instant('igo.geo.directions.uturn');
  } else if (modifier === 'sharp right') {
    return translate.instant('igo.geo.directions.sharp right');
  } else if (modifier === 'right') {
    return translate.instant('igo.geo.directions.right');
  } else if (modifier === 'slight right') {
    return translate.instant('igo.geo.directions.slight right');
  } else if (modifier === 'sharp left') {
    return languageService.translate.instant('igo.geo.directions.sharp left');
  } else if (modifier === 'left') {
    return languageService.translate.instant('igo.geo.directions.left');
  } else if (modifier === 'slight left') {
    return languageService.translate.instant('igo.geo.directions.slight left');
  } else if (modifier === 'straight') {
    return languageService.translate.instant('igo.geo.directions.straight');
  } else {
    return modifier;
  }
}

export function translateBearing(bearing: number, languageService: LanguageService) {
  const translate = languageService.translate;
  if (bearing >= 337 || bearing < 23) {
    return translate.instant('igo.geo.cardinalPoints.n');
  } else if (bearing < 67) {
    return translate.instant('igo.geo.cardinalPoints.ne');
  } else if (bearing < 113) {
    return translate.instant('igo.geo.cardinalPoints.e');
  } else if (bearing < 157) {
    return translate.instant('igo.geo.cardinalPoints.se');
  } else if (bearing < 203) {
    return translate.instant('igo.geo.cardinalPoints.s');
  } else if (bearing < 247) {
    return translate.instant('igo.geo.cardinalPoints.sw');
  } else if (bearing < 293) {
    return translate.instant('igo.geo.cardinalPoints.w');
  } else if (bearing < 337) {
    return translate.instant('igo.geo.cardinalPoints.nw');
  } else {
    return;
  }
}


