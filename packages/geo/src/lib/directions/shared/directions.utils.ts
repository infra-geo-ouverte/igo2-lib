import { LanguageService } from '@igo2/core/language';
import { NumberUtils, uuid } from '@igo2/utils';

import olFeature from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import OlGeoJSON from 'ol/format/GeoJSON';
import * as olGeom from 'ol/geom';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as olProj from 'ol/proj';
import * as olStyle from 'ol/style';

import { TranslateService } from '@ngx-translate/core';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { tryBindStoreLayer } from '../../feature/shared/feature-store.utils';
import { FEATURE, FeatureMotion } from '../../feature/shared/feature.enums';
import { FeatureGeometry } from '../../feature/shared/feature.interfaces';
import { tryAddLoadingStrategy } from '../../feature/shared/strategies.utils';
import { FeatureStoreLoadingStrategy } from '../../feature/shared/strategies/loading';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { createOverlayMarkerStyle } from '../../style/shared/overlay/overlay-marker-style.utils';
import {
  DirectionRelativePositionType,
  DirectionsType,
  ManeuverModifier,
  ManeuverType
} from './directions.enum';
import {
  Directions,
  FeatureWithDirections,
  FeatureWithStop,
  IgoStep,
  Stop
} from './directions.interface';
import {
  RoutesFeatureStore,
  StepsFeatureStore,
  StopsFeatureStore,
  StopsStore
} from './store';

/**
 * Updates the sorting of the stops in the provided StopsStore based on the specified field and direction.
 *
 * @param {StopsStore} stopsStore - The StopsStore to update the sorting for.
 * @param {'asc' | 'desc'} [direction='asc'] - The direction of sorting ('asc' for ascending, 'desc' for descending).
 * @param {string} [field='position'] - The field to sort the stops by.
 */
export function updateStoreSorting(
  stopsStore: StopsStore,
  direction: 'asc' | 'desc' = 'asc',
  field = 'position'
): void {
  stopsStore.view.sort({
    direction,
    valueAccessor: (entity: Stop) => entity[field]
  });
}

/**
 * Computes the relative position of a stop in a list of stops.
 *
 * @param {number} stopIndex - The index of the stop.
 * @param {number} stopListLength - The total number of stops.
 * @return {DirectionRelativePositionType} The relative position of the stop.
 */
export function computeRelativePosition(
  stopIndex: number,
  stopListLength: number
): DirectionRelativePositionType {
  let relativePosition: DirectionRelativePositionType =
    DirectionRelativePositionType.Intermediate;
  if (stopIndex === 0) {
    relativePosition = DirectionRelativePositionType.Start;
  } else if (stopIndex === stopListLength) {
    relativePosition = DirectionRelativePositionType.End;
  }
  return relativePosition;
}

/**
 * Computes the position and relative position of stops in the given stopsStore.
 *
 * @param {StopsStore} stopsStore - The store containing the stops.
 */
export function computeStopsPosition(
  deletedStopIndex: number,
  stopsStore: StopsStore
): void {
  for (const stop of stopsStore.all()) {
    stop.position =
      stop.position > deletedStopIndex ? (stop.position -= 1) : stop.position;
    stop.relativePosition = computeRelativePosition(
      stop.position,
      stopsStore.all().length - 1
    );
  }
}

/**
 * Adds a stop to the given stopsStore. The stop is always added as the last stop.
 *
 * @param {StopsStore} stopsStore - The store containing the stops.
 * @return {Stop} The newly added stop.
 */
export function addStopToStore(stopsStore: StopsStore): Stop {
  const id: string = uuid();
  const stops: Stop[] = stopsStore.all();
  const insertIndex = stops.length;

  for (const stop of stopsStore.all()) {
    stop.relativePosition = computeRelativePosition(
      stop.position,
      stops.length
    );
  }

  stopsStore.insert({
    id,
    position: insertIndex,
    relativePosition: computeRelativePosition(insertIndex, stops.length)
  });

  updateStoreSorting(stopsStore);
  return stopsStore.get(id);
}

/**
 * Removes a stop from the given stopsStore and updates the positions of the remaining stops.
 *
 * @param {StopsStore} stopsStore - The store containing the stops.
 * @param {Stop} stop - The stop to be removed.
 */
export function removeStopFromStore(stopsStore: StopsStore, stop: Stop): void {
  stopsStore.delete(stop);
  computeStopsPosition(stop.position, stopsStore);
}

/**
 * Create a style for the directions steps, stops and route
 * @param feature OlFeature
 * @returns OL style function
 */
export function directionsStyle(
  feature: olFeature<OlGeometry>
): olStyle.Style | olStyle.Style[] {
  const stepStyle = [
    new olStyle.Style({
      geometry: feature.getGeometry(),
      image: new olStyle.Circle({
        radius: 7,
        stroke: new olStyle.Stroke({ color: '#FF0000', width: 3 })
      })
    })
  ];

  const stopStyle: olStyle.Style = createOverlayMarkerStyle({
    text: feature.get('stopText'),
    opacity: feature.get('stopOpacity'),
    markerColor: feature.get('stopColor'),
    markerOutlineColor: [255, 255, 255]
  });

  const routeStyle: olStyle.Style[] = [
    new olStyle.Style({
      stroke: new olStyle.Stroke({
        color: `rgba(106, 121, 130, ${feature.get('active') ? 0.75 : 0})`,
        width: 10
      })
    }),
    new olStyle.Style({
      stroke: new olStyle.Stroke({
        color: `rgba(79, 169, 221, ${feature.get('active') ? 0.75 : 0})`,
        width: 6
      })
    })
  ];

  if (feature.get('type') === DirectionsType.Stop) {
    return stopStyle;
  }
  if (feature.get('type') === DirectionsType.Vertex) {
    return stepStyle;
  }
  if (feature.get('type') === DirectionsType.Route) {
    return routeStyle;
  }
}

/**
 * Initializes the stops feature store with the provided language service.
 *
 * @param {StopsFeatureStore} stopsFeatureStore - The stops feature store to initialize.
 * @param {LanguageService} languageService - The language service used for translations.
 */
export function initStopsFeatureStore(
  stopsFeatureStore: StopsFeatureStore,
  languageService: LanguageService
): void {
  const loadingStrategy: FeatureStoreLoadingStrategy =
    new FeatureStoreLoadingStrategy({
      motion: FeatureMotion.None
    });

  const stopsLayer: VectorLayer = new VectorLayer({
    isIgoInternalLayer: true,
    id: 'igo-direction-stops-layer',
    title: languageService.translate.instant('igo.geo.directions.layer.stops'),
    zIndex: 911,
    source: new FeatureDataSource(),
    showInLayerList: true,
    visible: true,
    workspace: {
      enabled: false
    },
    linkedLayers: {
      linkId: 'igo-direction-stops-layer',
      links: [
        {
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
  tryAddLoadingStrategy(stopsFeatureStore, loadingStrategy);
}

/**
 * Initializes the routes feature store with the provided language service.
 *
 * @param {StopsFeatureStore} routesFeatureStore - The routes feature store to initialize.
 * @param {LanguageService} languageService - The language service used for translations.
 */
export function initRoutesFeatureStore(
  routesFeatureStore: RoutesFeatureStore,
  languageService: LanguageService
): void {
  const loadingStrategy: FeatureStoreLoadingStrategy =
    new FeatureStoreLoadingStrategy({
      motion: FeatureMotion.None
    });

  const routeLayer: VectorLayer = new VectorLayer({
    isIgoInternalLayer: true,
    id: 'igo-direction-route-layer',
    title: languageService.translate.instant('igo.geo.directions.layer.route'),
    zIndex: 910,
    source: new FeatureDataSource(),
    showInLayerList: true,
    visible: true,
    workspace: {
      enabled: false
    },
    linkedLayers: {
      linkId: 'igo-direction-route-layer'
    },
    exportable: true,
    browsable: false,
    style: directionsStyle
  });
  tryBindStoreLayer(routesFeatureStore, routeLayer);
  tryAddLoadingStrategy(routesFeatureStore, loadingStrategy);
}

/**
 * Initializes the routes feature store.
 *
 * @param {StopsFeatureStore} stepsFeatureStore - The steps feature store to initialize.
 */
export function initStepsFeatureStore(stepsFeatureStore: StepsFeatureStore) {
  const loadingStrategy: FeatureStoreLoadingStrategy =
    new FeatureStoreLoadingStrategy({
      motion: FeatureMotion.None
    });

  const stepLayer: VectorLayer = new VectorLayer({
    isIgoInternalLayer: true,
    id: 'igo-direction-step-layer',
    title: '',
    zIndex: 910,
    source: new FeatureDataSource(),
    showInLayerList: false,
    visible: true,
    workspace: {
      enabled: false
    },
    linkedLayers: {
      linkId: 'igo-direction-route-layer'
    },
    exportable: false,
    browsable: false,
    style: directionsStyle
  });
  tryBindStoreLayer(stepsFeatureStore, stepLayer);
  tryAddLoadingStrategy(stepsFeatureStore, loadingStrategy);
}

/**
 * Adds a stop to the stopsFeatureStore.
 *
 * @param {Stop} stop - The stop to be added.
 * @param {StopsFeatureStore} stopsFeatureStore - The stopsFeatureStore to add the stop to.
 * @param {string} projection - The projection of the stop coordinates.
 * @param {LanguageService} languageService - The language service for translating stop text.
 */
export function addStopToStopsFeatureStore(
  stop: Stop,
  stopsFeatureStore: StopsFeatureStore,
  projection: string,
  languageService: LanguageService
): void {
  let stopColor: string;
  let stopText: string;

  switch (stop.relativePosition) {
    case DirectionRelativePositionType.Start:
      stopColor = '#008000';
      stopText = languageService.translate.instant(
        'igo.geo.directions.input.start'
      );
      break;
    case DirectionRelativePositionType.End:
      stopColor = '#f64139';
      stopText = languageService.translate.instant(
        'igo.geo.directions.input.end'
      );
      break;
    default:
      stopColor = '#ffd700';
      stopText =
        languageService.translate.instant(
          'igo.geo.directions.input.intermediate'
        ) +
        ' #' +
        stop.position;
      break;
  }

  const point: olGeom.Point = new olGeom.Point(
    olProj.transform(
      stop.coordinates,
      projection,
      stopsFeatureStore.map.projectionCode
    )
  );

  const geojsonGeom: FeatureGeometry = new OlGeoJSON().writeGeometryObject(
    point,
    {
      featureProjection: stopsFeatureStore.map.projectionCode,
      dataProjection: stopsFeatureStore.map.projectionCode
    }
  ) as FeatureGeometry;

  const previousStop: FeatureWithStop = stopsFeatureStore.get(stop.id);
  const previousStopRevision: number = previousStop
    ? previousStop.meta.revision
    : 0;

  const stopFeatureStore: FeatureWithStop = {
    type: FEATURE,
    geometry: geojsonGeom,
    projection: stopsFeatureStore.map.projectionCode,
    properties: {
      id: stop.id,
      type: DirectionsType.Stop,
      stopText,
      stopColor,
      stopOpacity: 1,
      stop
    },
    meta: {
      id: stop.id,
      revision: previousStopRevision + 1
    },
    ol: new olFeature({ point })
  };
  stopsFeatureStore.update(stopFeatureStore);
}

/**
 * Adds a route to the routes feature store.
 *
 * @param {RoutesFeatureStore} routesFeatureStore - The routes feature store to add the route to.
 * @param {Directions} directions - The directions object containing the geometry and other information.
 * @param {string} projection - The projection of the geometry coordinates.
 * @param {boolean} [active=false] - Indicates whether the direction is active or not. Default is false.
 */
export function addRouteToRoutesFeatureStore(
  routesFeatureStore: RoutesFeatureStore,
  directions: Directions,
  projection: string,
  active = false
): void {
  const coordinate: Coordinate = directions.geometry.coordinates;
  const linestring4326: olGeom.LineString = new olGeom.LineString(coordinate);
  const linestringStore: olGeom.LineString = linestring4326.transform(
    projection,
    routesFeatureStore.map.projectionCode
  );

  const geojsonGeom: FeatureGeometry = new OlGeoJSON().writeGeometryObject(
    linestringStore,
    {
      featureProjection: routesFeatureStore.map.projectionCode,
      dataProjection: routesFeatureStore.map.projectionCode
    }
  ) as FeatureGeometry;

  const previousRoute: FeatureWithDirections = routesFeatureStore.get(
    directions.id
  );
  const previousRouteRevision: number = previousRoute
    ? previousRoute.meta.revision
    : 0;

  const routeFeatureStore: FeatureWithDirections = {
    type: FEATURE,
    geometry: geojsonGeom,
    projection: routesFeatureStore.map.projectionCode,
    properties: {
      id: directions.id,
      type: DirectionsType.Route,
      active,
      directions
    },
    meta: {
      id: directions.id,
      revision: previousRouteRevision + 1
    },
    ol: new olFeature({ linestringStore })
  };
  routesFeatureStore.update(routeFeatureStore);
}

/**
 * Formats the given distance in meters to a human-readable string.
 *
 * @param {number} meters - The distance in meters to be formatted.
 * @return {string | undefined} The formatted distance string.
 */
export function formatDistance(meters: number): string {
  if (meters === 0) {
    return undefined;
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const kilometers: number = meters / 1000;
  const roundToDecimal: 0 | 1 = kilometers >= 10 ? 1 : 0;

  return `${NumberUtils.roundToNDecimal(kilometers, roundToDecimal)} km`.replace(
    '.',
    ','
  );
}

/**
 * Formats the given duration in seconds to a human-readable string.
 *
 * @param {number} seconds - The duration in seconds to be formatted.
 * @return {string} The formatted duration string.
 */
export function formatDuration(seconds: number): string {
  const hours: number = Math.floor(seconds / 3600);
  const minutes: number = Math.floor((seconds % 3600) / 60);

  if (hours) {
    return `${hours} h ${minutes} min`;
  }

  if (minutes) {
    return `${minutes} min`;
  }

  return '< 1 min';
}

export function formatStep(
  step: IgoStep,
  languageService: LanguageService,
  lastStep = false
) {
  const maneuverType: ManeuverType = step.maneuver.type;
  const maneuverModifier: ManeuverModifier = step.maneuver.modifier;
  const name: string = step.name;
  const maneuverBearingAfter: number = step.maneuver.bearing_after;

  const translate: TranslateService = languageService.translate;
  const translatedManeuverBearingAfter: string = translateManeuverBearing(
    maneuverBearingAfter,
    languageService
  );
  const translatedManeuverModifier: string = translateManeuverModifier(
    maneuverModifier,
    languageService
  );

  let iconName = 'straight'; // arrow point up by default
  let instruction = '';

  if (maneuverType === ManeuverType.Turn) {
    if (
      maneuverModifier === ManeuverModifier.Uturn ||
      maneuverModifier === ManeuverModifier.Straight
    ) {
      instruction = translate.instant(
        `igo.geo.directions.results.maneuverType.turn.${maneuverModifier}`,
        {
          maneuverModifier: translatedManeuverModifier,
          name
        }
      );
      if (maneuverModifier === ManeuverModifier.Uturn) {
        iconName = 'u_turn_left';
      }
    } else {
      instruction = translate.instant(
        'igo.geo.directions.results.maneuverType.turn.else',
        {
          maneuverModifier: translatedManeuverModifier,
          name
        }
      );

      if (maneuverModifier === ManeuverModifier.SlightRight) {
        iconName = 'turn_slight_right';
      } else if (
        maneuverModifier === ManeuverModifier.Right ||
        maneuverModifier === ManeuverModifier.SharpRight
      ) {
        iconName = 'turn_right';
      } else if (
        maneuverModifier === ManeuverModifier.Left ||
        maneuverModifier === ManeuverModifier.SharpLeft
      ) {
        iconName = 'turn_left';
      } else if (maneuverModifier === ManeuverModifier.SlightLeft) {
        iconName = 'turn_slight_left';
      }
    }
  } else if (maneuverType === ManeuverType.NewName) {
    instruction = translate.instant(
      `igo.geo.directions.results.maneuverType.new name`,
      {
        name,
        maneuverBearing: translatedManeuverBearingAfter
      }
    );
  } else if (maneuverType === ManeuverType.Depart) {
    iconName = 'directions';
    instruction = translate.instant(
      `igo.geo.directions.results.maneuverType.depart`,
      {
        name,
        maneuverBearing: translatedManeuverBearingAfter
      }
    );
  } else if (maneuverType === ManeuverType.Arrive) {
    iconName = 'sports_score';
    instruction = translate.instant(
      `igo.geo.directions.results.maneuverType.arrive.${lastStep ? 'lastStep' : 'intermediate'}`,
      {
        name
      }
    );
  } else if (maneuverType === ManeuverType.Merge) {
    instruction = translate.instant(
      'igo.geo.directions.results.maneuverType.merge',
      {
        name
      }
    );
    iconName = 'merge';
  } else if (
    maneuverType === ManeuverType.OnRamp ||
    maneuverType === ManeuverType.OffRamp
  ) {
    instruction = translate.instant(
      `igo.geo.directions.results.maneuverType.${maneuverType}`,
      {
        maneuverModifier: translatedManeuverModifier
      }
    );
  } else if (maneuverType === ManeuverType.Fork) {
    const directionKey: string =
      maneuverModifier.search('left') >= 0 ? 'left' : 'right';
    iconName =
      directionKey === 'left' ? 'turn_slight_left' : 'turn_slight_right';
    instruction = translate.instant(
      `igo.geo.directions.results.maneuverType.fork.${directionKey}`,
      {
        name
      }
    );
  } else if (
    maneuverType === ManeuverType.EndOfRoad ||
    maneuverType === ManeuverType.UseLane ||
    maneuverType === ManeuverType.Continue
  ) {
    if (maneuverType === ManeuverType.Continue) {
      if (maneuverModifier === ManeuverModifier.Uturn) {
        iconName = 'u_turn_left';
        instruction = translate.instant(
          `igo.geo.directions.results.maneuverType.turn.${maneuverModifier}`,
          {
            maneuverModifier: translatedManeuverModifier,
            name
          }
        );
      } else {
        instruction = translate.instant(
          `igo.geo.directions.results.maneuverType.${maneuverType}`,
          {
            maneuverModifier: translatedManeuverModifier,
            name
          }
        );
      }
    } else {
      if (
        maneuverModifier === ManeuverModifier.SharpRight ||
        maneuverModifier === ManeuverModifier.Right
      ) {
        iconName = 'turn_right';
      } else if (
        maneuverModifier === ManeuverModifier.SharpLeft ||
        maneuverModifier === ManeuverModifier.Left
      ) {
        iconName = 'turn_left';
      } else if (maneuverModifier === ManeuverModifier.SlightRight) {
        iconName = 'turn_slight_right';
      } else if (maneuverModifier === ManeuverModifier.SlightLeft) {
        iconName = 'turn_slight_left';
      }
      instruction = translate.instant(
        `igo.geo.directions.results.maneuverType.${maneuverType}`,
        {
          maneuverModifier: translatedManeuverModifier,
          name
        }
      );
    }
  } else if (
    maneuverType === ManeuverType.Roundabout ||
    maneuverType === ManeuverType.Rotary ||
    maneuverType === ManeuverType.RoundaboutTurn ||
    maneuverType === ManeuverType.ExitRoundabout
  ) {
    const roundaboutKey = maneuverType.replace('roundabout ', '');
    instruction = translate.instant(
      `igo.geo.directions.results.maneuverType.${roundaboutKey}`,
      {
        name
      }
    );
    iconName = 'donut_large';
  } else if (maneuverType === ManeuverType.Notification) {
    instruction = translate.instant(
      'igo.geo.directions.results.maneuverType.notification'
    );
  }

  return { instruction, iconName };
}

/**
 * Translates a maneuver modifier into a human-readable string using the provided language service.
 *
 * @param {ManeuverModifier} maneuverModifier - The maneuver modifier to be translated.
 * @param {LanguageService} languageService - The language service used for translation.
 * @return {string | undefined} The translated maneuver modifier string, or undefined if the modifier is falsy.
 */
export function translateManeuverModifier(
  maneuverModifier: ManeuverModifier,
  languageService: LanguageService
): string {
  const translate = languageService.translate;
  return maneuverModifier
    ? translate.instant(
        `igo.geo.directions.results.maneuverModifier.${maneuverModifier}`
      )
    : undefined;
}

/**
 * Translates the given bearing value into a human-readable direction using the provided language service.
 *
 * @param {number} bearing - The bearing value to be translated.
 * @param {LanguageService} languageService - The language service used for translation.
 * @return {string} The translated direction corresponding to the given bearing value.
 */
export function translateManeuverBearing(
  bearing: number,
  languageService: LanguageService
): string {
  const translate: TranslateService = languageService.translate;
  const directions: string[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

  const directionIndex: number = Math.round(bearing / 45) % 8;

  return translate.instant(
    `igo.geo.directions.results.direction.${directions[directionIndex]}`
  );
}
