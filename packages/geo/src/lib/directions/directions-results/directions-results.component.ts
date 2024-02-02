import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import { LanguageService } from '@igo2/core';

import olFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';
import * as olGeom from 'ol/geom';

import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { FEATURE } from '../../feature/shared/feature.enums';
import { FeatureGeometry } from '../../feature/shared/feature.interfaces';
import { DirectionType } from '../shared/directions.enum';
import {
  Direction,
  FeatureWithStep,
  IgoStep
} from '../shared/directions.interface';
import {
  formatDistance,
  formatDuration,
  formatInstruction
} from '../shared/directions.utils';
import { RoutesFeatureStore, StepFeatureStore } from '../shared/store';

@Component({
  selector: 'igo-directions-results',
  templateUrl: './directions-results.component.html',
  styleUrls: ['./directions-results.component.scss']
})
export class DirectionsResultsComponent implements OnInit, OnDestroy {
  public activeDirection: Direction;
  public directions: Direction[];

  private entities$$: Subscription;

  @Input() routesFeatureStore: RoutesFeatureStore;
  @Input() stepFeatureStore: StepFeatureStore;

  constructor(
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.entities$$ = this.routesFeatureStore.entities$
      .pipe(debounceTime(200))
      .subscribe((entities) => {
        const activeFeatureWithDirection = entities.find(
          (entity) => entity.properties.active
        );
        this.directions = entities.map((entity) => entity.properties.direction);
        if (activeFeatureWithDirection) {
          this.activeDirection =
            activeFeatureWithDirection.properties.direction;
        } else {
          this.activeDirection = undefined;
        }
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.entities$$.unsubscribe();
  }

  changeRoute() {
    this.routesFeatureStore.entities$.value.map(
      (entity) => (entity.properties.active = !entity.properties.active)
    );
    this.routesFeatureStore.layer.ol
      .getSource()
      .getFeatures()
      .map((feature) => feature.set('active', !feature.get('active')));
  }

  formatDistance(distance: number): string {
    return formatDistance(distance);
  }

  formatDuration(duration: number): string {
    return formatDuration(duration);
  }

  formatStep(step, cnt) {
    return formatInstruction(
      step.maneuver.type,
      step.maneuver.modifier,
      step.name,
      step.maneuver.bearing_after,
      cnt,
      step.maneuver.exit,
      this.languageService,
      cnt === this.activeDirection.steps.length - 1
    );
  }

  onStepsListBlur() {
    this.stepFeatureStore.clear();
  }

  showSegment(step: IgoStep, zoomToExtent = false) {
    this.showRouteSegmentGeometry(step, zoomToExtent);
  }

  showRouteSegmentGeometry(step: IgoStep, zoomToExtent = false) {
    const coordinates = step.geometry.coordinates;
    const vertexId = 'vertex';
    const geometry4326 = new olGeom.LineString(coordinates);
    const geometryMapProjection = geometry4326.transform(
      'EPSG:4326',
      this.stepFeatureStore.layer.map.projection
    );
    const routeSegmentCoordinates = (
      geometryMapProjection as any
    ).getCoordinates();
    const lastPoint = routeSegmentCoordinates[0];

    const geometry = new olGeom.Point(lastPoint);
    const feature = new olFeature({ geometry });

    const geojsonGeom = new OlGeoJSON().writeGeometryObject(geometry, {
      featureProjection: this.stepFeatureStore.layer.map.projection,
      dataProjection: this.stepFeatureStore.layer.map.projection
    }) as FeatureGeometry;

    const previousVertex = this.stepFeatureStore.get(vertexId);
    const previousVertexRevision = previousVertex
      ? previousVertex.meta.revision
      : 0;

    const stepFeature: FeatureWithStep = {
      type: FEATURE,
      geometry: geojsonGeom,
      projection: this.stepFeatureStore.layer.map.projection,
      properties: {
        id: vertexId,
        step,
        type: DirectionType.Vertex
      },
      meta: {
        id: vertexId,
        revision: previousVertexRevision + 1
      },
      ol: feature
    };
    this.stepFeatureStore.update(stepFeature);
    if (zoomToExtent) {
      this.stepFeatureStore.layer.map.geolocationController.temporaryDisablePollowPosition =
        true;
      this.stepFeatureStore.layer.map.viewController.zoomToExtent(
        feature.getGeometry().getExtent() as [number, number, number, number]
      );
    }
  }
}
