import { LanguageService } from '@igo2/core';
import { NumberUtils, uuid } from '@igo2/utils';

import olFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';
import * as olGeom from 'ol/geom';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as olProj from 'ol/proj';
import * as olStyle from 'ol/style';

import {
  Route,
  FeatureWithRoute,
  FeatureWithWaypoint,
  IgoInstruction,
  Waypoint
} from './directions.interface';
import { createOverlayMarkerStyle } from '../../style/shared/overlay/overlay-marker-style.utils';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { tryBindStoreLayer } from '../../feature/shared/feature-store.utils';
import { FEATURE, FeatureMotion } from '../../feature/shared/feature.enums';
import { FeatureGeometry } from '../../feature/shared/feature.interfaces';
import { tryAddLoadingStrategy } from '../../feature/shared/strategies.utils';
import { FeatureStoreLoadingStrategy } from '../../feature/shared/strategies/loading';
import {
  DirectionRelativePositionType,
  DirectionType,
  OsrmStepManeuverModifier,
  OsrmStepManeuverType
} from './directions.enum';
import {
  RoutesFeatureStore,
  StepFeatureStore,
  WaypointFeatureStore,
  WaypointStore
} from './store';
import { TranslateService } from '@ngx-translate/core';
import { Position } from 'geojson';

/**
 * Function that updat the sort of the list base on the provided field.
 * @param source waypoint store
 * @param direction asc / desc sort order
 * @param field the field to use to sort the view
 */
export function updateStoreSorting(
  waypointStore: WaypointStore,
  direction: 'asc' | 'desc' = 'asc',
  field = 'position'
): void {
  waypointStore.view.sort({
    direction,
    valueAccessor: (entity: Waypoint) => entity[field]
  });
}

export function computeRelativePosition(
  index: number,
  totalLength: number
): DirectionRelativePositionType {
  let relativePosition = DirectionRelativePositionType.Intermediate;
  if (index === 0) {
    relativePosition = DirectionRelativePositionType.Start;
  } else if (index === totalLength - 1) {
    relativePosition = DirectionRelativePositionType.End;
  }
  return relativePosition;
}

export function computeWaypointsPosition(waypointStore: WaypointStore): void {
  const waypointsToComputePosition: Waypoint[] = [...waypointStore.all()];
  waypointsToComputePosition.sort((a, b) => a.position - b.position);
  waypointsToComputePosition.map((waypoint: Waypoint, waypointIndex: number) => {
    waypoint.position = waypointIndex;
    waypoint.relativePosition = computeRelativePosition(
      waypoint.position,
      waypointsToComputePosition.length
    );
  });
  if (waypointsToComputePosition) {
    waypointStore.updateMany(waypointsToComputePosition);
  }
}

/**
 * Function that add a waypoint to the waypoint store. An intermediate waypoint is always added before the last waypoint.
 * @param waypointStore waypoint store as an EntityStore
 */
export function addWaypointToStore(waypointStore: WaypointStore): Waypoint {
  const id: string = uuid();
  const waypoints: Waypoint[] = waypointStore.all();
  let positions: number[];
  if (waypointStore.count === 0) {
    positions = [0];
  } else {
    positions = waypoints.map((waypoint: Waypoint) => waypoint.position);
  }
  const maxPosition: number = Math.max(...positions);
  const insertPosition: number = maxPosition;
  const lastPosition: number = maxPosition + 1;

  const waypointToUpdate: Waypoint = waypointStore
    .all()
    .find((waypoint: Waypoint) => waypoint.position === maxPosition);
  if (waypointToUpdate) {
    waypointToUpdate.position = lastPosition;
    waypointToUpdate.relativePosition = computeRelativePosition(
      lastPosition,
      waypointStore.count + 1
    );
  }

  waypointStore.insert({
    id,
    position: insertPosition,
    relativePosition: computeRelativePosition(
      insertPosition,
      waypointStore.count + 1
    )
  });

  updateStoreSorting(waypointStore);
  return waypointStore.get(id);
}

export function removeWaypointFromStore(waypointStore: WaypointStore, waypoint: Waypoint) {
  waypointStore.delete(waypoint);
  computeWaypointsPosition(waypointStore);
}

/**
 * Create a style for the directions waypoints and routes
 * @param feature OlFeature
 * @returns OL style function
 */
export function directionsStyle(
  feature: olFeature<OlGeometry>,
): olStyle.Style | olStyle.Style[] {
  const vertexStyle: olStyle.Style[] = [
    new olStyle.Style({
      geometry: feature.getGeometry(),
      image: new olStyle.Circle({
        radius: 7,
        stroke: new olStyle.Stroke({ color: '#FF0000', width: 3 })
      })
    })
  ];

  const waypointStyle: olStyle.Style = createOverlayMarkerStyle({
    text: feature.get('waypointText'),
    opacity: feature.get('waypointOpacity'),
    markerColor: feature.get('waypointColor'),
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

  if (feature.get('type') === DirectionType.Waypoint) {
    return waypointStyle;
  }
  if (feature.get('type') === DirectionType.Vertex) {
    return vertexStyle;
  }
  if (feature.get('type') === DirectionType.Route) {
    return routeStyle;
  }
}

export function initWaypointFeatureStore(
  waypointFeatureStore: WaypointFeatureStore,
  languageService: LanguageService
) {
  const loadingStrategy: FeatureStoreLoadingStrategy = new FeatureStoreLoadingStrategy({
    motion: FeatureMotion.None
  });

  const waypointLayer: VectorLayer = new VectorLayer({
    isIgoInternalLayer: true,
    id: 'igo-direction-waypoint-layer',
    title: languageService.translate.instant(
      'igo.geo.directionsForm.waypointLayer'
    ),
    zIndex: 911,
    source: new FeatureDataSource(),
    showInLayerList: true,
    workspace: {
      enabled: false
    },
    linkedLayers: {
      linkId: 'igo-direction-waypoint-layer',
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
  tryBindStoreLayer(waypointFeatureStore, waypointLayer);
  waypointFeatureStore.layer.visible = true;
  tryAddLoadingStrategy(waypointFeatureStore, loadingStrategy);
}

export function initRoutesFeatureStore(
  routesFeatureStore: RoutesFeatureStore,
  languageService: LanguageService
) {
  const loadingStrategy: FeatureStoreLoadingStrategy = new FeatureStoreLoadingStrategy({
    motion: FeatureMotion.None
  });

  const routeLayer: VectorLayer = new VectorLayer({
    isIgoInternalLayer: true,
    id: 'igo-direction-route-layer',
    title: languageService.translate.instant(
      'igo.geo.directionsForm.routeLayer'
    ),
    zIndex: 910,
    source: new FeatureDataSource(),
    showInLayerList: true,
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
  routesFeatureStore.layer.visible = true;
  tryAddLoadingStrategy(routesFeatureStore, loadingStrategy);
}

export function initStepFeatureStore(stepFeatureStore: StepFeatureStore) {
  const loadingStrategy: FeatureStoreLoadingStrategy = new FeatureStoreLoadingStrategy({
    motion: FeatureMotion.None
  });

  const stepLayer: VectorLayer = new VectorLayer({
    isIgoInternalLayer: true,
    id: 'igo-direction-step-layer',
    title: '',
    zIndex: 910,
    source: new FeatureDataSource(),
    showInLayerList: false,
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
  tryBindStoreLayer(stepFeatureStore, stepLayer);
  stepFeatureStore.layer.visible = true;
  tryAddLoadingStrategy(stepFeatureStore, loadingStrategy);
}

export function addWaypointToWaypointFeatureStore(
  waypoint: Waypoint,
  waypointFeatureStore: WaypointFeatureStore,
  projectionCode: string,
  languageService: LanguageService
): void {
  let waypointColor: string;
  let waypointText: string;

  switch (waypoint.relativePosition) {
    case DirectionRelativePositionType.Start:
      waypointColor = '#008000';
      waypointText = languageService.translate.instant(
        'igo.geo.directionsForm.start.label'
      );
      break;
    case DirectionRelativePositionType.End:
      waypointColor = '#f64139';
      waypointText = languageService.translate.instant(
        'igo.geo.directionsForm.end.label'
      );
      break;
    default:
      waypointColor = '#ffd700';
      waypointText =
        languageService.translate.instant(
          'igo.geo.directionsForm.intermediate.label'
        ) +
        ' #' +
        waypoint.position;
      break;
  }

  const geometry: olGeom.Point = new olGeom.Point(
    olProj.transform(
      waypoint.coordinates,
      projectionCode,
      waypointFeatureStore.map.projectionCode
    )
  );

  const geojsonGeom: FeatureGeometry = new OlGeoJSON().writeGeometryObject(geometry, {
    featureProjection: waypointFeatureStore.map.projectionCode,
    dataProjection: waypointFeatureStore.map.projectionCode
  }) as FeatureGeometry;

  const previousWaypoint: FeatureWithWaypoint = waypointFeatureStore.get(waypoint.id);
  const previousWaypointRevision: number = previousWaypoint ? previousWaypoint.meta.revision : 0;

  const featureWithWaypoint: FeatureWithWaypoint = {
    type: FEATURE,
    geometry: geojsonGeom,
    projection: waypointFeatureStore.map.projectionCode,
    properties: {
      id: waypoint.id,
      type: DirectionType.Waypoint,
      waypointText,
      waypointColor,
      waypointOpacity: 1,
      waypoint
    },
    meta: {
      id: waypoint.id,
      revision: previousWaypointRevision + 1
    },
    ol: new olFeature({ geometry })
  };
  waypointFeatureStore.update(featureWithWaypoint);
}

export function addRouteToRouteFeatureStore(
  routesFeatureStore: RoutesFeatureStore,
  route: Route,
  projectionCode: string,
  active: boolean = false
): void {
  const geom: Position[] = route.geometry.coordinates;
  const geometry4326: olGeom.LineString = new olGeom.LineString(geom);
  const geometry: OlGeometry = geometry4326.transform(
    projectionCode,
    routesFeatureStore.map.projectionCode
  );

  const geojsonGeom: FeatureGeometry = new OlGeoJSON().writeGeometryObject(geometry, {
    featureProjection: routesFeatureStore.map.projectionCode,
    dataProjection: routesFeatureStore.map.projectionCode
  }) as FeatureGeometry;

  const previousRoute: FeatureWithRoute = routesFeatureStore.get(route.id);
  const previousRouteRevision: number = previousRoute ? previousRoute.meta.revision : 0;

  const routeFeatureStore: FeatureWithRoute = {
    type: FEATURE,
    geometry: geojsonGeom,
    projection: routesFeatureStore.map.projectionCode,
    properties: {
      id: route.id,
      type: DirectionType.Route,
      active,
      route: route
    },
    meta: {
      id: route.id,
      revision: previousRouteRevision + 1
    },
    ol: new olFeature({ geometry })
  };
  routesFeatureStore.update(routeFeatureStore);
}

export function formatDistance(distance: number): string {
  let formattedDistance: string = '';
  if (distance === 0) {
    return;
  }
  if (distance >= 1000) {
    formattedDistance = (NumberUtils.roundToNDecimal(distance / 1000, 1) + ' km').replace('.', ',');
  } else {
    formattedDistance = Math.round(distance) + ' m';
  }
  return formattedDistance;
}

export function formatDuration(duration: number): string {
  let formattedDuration: string = '';
  if (duration === 0) {
    return;
  }
  if (duration < 30) {
    return '0 min';
  }
  if (duration >= 3600) {
    const hours: number = Math.floor(duration / 3600);
    const minutes: number = Math.round((duration / 3600 - hours) * 60);
    if (minutes === 60) {
      formattedDuration = hours + 1 + ' h';
    } else if (minutes === 0) {
      formattedDuration = hours + ' h';
    } else {
      formattedDuration = hours + ' h ' + minutes + ' min';
    }
  } else if (duration >= 30) {
    formattedDuration = Math.round(duration / 60) + ' min';
  }
  return formattedDuration;
}

export function formatInstruction(
  type: OsrmStepManeuverType,
  modifier: OsrmStepManeuverModifier,
  route: string,
  bearing_after: number,
  stepPosition: number,
  exit: number,
  languageService: LanguageService,
  lastStep: boolean = false
): IgoInstruction {
  const translate: TranslateService = languageService.translate;
  let directive: string = '';
  let image = 'forward';
  let cssClass = 'rotate-270';
  const translatedDirection: string = translateBearing(bearing_after, translate);
  const translatedModifier: string = translateModifier(modifier, translate);
  const prefix =
    modifier === OsrmStepManeuverModifier.Straight
      ? ''
      : translate.instant('igo.geo.directions.modifier.prefix');

  let aggregatedDirection: string = prefix + translatedModifier;

  if (modifier?.search('slight') >= 0) {
    aggregatedDirection = translatedModifier;
  }

  if (modifier === OsrmStepManeuverModifier.Uturn) {
    image = 'forward';
    cssClass = 'rotate-90';
  } else if (modifier === OsrmStepManeuverModifier.SharpRight) {
    image = 'subdirectory-arrow-right';
    cssClass = 'icon-flipped';
  } else if (modifier === OsrmStepManeuverModifier.Right) {
    image = 'subdirectory-arrow-right';
    cssClass = 'icon-flipped';
  } else if (modifier === OsrmStepManeuverModifier.SlightRight) {
    image = 'forward';
    cssClass = 'rotate-290';
  } else if (modifier === OsrmStepManeuverModifier.Straight) {
    image = 'forward';
  } else if (modifier === OsrmStepManeuverModifier.SlightLeft) {
    image = 'forward';
    cssClass = 'rotate-250';
  } else if (modifier === OsrmStepManeuverModifier.Left) {
    image = 'subdirectory-arrow-left';
    cssClass = 'icon-flipped';
  } else if (modifier === OsrmStepManeuverModifier.SharpLeft) {
    image = 'subdirectory-arrow-left';
    cssClass = 'icon-flipped';
  }

  if (type === OsrmStepManeuverType.Turn) {
    if (modifier === OsrmStepManeuverModifier.Straight) {
      directive = translate.instant('igo.geo.directions.turn.straight', {
        route
      });
    } else if (modifier === OsrmStepManeuverModifier.Uturn) {
      directive = translate.instant('igo.geo.directions.turn.uturn', { route });
    } else {
      directive = translate.instant('igo.geo.directions.turn.else', {
        route,
        aggregatedDirection,
        translatedModifier
      });
    }
  } else if (type === OsrmStepManeuverType.NewName) {
    directive = translate.instant('igo.geo.directions.new name', {
      route,
      translatedDirection
    });
    image = 'compass';
    cssClass = '';
  } else if (type === OsrmStepManeuverType.Depart) {
    directive = translate.instant('igo.geo.directions.depart', {
      route,
      translatedDirection
    });
    image = 'compass';
    cssClass = '';
  } else if (type === OsrmStepManeuverType.Arrive) {
    if (lastStep) {
      const comma: string = !translatedModifier ? '' : ', ';
      aggregatedDirection = !translatedModifier ? '' : aggregatedDirection;
      directive = translate.instant('igo.geo.directions.arrive.lastStep', {
        comma,
        aggregatedDirection
      });
    } else {
      directive = translate.instant('igo.geo.directions.arrive.intermediate', {
        route
      });
      image = 'map-marker';
      cssClass = '';
    }
  } else if (type === OsrmStepManeuverType.Merge) {
    directive = translate.instant('igo.geo.directions.merge', { route });
    image = 'forward';
    cssClass = 'rotate-270';
  } else if (type === OsrmStepManeuverType.OnRamp) {
    directive = translate.instant('igo.geo.directions.on ramp', {
      aggregatedDirection
    });
  } else if (type === OsrmStepManeuverType.OffRamp) {
    directive = translate.instant('igo.geo.directions.off ramp', {
      aggregatedDirection
    });
  } else if (type === OsrmStepManeuverType.Fork) {
    if (modifier.search('left') >= 0) {
      directive = translate.instant('igo.geo.directions.fork.left', { route });
    } else if (modifier.search('right') >= 0) {
      directive = translate.instant('igo.geo.directions.fork.right', { route });
    } else {
      directive = translate.instant('igo.geo.directions.fork.else', { route });
    }
  } else if (type === OsrmStepManeuverType.EndOfRoad) {
    directive = translate.instant('igo.geo.directions.end of road', {
      translatedModifier,
      route
    });
  } else if (type === OsrmStepManeuverType.UseLane) {
    directive = translate.instant('igo.geo.directions.use lane');
  } else if (type === OsrmStepManeuverType.Continue && modifier !== OsrmStepManeuverModifier.Uturn) {
    directive = translate.instant('igo.geo.directions.continue.notUturn', {
      route
    });
    image = 'forward';
    cssClass = 'rotate-270';
  } else if (type === OsrmStepManeuverType.Roundabout) {
    const cntSuffix: string =
      exit === 1
        ? translate.instant('igo.geo.directions.cntSuffix.first')
        : translate.instant('igo.geo.directions.cntSuffix.secondAndMore');
    directive = translate.instant('igo.geo.directions.roundabout', {
      exit,
      cntSuffix,
      route
    });
    image = 'chart-donut';
    cssClass = '';
  } else if (type === OsrmStepManeuverType.Rotary) {
    directive = translate.instant('igo.geo.directions.rotary');
    image = 'chart-donut';
    cssClass = '';
  } else if (type === OsrmStepManeuverType.RoundaboutTurn) {
    directive = translate.instant('igo.geo.directions.roundabout turn');
    image = 'chart-donut';
    cssClass = '';
  } else if (type === OsrmStepManeuverType.ExitRoundabout) {
    directive = translate.instant('igo.geo.directions.exit roundabout', {
      route
    });
    image = 'forward';
    cssClass = 'rotate-270';
  } else if (type === OsrmStepManeuverType.Notification) {
    directive = translate.instant('igo.geo.directions.notification');
  } else if (modifier === OsrmStepManeuverModifier.Uturn) {
    directive = translate.instant('igo.geo.directions.uturnText', {
      translatedDirection,
      route
    });
  } else {
    directive = translate.instant('igo.geo.directions.unknown');
  }

  image = lastStep ? 'flag-variant' : image;
  cssClass = lastStep ? '' : cssClass;
  image = stepPosition === 0 ? 'compass' : image;
  cssClass = stepPosition === 0 ? '' : cssClass;

  return { instruction: directive, image, cssClass };
}

function translateModifier(modifier: OsrmStepManeuverModifier, translate: TranslateService): string {
  if (modifier === OsrmStepManeuverModifier.Uturn) {
    return translate.instant('igo.geo.directions.uturn');
  } else if (modifier === OsrmStepManeuverModifier.SharpRight) {
    return translate.instant('igo.geo.directions.sharp right');
  } else if (modifier === OsrmStepManeuverModifier.Right) {
    return translate.instant('igo.geo.directions.right');
  } else if (modifier === OsrmStepManeuverModifier.SlightRight) {
    return translate.instant('igo.geo.directions.slight right');
  } else if (modifier === OsrmStepManeuverModifier.SharpLeft) {
    return translate.instant('igo.geo.directions.sharp left');
  } else if (modifier === OsrmStepManeuverModifier.Left) {
    return translate.instant('igo.geo.directions.left');
  } else if (modifier === OsrmStepManeuverModifier.SlightLeft) {
    return translate.instant('igo.geo.directions.slight left');
  } else if (modifier === OsrmStepManeuverModifier.Straight) {
    return translate.instant('igo.geo.directions.straight');
  } else {
    return modifier;
  }
}

function translateBearing(bearing: number, translate: TranslateService): string {
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
