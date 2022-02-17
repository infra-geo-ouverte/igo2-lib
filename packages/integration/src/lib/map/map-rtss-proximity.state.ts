import { Injectable } from '@angular/core';

import {
  Feature, IgoMap, MapGeolocationState,
  featureFromOl, measureOlGeometryLength, Layer, QueryableDataSourceOptions, FEATURE, MapViewState
} from '@igo2/geo';
import { BehaviorSubject, combineLatest, Subscription, timer } from 'rxjs';
import { debounceTime, skipWhile, take } from 'rxjs/operators';
import { MapState } from '../map/map.state';

import { NumberUtils } from '@igo2/utils';

import olVectorSource from 'ol/source/Vector';
import Geometry from 'ol/geom/Geometry';
import olLineString from 'ol/geom/LineString';
import * as olProj from 'ol/proj';
import { MapProximityState } from './map-proximity.state';
/**
 * Service that holds the state of the direction module
 */
@Injectable({
  providedIn: 'root'
})
export class MapRtssProximityState {

  public enabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private subs$$: Subscription[] = [];
  public currentRTSSCh$: BehaviorSubject<Feature> = new BehaviorSubject<Feature>(undefined);

  get map(): IgoMap {
    return this.mapState.map;
  }

  public rtssLayerId = 'rtssCalculCh'

  constructor(
    private mapState: MapState,
    private mapProximityState: MapProximityState) {

    this.mapState.map.ol.once('rendercomplete', () => {
      this.mapProximityState.enabled$.next(true);
      this.subscribeRTSSCH();
    });
  }


  subscribeRTSSCH() {
    this.mapProximityState.enabled$
      .pipe(skipWhile((e) => e))
      .subscribe(e => {
        if (!e) {
          this.mapProximityState.enabled$.next(true);
        }
      });

    this.subs$$.push(combineLatest([
      this.enabled$,
      this.map.geolocationController.position$.pipe(debounceTime(2500)),
      this.mapProximityState.proximitylocationType$,
      this.mapProximityState.proximityRadiusValue$,
      this.map.viewController.state$,
      timer(1000, 1000).pipe(take(20))
    ])
    .pipe(debounceTime(1500))
    .subscribe((bunch: [boolean, MapGeolocationState, string, number, MapViewState, number]) => {
        this.currentRTSSCh$.next(undefined);
        if (!bunch[0]){
          return;
        }
        const pos: MapGeolocationState = bunch[1];
        const proximitylocationType = bunch[2];
        let coord: [number, number];
        if (proximitylocationType === 'geolocation') {
          if (pos && pos.position) {
            coord = pos.position as [number, number];
          } else {
            this.currentRTSSCh$.next(undefined);
          }
        }
        if (proximitylocationType === 'mapCenter') {
          coord = this.map.viewController.getCenter();
        }
        if (coord) {
          const rtssLayer = this.map.layers.find(layer => layer.id === this.rtssLayerId && layer.visible && layer.isInResolutionsRange);
          if (rtssLayer) {
            const layerSource = rtssLayer.ol.getSource() as olVectorSource<Geometry>;
            const closestOlFeature = layerSource.getClosestFeatureToCoordinate(coord);
            if (closestOlFeature) {
              const closestOlGeom = closestOlFeature.getGeometry() as olLineString;
              const closestFeature = featureFromOl(closestOlFeature, this.map.projection);
              const geometryClosestPoint = closestOlGeom.getClosestPoint(coord);
              const linebetween = new olLineString([coord, geometryClosestPoint]);
              const lineLength = measureOlGeometryLength(linebetween, 'EPSG:3857');
              const dist = this.mapProximityState.proximityRadiusValue$.value;
              if (lineLength <= dist) {
                const chTot = closestOlFeature.getProperties().val_longr_;
                const percent = 100;
                const thousand = 1000;
                // dice the process in 1% increment;
                const smallestPercent = this.getClosestGeometryIndex(coord, closestOlGeom, 'EPSG:3857', 'EPSG:3798', 0, percent, percent);
                const lowerBoundPercent = smallestPercent.delta === 0 ? 0 : smallestPercent.delta - 1;
                const upperBoundPercent = smallestPercent.delta === 100 ? 100 : smallestPercent.delta + 1;
                const lowerBoundPerPercentInThousand = lowerBoundPercent * 10;
                const upperBoundPerPercentInThousand = upperBoundPercent * 10;
                // dice the process in 1/1000 increment based on previous bounds
                const deltaSmallestPerThousand = this.getClosestGeometryIndex(
                  coord, closestOlGeom, 'EPSG:3857', 'EPSG:3798', lowerBoundPerPercentInThousand, upperBoundPerPercentInThousand, thousand);
                const smallestPerThousand = lowerBoundPerPercentInThousand + deltaSmallestPerThousand.delta;
                // dice the process in 1/10000 increment based on previous bounds
                const lowerBoundPerThousand = smallestPerThousand === 0 ? 0 : smallestPerThousand - 1;
                const upperBoundPerThousand = smallestPerThousand === 1000 ? 1000 : smallestPerThousand + 1;
                const lowerBoundPerThousandInTenThousand = lowerBoundPerThousand * 10;
                const upperBoundPerThousandInTenThousand = upperBoundPerThousand * 10;
                const deltaSmallestPerTenThousand = this.getClosestGeometryIndex(
                  coord, closestOlGeom, 'EPSG:3857', 'EPSG:3798',
                  lowerBoundPerThousandInTenThousand, upperBoundPerThousandInTenThousand, thousand * 10);
                const smallestPerTenThousand = lowerBoundPerThousandInTenThousand + deltaSmallestPerTenThousand.delta;

                // retrieve the ch based on a ratio based on previous bounds
                const fromCh = Math.floor(chTot * (smallestPerTenThousand === 0 ? 0 : smallestPerTenThousand - 1) / (thousand * 10));
                const toCh = Math.ceil(chTot * (smallestPerTenThousand === 10000 ? 10000 : smallestPerTenThousand + 1) / (thousand * 10));

                // process the chainage calculation
                const closestDeltaChObj = this.getClosestGeometryIndex(coord, closestOlGeom, 'EPSG:3857', 'EPSG:3798', fromCh, toCh, chTot);
                const closestDeltaCh = closestDeltaChObj.delta;
                const closestChInfo = closestDeltaChObj.object as any;
                const featureId = 'rtssCh';

                this.currentRTSSCh$.next({
                  type: FEATURE,
                  geometry: {
                    type: 'Point',
                    coordinates: closestChInfo.coord
                  },
                  projection: this.map.projection,
                  properties: {...closestFeature.properties,...{
                    id: featureId,
                    element: `${this.getQueryTitle(closestFeature, rtssLayer)}+${fromCh + closestDeltaCh}`,
                    distance: NumberUtils.roundToNDecimal(closestChInfo.distance, 1),
                    chainage: fromCh + closestDeltaCh
                  }},
                  meta: {
                    id: featureId
                  }
                });
              } else {
                this.currentRTSSCh$.next(undefined);
              }
            }
          } else {
            this.currentRTSSCh$.next(undefined);
          }
        } else {
          this.currentRTSSCh$.next(undefined);
        }
      }));
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

  getClosestGeometryIndex(
    coord: [number, number],
    olGeometry: olLineString,
    srcProjection: string = 'EPSG:3857',
    destProjection: string = 'EPSG:3798',
    startCount: number = 0,
    endCount: number = 100,
    divider: number = 100): { delta: number, object: {} } {
    let fractionsInfo = [];
    let closestIdx = 0;

    let cnt = 0;
    for (let i = startCount; i >= startCount && i <= endCount; i++) {
      let effectiveDivider = i / divider;
      if (effectiveDivider < 0) {
        effectiveDivider = 0;
      }
      if (effectiveDivider > 1) {
        effectiveDivider = 1;
      }
      const fractionCoord =
        (olGeometry.clone().transform(srcProjection, destProjection) as olLineString).getCoordinateAt(effectiveDivider);
      const fractionCoordMapProj = olProj.transform(fractionCoord, destProjection, srcProjection);
      const distance = measureOlGeometryLength(new olLineString([coord, fractionCoordMapProj]), srcProjection);
      fractionsInfo.push({
        coord: fractionCoordMapProj,
        distance
      });
      if (distance < fractionsInfo[closestIdx].distance) {
        closestIdx = cnt;
      }
      cnt++;
    }
    return { delta: closestIdx, object: fractionsInfo[closestIdx] };

  }

}
