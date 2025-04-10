import { Injectable } from '@angular/core';

import { StorageService } from '@igo2/core/storage';
import {
  AnyLayer,
  FEATURE,
  Feature,
  FeatureStore,
  IgoMap,
  Layer,
  MapGeolocationState,
  QueryableDataSource,
  QueryableDataSourceOptions,
  featureFromOl,
  isLayerItem,
  measureOlGeometryLength,
  roundCoordTo
} from '@igo2/geo';
import { uuid } from '@igo2/utils';

import { Coordinate } from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from 'ol/geom/Geometry';
import olLineString from 'ol/geom/LineString';
import olLayerVector from 'ol/layer/Vector';
import * as olProj from 'ol/proj';
import olVectorSource from 'ol/source/Vector';

import { BehaviorSubject, Subscription, combineLatest, interval } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { MapState } from '../map/map.state';

/**
 * Service that holds the state of the direction module
 */
@Injectable({
  providedIn: 'root'
})
export class MapProximityState {
  private defaultProximityRadiusValue = 30;

  public enabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public proximityRadiusValue$: BehaviorSubject<number>;
  public proximitylocationType$: BehaviorSubject<string> =
    new BehaviorSubject<string>('geolocation');
  public proximityFeatureStore: FeatureStore<Feature>;
  private subs$$: Subscription[] = [];
  public currentPositionCoordinate$ = new BehaviorSubject<Coordinate>(
    undefined
  );

  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(
    private mapState: MapState,
    private storageService: StorageService
  ) {
    this.proximityFeatureStore = new FeatureStore<Feature>([], {
      map: this.mapState.map
    });

    this.proximityRadiusValue$ = new BehaviorSubject<number>(
      (this.storageService.get('mapProximityRadius') as number) ||
        this.defaultProximityRadiusValue
    );

    this.mapState.map.ol.once('rendercomplete', () => {
      this.subscribeProximityMonitor();
    });
  }

  subscribeProximityMonitor() {
    this.subs$$.push(
      combineLatest([
        this.enabled$,
        this.proximitylocationType$,
        this.proximityRadiusValue$,
        interval(5000),
        this.map.geolocationController.position$
      ])
        .pipe(debounceTime(750))
        .subscribe(
          (bunch: [boolean, string, number, number, MapGeolocationState]) => {
            this.proximityFeatureStore.clear();
            const enabled = bunch[0];
            const layers = this.map.layerController.all;
            const currentPos = this.map.geolocationController.position$.value;
            const locationType = bunch[1];
            const proximityRadiusValue = bunch[2];
            this.storageService.set(
              'mapProximityRadius',
              proximityRadiusValue || this.defaultProximityRadiusValue
            );

            if (!enabled) {
              return;
            }

            let coord: number[];
            if (locationType === 'geolocation') {
              if (!currentPos || !currentPos.position) {
                return;
              }

              coord = olProj.transform(
                currentPos.position,
                currentPos.projection,
                this.map.projection
              );
              this.map.mapCenter$.next(false);
            } else {
              coord = this.map.viewController.getCenter();
              this.map.mapCenter$.next(true);
            }

            const coordLonLat = olProj.transform(
              coord,
              this.map.projection,
              'EPSG:4269'
            );
            const roundedCoordLonLat = roundCoordTo(
              coordLonLat as [number, number],
              6
            );
            this.currentPositionCoordinate$.next(roundedCoordLonLat);

            const layersToMonitor = layers.filter(
              (layer) =>
                isLayerItem(layer) &&
                layer.ol instanceof olLayerVector &&
                (layer.dataSource as QueryableDataSource).options.queryable &&
                layer.visible &&
                layer.isInResolutionsRange
            ) as Layer[];

            layersToMonitor.map((layerToMonitor) => {
              const layerSource =
                layerToMonitor.ol.getSource() as olVectorSource;

              // Mostly for polygon features.
              const olFeaturesAtCoordinate =
                layerSource.getFeaturesAtCoordinate(coord);
              if (olFeaturesAtCoordinate && olFeaturesAtCoordinate.length) {
                olFeaturesAtCoordinate.map((olFeatureAtCoordinate) => {
                  const featureAtThisPosition = featureFromOl(
                    olFeatureAtCoordinate,
                    this.map.projection
                  );
                  const title = this.getQueryTitle(
                    featureAtThisPosition,
                    layerToMonitor
                  );
                  // todo handle imported layers without querytitle? prompt title or detect first column?
                  this.addFeatureToStore(
                    layerToMonitor,
                    coord,
                    featureAtThisPosition,
                    title,
                    0
                  );
                });
              } else {
                // compute proximity for remaining sources
                const closestOlFeature =
                  layerSource.getClosestFeatureToCoordinate(coord);
                if (closestOlFeature) {
                  const closestOlGeom = closestOlFeature.getGeometry();
                  const closestFeature = featureFromOl(
                    closestOlFeature,
                    this.map.projection
                  );
                  const geometryClosestPoint =
                    closestOlGeom.getClosestPoint(coord);
                  const linebetween = new olLineString([
                    coord,
                    geometryClosestPoint
                  ]);
                  const lineLength = measureOlGeometryLength(
                    linebetween,
                    'EPSG:3857'
                  );
                  if (lineLength <= proximityRadiusValue) {
                    const title = this.getQueryTitle(
                      closestFeature,
                      layerToMonitor
                    );
                    // todo handle imported layers without querytitle? prompt title or detect first column?
                    this.addFeatureToStore(
                      layerToMonitor,
                      coord,
                      closestFeature,
                      title,
                      lineLength
                    );
                  }
                }
              }
            });
          }
        )
    );
  }

  /**
   * Add a feature with proximity properties to the store
   * @internal
   */
  private addFeatureToStore(
    layer: Layer,
    coordFromCalculatedDistance,
    feature: Feature,
    title,
    distance
  ) {
    const featureId = uuid();
    const projection = this.map.ol.getView().getProjection();
    const olGeometry = feature.ol.getGeometry() as Geometry;
    const geometry = new GeoJSON().writeGeometryObject(olGeometry, {
      featureProjection: projection,
      dataProjection: projection
    }) as any;
    this.proximityFeatureStore.update({
      type: FEATURE,
      geometry,
      projection: projection.getCode(),
      properties: {
        ...feature.properties,
        ...{
          id: featureId,
          element: title,
          distance,
          coordFromCalculatedDistance,
          layerSrcId: layer.id,
          layerSrcTitle: layer.title
        }
      },
      meta: {
        id: featureId
      }
    });
  }

  getQueryTitle(feature: Feature, layer: AnyLayer): string | undefined {
    if (isLayerItem(layer) && layer.options?.source?.options) {
      const dataSourceOptions = layer.options.source
        .options as QueryableDataSourceOptions;
      if (dataSourceOptions.queryTitle) {
        return this.getLabelMatch(feature, dataSourceOptions.queryTitle);
      }
    }
  }

  getLabelMatch(feature: Feature, labelMatch): string {
    let label = labelMatch;
    const labelToGet = Array.from(labelMatch.matchAll(/\$\{([^\{\}]+)\}/g));

    labelToGet.forEach((v) => {
      label = label.replace(v[0], feature.properties[v[1]]);
    });

    // Nothing done? check feature's attribute
    if (labelToGet.length === 0 && label === labelMatch) {
      label = feature.properties[labelMatch] || labelMatch;
    }
    return label;
  }
}
