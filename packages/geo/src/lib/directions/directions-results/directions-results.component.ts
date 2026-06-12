import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';

import olFeature from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import OlGeoJSON from 'ol/format/GeoJSON';
import * as olGeom from 'ol/geom';

import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { FEATURE } from '../../feature/shared/feature.enums';
import { FeatureGeometry } from '../../feature/shared/feature.interfaces';
import { DirectionsType } from '../shared/directions.enum';
import {
  Directions,
  FeatureWithStep,
  FormattedStep,
  IgoStep
} from '../shared/directions.interface';
import {
  formatDistance,
  formatDuration,
  formatStep
} from '../shared/directions.utils';
import { RoutesFeatureStore, StepsFeatureStore } from '../shared/store';

@Component({
  selector: 'igo-directions-results',
  templateUrl: './directions-results.component.html',
  styleUrls: ['./directions-results.component.scss'],
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    MatDividerModule,
    MatTooltipModule,
    MatListModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class DirectionsResultsComponent implements OnInit, OnDestroy {
  private languageService = inject(LanguageService);
  private cdRef = inject(ChangeDetectorRef);

  readonly routesFeatureStore = input.required<RoutesFeatureStore>();
  readonly stepsFeatureStore = input.required<StepsFeatureStore>();

  public activeRoute?: Directions;
  public routes: Directions[] = [];
  private entities$$!: Subscription;

  ngOnInit(): void {
    this.entities$$ = this.routesFeatureStore()
      .entities$.pipe(debounceTime(200))
      .subscribe((features) => {
        const activeFeature = features.find(
          (entity) => entity.properties.active
        );
        this.routes = features.map((entity) => entity.properties.directions);
        this.activeRoute = activeFeature
          ? activeFeature.properties.directions
          : undefined;
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.entities$$.unsubscribe();
  }

  /**
   * Toggles the active state of all features in the routesFeatureStore and updates
   * the active state of their corresponding features in the layer.
   */
  chooseRouteOption(): void {
    this.routesFeatureStore().entities$.value.map(
      (feature) => (feature.properties.active = !feature.properties.active)
    );
    this.routesFeatureStore()
      .layer.ol.getSource()
      ?.getFeatures()
      .map((feature) => feature.set('active', !feature.get('active')));
  }

  /**
   * Formats the given distance in meters.
   *
   * @param {number} distance - The distance in meters to be formatted.
   * @return {string} The formatted distance string.
   */
  formatDistance(distance: number): string | undefined {
    return formatDistance(distance);
  }

  /**
   * Formats the given duration in seconds.
   *
   * @param {number} duration - The duration in seconds to be formatted.
   * @return {string} The formatted duration string.
   */
  formatDuration(duration: number): string {
    return formatDuration(duration);
  }

  /**
   * Returns a formatted string containing the distance and duration of the active route.
   *
   * @return {string} The formatted string, or an empty string if either distance or duration is undefined.
   */
  getTitleDurationAndDistance(): string {
    if (
      !this.activeRoute ||
      !this.activeRoute.distance ||
      !this.activeRoute.duration
    ) {
      return '';
    }
    const distance = this.formatDistance(this.activeRoute.distance);
    const duration = this.formatDuration(this.activeRoute.duration);
    return distance && duration ? ` (${distance} - ${duration})` : '';
  }

  /**
   * Formats a step and returns the formatted step.
   *
   * @param {IgoStep} step - The step to be formatted.
   * @param {number} stepIndex - The index of the step in the active route.
   * @return {FormattedStep} The formatted step.
   */
  getFormattedStep(step: IgoStep, stepIndex: number): FormattedStep {
    return formatStep(
      step,
      this.languageService,
      stepIndex === this.activeRoute!.steps!.length - 1
    );
  }

  /**
   * Clears the step feature store when the user's mouse leaves the list.
   */
  onLeaveList(): void {
    this.stepsFeatureStore().clear();
  }

  /**
   * Shows a step on the map and optionally zooming to the step.
   *
   * @param {IgoStep} step - The step to be shown.
   * @param {boolean} [zoomToExtent=false] - Whether to zoom to the extent of the route segment geometry.
   */
  showStep(step: IgoStep, zoomToExtent = false): void {
    this.showRouteSegmentGeometry(step, zoomToExtent);
  }

  private showRouteSegmentGeometry(step: IgoStep, zoomToExtent = false) {
    const coordinates = step.geometry?.coordinates;
    if (!coordinates) {
      return;
    }

    const stepsFeatureStore = this.stepsFeatureStore();
    const map = stepsFeatureStore.layer.map;
    const vertexId = 'vertex';
    const geometry4326: olGeom.LineString = new olGeom.LineString(coordinates);
    const geometryMapProjection: olGeom.Geometry = geometry4326.transform(
      'EPSG:4326',
      map?.projectionCode
    );
    const routeSegmentCoordinates: Coordinate[] = (
      geometryMapProjection as any
    ).getCoordinates();
    const lastPointCoordinates: Coordinate = routeSegmentCoordinates[0];

    const lastPointGeometry: olGeom.Point = new olGeom.Point(
      lastPointCoordinates
    );
    const lastPointFeature: olFeature<olGeom.Point> =
      new olFeature<olGeom.Point>({
        geometry: lastPointGeometry
      });

    const projection = map?.projectionCode;
    const geojsonGeom: FeatureGeometry = new OlGeoJSON().writeGeometryObject(
      lastPointGeometry,
      {
        featureProjection: projection,
        dataProjection: projection
      }
    ) as FeatureGeometry;

    const previousVertex = stepsFeatureStore.get(vertexId);
    const previousVertexRevision: number = previousVertex
      ? (previousVertex.meta?.revision ?? 0)
      : 0;

    const stepFeature: FeatureWithStep = {
      type: FEATURE,
      geometry: geojsonGeom,
      projection,
      properties: {
        id: vertexId,
        step,
        type: DirectionsType.Vertex
      },
      meta: {
        id: vertexId,
        revision: previousVertexRevision + 1
      },
      ol: lastPointFeature
    };
    stepsFeatureStore.update(stepFeature);
    if (zoomToExtent) {
      map?.viewController.zoomToExtent(
        lastPointFeature.getGeometry()!.getExtent() as [
          number,
          number,
          number,
          number
        ]
      );
    }
  }
}
