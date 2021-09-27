import olFeature from 'ol/Feature';
import * as olstyle from 'ol/style';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { EntityStore } from '@igo2/common';
import { uuid } from '@igo2/utils';

import { FeatureWithStop, Stop } from './directions.interface';
import { createOverlayMarkerStyle } from '../../overlay/shared/overlay-marker-style.utils';
import { FeatureStore } from '../../feature/shared/store';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { tryBindStoreLayer } from '../../feature/shared/feature.utils';
import { tryAddLoadingStrategy } from '../../feature/shared/strategies.utils';
import { FeatureStoreLoadingStrategy } from '../../feature/shared/strategies/loading';
import { FeatureMotion } from '../../feature/shared/feature.enums';
import { LanguageService } from '@igo2/core';

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
): olstyle.Style | olstyle.Style[] {
  const vertexStyle = [
    new olstyle.Style({
      geometry: feature.getGeometry(),
      image: new olstyle.Circle({
        radius: 7,
        stroke: new olstyle.Stroke({ color: '#FF0000', width: 3 })
      })
    })
  ];

  const stopStyle = createOverlayMarkerStyle({
    text: feature.get('stopText'),
    opacity: feature.get('stopOpacity'),
    markerColor: feature.get('stopColor'),
    markerOutlineColor: [255, 255, 255]});

  const routeStyle = [
    new olstyle.Style({
      stroke: new olstyle.Stroke({ color: 'rgba(106, 121, 130, 0.75)', width: 10 })
    }),
    new olstyle.Style({
      stroke: new olstyle.Stroke({ color: 'rgba(79, 169, 221, 0.75)', width: 6 })
    })
  ];

  if (feature.get('type') === 'stop') {
    return stopStyle;
  }
  if (feature.get('type') === 'vertex') {
    return vertexStyle;
  }
  if (feature.get('type') === 'route') {
    return routeStyle;
  }
}

export function initStopsFeatureStore(stopsFeatureStore: FeatureStore<FeatureWithStop>,languageService: LanguageService) {
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

export function initRouteFeatureStore(routeFeatureStore: FeatureStore<FeatureWithStop>,languageService: LanguageService) {
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
  tryBindStoreLayer(routeFeatureStore, routeLayer);
  routeFeatureStore.layer.visible = true;
  tryAddLoadingStrategy(routeFeatureStore, loadingStrategy);

}

