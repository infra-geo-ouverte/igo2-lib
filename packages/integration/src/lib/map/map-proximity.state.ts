import { Injectable } from '@angular/core';

import {
  FeatureStore, Feature, IgoMap,
  featureFromOl, measureOlGeometryLength, Layer, QueryableDataSourceOptions, FEATURE, roundCoordTo, QueryableDataSource, MapGeolocationState
} from '@igo2/geo';
import { BehaviorSubject, combineLatest, interval, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MapState } from '../map/map.state';

import GeoJSON from 'ol/format/GeoJSON';
import { uuid } from '@igo2/utils';

import olLayerVector from 'ol/layer/Vector';
import olVectorSource from 'ol/source/Vector';
import Geometry from 'ol/geom/Geometry';
import olLineString from 'ol/geom/LineString';
import * as olProj from 'ol/proj';
import { StorageService } from '@igo2/core';
/**
 * Service that holds the state of the direction module
 */
@Injectable({
  providedIn: 'root'
})
export class MapProximityState {

  private defaultProximityRadiusValue: number = 30;

  public enabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public proximityRadiusValue$: BehaviorSubject<number>;
  public proximitylocationType$: BehaviorSubject<string> = new BehaviorSubject<string>('geolocation');
  public proximityFeatureStore: FeatureStore<Feature>;
  private subs$$: Subscription[] = [];
  public currentPositionCoordinate$: BehaviorSubject<[number, number]> = new BehaviorSubject(undefined);

  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(
    private mapState: MapState,
    private storageService: StorageService
  ) {
    this.proximityFeatureStore = new FeatureStore<Feature>([], { map: this.mapState.map });

    this.proximityRadiusValue$ = new BehaviorSubject<number>(
      this.storageService.get('mapProximityRadius') as number || this.defaultProximityRadiusValue);

    this.mapState.map.ol.once('rendercomplete', () => {
      this.subscribeProximityMonitor();
    });
  }


  subscribeProximityMonitor() {
    this.subs$$.push(combineLatest([
      this.enabled$,
      this.proximitylocationType$,
      this.proximityRadiusValue$,
      interval(5000),
      this.map.geolocationController.position$
    ])
      .pipe(debounceTime(750))
      .subscribe((bunch: [boolean, string, number, number, MapGeolocationState]) => {
        this.proximityFeatureStore.clear();
        const enabled = bunch[0];
        const layers = this.map.layers;
        const currentPos = this.map.geolocationController.position$.value;
        const locationType = bunch[1];
        const proximityRadiusValue = bunch[2];
        this.storageService.set('mapProximityRadius', proximityRadiusValue || this.defaultProximityRadiusValue);

        if (!enabled) {
          return;
        }


        let coord: number[];
        if (locationType === 'geolocation') {
          if (!currentPos || !currentPos.position) {
            return;
          }

          coord = olProj.transform(currentPos.position, currentPos.projection, this.map.projection);
          this.map.mapCenter$.next(false);
        } else {
          coord = this.map.viewController.getCenter();;
          this.map.mapCenter$.next(true);
        }

        const coordLonLat = olProj.transform(coord, this.map.projection, 'EPSG:4269');
        const roundedCoordLonLat = roundCoordTo(coordLonLat as [number, number], 6);
        this.currentPositionCoordinate$.next(roundedCoordLonLat);

        const layersToMonitor = layers
          .filter(layer =>
            layer.ol instanceof olLayerVector &&
            (layer.dataSource as QueryableDataSource).options.queryable &&
            layer.visible &&
            layer.isInResolutionsRange);

        layersToMonitor.map(layerToMonitor => {
          const layerSource = layerToMonitor.ol.getSource() as olVectorSource<Geometry>;

          // Mostly for polygon features.
          const olFeaturesAtCoordinate = layerSource.getFeaturesAtCoordinate(coord);
          if (olFeaturesAtCoordinate && olFeaturesAtCoordinate.length) {
            olFeaturesAtCoordinate.map(olFeatureAtCoordinate => {
              const featureAtThisPosition = featureFromOl(olFeatureAtCoordinate, this.map.projection);
              let title = this.getQueryTitle(featureAtThisPosition, layerToMonitor);
              // todo handle imported layers without querytitle? prompt title or detect first column?
              this.addFeatureToStore(layerToMonitor, coord, featureAtThisPosition, title, 0);
            });
          } else {
            // compute proximity for remaining sources
            const closestOlFeature = layerSource.getClosestFeatureToCoordinate(coord);
            if (closestOlFeature) {
              const closestOlGeom = closestOlFeature.getGeometry();
              const closestFeature = featureFromOl(closestOlFeature, this.map.projection);
              const geometryClosestPoint = closestOlGeom.getClosestPoint(coord);
              const linebetween = new olLineString([coord, geometryClosestPoint]);
              const lineLength = measureOlGeometryLength(linebetween, 'EPSG:3857');
              if (lineLength <= proximityRadiusValue) {
                let title = this.getQueryTitle(closestFeature, layerToMonitor);
                // todo handle imported layers without querytitle? prompt title or detect first column?
                this.addFeatureToStore(layerToMonitor, coord, closestFeature, title, lineLength);
              }
            }
          }
        });

      }));
  }

    /**
   * Add a feature with proximity properties to the store
   * @internal
   */
     private addFeatureToStore(layer: Layer, coordFromCalculatedDistance, feature: Feature, title, distance) {
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
        properties: {...feature.properties,...{
          id: featureId,
          element: title,
          distance,
          coordFromCalculatedDistance,
          layerSrcId: layer.id,
          layerSrcTitle: layer.title
        }},
        meta: {
          id: featureId
        }
      });
    }

  getQueryTitle(feature: Feature, layer: Layer): string {
    let title;
    if (layer.options?.source?.options) {
      const dataSourceOptions = layer.options.source
        .options as QueryableDataSourceOptions;
      if (dataSourceOptions.queryTitle) {
        title = this.getLabelMatch(feature, dataSourceOptions.queryTitle);
      }
    }
    return title;
  }

  getLabelMatch(feature: Feature, labelMatch): string {
    let label = labelMatch;
    const labelToGet = Array.from(labelMatch.matchAll(/\$\{([^\{\}]+)\}/g));

    labelToGet.forEach(v => {
      label = label.replace(v[0], feature.properties[v[1]]);
    });

    // Nothing done? check feature's attribute
    if (labelToGet.length === 0 && label === labelMatch) {
      label = feature.properties[labelMatch] || labelMatch;
    }
    return label;
  }
}
