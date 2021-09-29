import olFeature from 'ol/Feature';
import * as olStyle from 'ol/style';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as olGeom from 'ol/geom';
import OlGeoJSON from 'ol/format/GeoJSON';
import * as olProj from 'ol/proj';


import { EntityRecord, EntityState, EntityStore } from '@igo2/common';
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
import { DirectionRelativePositionType, DirectionType } from './directions.enum';

/**
 * Function that updat the sort of the list base on the provided field.
 * @param source stop store
 * @param direction asc / desc sort order
 * @param field the field to use to sort the view
 */
export function updateStoreSorting(stopsStore: EntityStore<Stop>, direction: 'asc' | 'desc' = 'asc', field = 'position') {
  stopsStore.stateView.sort({
    direction,
    valueAccessor: (entity: EntityRecord<Stop, EntityState>) => entity.state[field]
  });
}

export function computeRelativePosition(index: number, totalLength): DirectionRelativePositionType {
  let relativePosition = DirectionRelativePositionType.Intermediate;
  if (index === 0) {
    relativePosition = DirectionRelativePositionType.Start;
  } else if (index === totalLength - 1) {
    relativePosition = DirectionRelativePositionType.End;
  }
  return relativePosition;
}

/**
 * Function that add a stop to the stop store. Stop are always added before the last stop.
 * @param stopsStore stop store as an EntityStore
 */
export function addStopToStore(stopsStore: EntityStore<Stop>): Stop {

  let addedStop: Stop;
  const id = uuid();
  const stopsWithStates = stopsStore.stateView.all();
  let positions: number[];
  let relativePosition = DirectionRelativePositionType.Intermediate
  if (stopsStore.empty) {
    positions = [0];
    relativePosition = DirectionRelativePositionType.Start;
  } else {
    positions = stopsWithStates.map(stopState => stopState.state.position);
  }
  const maxPosition: number = Math.max(...positions);
  stopsStore.insert({ id });
  addedStop = stopsStore.get(id);
  const stopsCnt = stopsStore.count;
  if (stopsCnt === 1) {
    stopsStore.state.update(addedStop, { position: maxPosition, relativePosition });
    return addedStop;
  }
  const stopsWithStateToIncrementPosition = stopsStore.stateView.all().filter(stopState => stopState.state.position >= maxPosition);
  stopsWithStateToIncrementPosition.map(stopWithStateToIncrementPosition => {
    const stop = stopWithStateToIncrementPosition.entity;
    const state = stopWithStateToIncrementPosition.state;
    stopsStore.state.update(stop, {
      position: state.position + 1,
      relativePosition: computeRelativePosition(state.position + 1, stopsCnt)
    });

  });
  relativePosition = computeRelativePosition(maxPosition, stopsCnt);

  stopsStore.state.update(addedStop, { position: maxPosition, relativePosition });

  updateStoreSorting(stopsStore);
  return addedStop;
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
  stopsStore: EntityStore<Stop>,
  stopsFeatureStore: FeatureStore<FeatureWithStop>,
  projection: string,
  languageService: LanguageService) {
  let stopColor;
  let stopText;

  const stopWithState = stopsStore.stateView.get(stop.id)
  switch (stopWithState.state.relativePosition) {
    case DirectionRelativePositionType.Start:
      stopColor = '#008000';
      stopText = languageService.translate.instant('igo.geo.directionsForm.start');
      break;
    case DirectionRelativePositionType.End:
      stopColor = '#f64139';
      stopText = languageService.translate.instant('igo.geo.directionsForm.end');
      break;
    default:
      stopColor = '#ffd700';
      stopText = `${languageService.translate.instant('igo.geo.directionsForm.intermediate')} # ${stopWithState.state.position}`;
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
  const translate = languageService.translate;
  let directive;
  let image = 'forward';
  let cssClass = 'rotate-270';
  const translatedDirection = translateBearing(direction, languageService);
  const translatedModifier = translateModifier(modifier, languageService);
  const prefix = modifier === 'straight' ? '' : translate.instant('igo.geo.directions.modifier.prefix');

  let aggregatedDirection = prefix + translatedModifier;


  if (modifier?.search('slight') >= 0) {
    aggregatedDirection = translatedModifier;
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
      directive = translate.instant('igo.geo.directions.turn.straight', { route });
    } else if (modifier === 'uturn') {
      directive = translate.instant('igo.geo.directions.turn.uturn', { route });
    } else {
      directive = translate.instant('igo.geo.directions.turn.else', { route, aggregatedDirection, translatedModifier });
    }
  } else if (type === 'new name') {
    directive = translate.instant('igo.geo.directions.new name', { route, translatedDirection });
    image = 'compass';
    cssClass = '';
  } else if (type === 'depart') {
    directive = translate.instant('igo.geo.directions.depart', { route, translatedDirection });
    image = 'compass';
    cssClass = '';
  } else if (type === 'arrive') {
    if (lastStep) {
      const coma = !translatedModifier ? '' : ', ';
      aggregatedDirection = !translatedModifier ? '' : aggregatedDirection;
      directive = translate.instant('igo.geo.directions.arrive.lastStep', { coma, aggregatedDirection });
    } else {
      directive = translate.instant('igo.geo.directions.arrive.intermediate', { route });
      image = 'map-marker';
      cssClass = '';
    }
  } else if (type === 'merge') {
    directive = translate.instant('igo.geo.directions.merge', { route });
    image = 'forward';
    cssClass = 'rotate-270';
  } else if (type === 'on ramp') {
    directive = translate.instant('igo.geo.directions.on ramp', { aggregatedDirection });
  } else if (type === 'off ramp') {
    directive = translate.instant('igo.geo.directions.off ramp', { aggregatedDirection });
  } else if (type === 'fork') {
    if (modifier.search('left') >= 0) {
      directive = translate.instant('igo.geo.directions.fork.left', { route });
    } else if (modifier.search('right') >= 0) {
      directive = translate.instant('igo.geo.directions.fork.right', { route });
    } else {
      directive = translate.instant('igo.geo.directions.fork.else', { route });
    }
  } else if (type === 'end of road') {
    directive = translate.instant('igo.geo.directions.end of road', { translatedModifier, route });
  } else if (type === 'use lane') {
    directive = translate.instant('igo.geo.directions.use lane');
  } else if (type === 'continue' && modifier !== 'uturn') {
    directive = translate.instant('igo.geo.directions.continue.notUturn', { route });
    image = 'forward';
    cssClass = 'rotate-270';
  } else if (type === 'roundabout') {
    const cntSuffix = exit === 1 ?
    translate.instant('igo.geo.directions.cntSuffix.first') : translate.instant('igo.geo.directions.cntSuffix.secondAndMore');
    directive = translate.instant('igo.geo.directions.roundabout', { exit, cntSuffix, route });
    image = 'chart-donut';
    cssClass = '';
  } else if (type === 'rotary') {
    directive = translate.instant('igo.geo.directions.rotary');
    image = 'chart-donut';
    cssClass = '';
  } else if (type === 'roundabout turn') {
    directive = translate.instant('igo.geo.directions.roundabout turn');
    image = 'chart-donut';
    cssClass = '';
  } else if (type === 'exit roundabout') {
    directive = translate.instant('igo.geo.directions.exit roundabout', { route });
    image = 'forward';
    cssClass = 'rotate-270';
  } else if (type === 'notification') {
    directive = translate.instant('igo.geo.directions.notification');
  } else if (modifier === 'uturn') {
    directive = translate.instant('igo.geo.directions.uturnText', { translatedDirection, route });
  } else {
    directive = translate.instant('igo.geo.directions.unknown');
  }

  image = lastStep ? 'flag-variant' : image;
  cssClass = lastStep ? '' : cssClass;
  image = stepPosition === 0 ? 'compass' : image;
  cssClass = stepPosition === 0 ? '' : cssClass;

  return { instruction: directive, image, cssClass };
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


