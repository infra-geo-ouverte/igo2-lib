import { Component, Input, Optional } from '@angular/core';

import { LanguageService, MessageService, RouteService } from '@igo2/core';
import { Clipboard } from '@igo2/utils';

import { BehaviorSubject, Subject } from 'rxjs';

import { roundCoordTo } from '../../map/shared/map.utils';
import { FeatureWithRoute, IgoStep, Waypoint } from '../shared/directions.interface';

import {
  formatDistance,
  formatDuration,
  formatInstruction
} from '../shared/directions.utils';
import {
  RoutesFeatureStore,
  StepFeatureStore,
  WaypointStore
} from '../shared/store';
import { DirectionsService } from '../shared';
import { Position } from 'geojson';

@Component({
  selector: 'igo-directions-buttons',
  templateUrl: './directions-buttons.component.html',
  styleUrls: ['./directions-buttons.component.scss']
})
export class DirectionsButtonsComponent {
  get activeRoute() {
    return this.routesFeatureStore
      .all()
      .find((route: FeatureWithRoute) => route.properties.active);
  }
  @Input() contextUri: string;
  @Input() zoomToActiveRoute$: Subject<void> = new Subject();
  @Input() waypointStore: WaypointStore;
  @Input() routesFeatureStore: RoutesFeatureStore;
  @Input() stepFeatureStore: StepFeatureStore;

  public disabled$ = new BehaviorSubject(false);

  constructor(
    private languageService: LanguageService,
    private messageService: MessageService,
    @Optional() private route: RouteService,
    private directionsService: DirectionsService
  ) {}

  copyLinkToClipboard(): void {
    const copySuccessful: boolean = Clipboard.copy(this._getUrl());
    if (copySuccessful) {
      this.messageService.success(
        'igo.geo.directionsForm.dialog.copyMsgLink',
        'igo.geo.directionsForm.dialog.copyTitle'
      );
    }
  }

  zoomRoute(): void {
    this.zoomToActiveRoute$.next();
  }

  copyDirectionsToClipboard(): void {
    const directions: string = this._directionsToText();
    const copySuccessful: boolean = Clipboard.copy(directions);
    if (copySuccessful) {
      this.messageService.success(
        'igo.geo.directionsForm.dialog.copyMsg',
        'igo.geo.directionsForm.dialog.copyTitle'
      );
    }
  }

  private _directionsToText(): string {
    const indent: string = '\t';
    const newLine: string = '\n';

    const summary: string =
      this.languageService.translate.instant('igo.geo.directionsForm.summary') +
      ':' + newLine +
      indent +
      this.activeRoute.properties.route.title +
      newLine +
      indent +
      formatDistance(this.activeRoute.properties.route.distance) +
      newLine +
      indent +
      formatDuration(this.activeRoute.properties.route.duration) +
      newLine + newLine +
      this.languageService.translate.instant(
        'igo.geo.directionsForm.waypointList'
      ) +
      ':' + newLine;

    const url: string =
      this.languageService.translate.instant('igo.geo.directionsForm.link') +
      ':' + newLine +
      indent +
      this._getUrl();

    let waypointList: string = '';

    this.waypointStore.view.all().forEach((waypoint: Waypoint, waypointIndex: number) => {
      let waypointCoords: string = '';
      let waypointText: string = '';
      if (waypoint.text !== roundCoordTo(waypoint.coordinates).join(',')) {
        waypointText = waypoint.text;
        waypointCoords = ` (${roundCoordTo(waypoint.coordinates).join(',')})`;
      } else {
        waypointText = roundCoordTo(waypoint.coordinates).join(',');
      }
      waypointList =
        waypointList +
        indent + (waypointIndex + 1) + '. ' + waypointText + waypointCoords + newLine;
    });

    let activeRouteDirections: string =
      this.languageService.translate.instant(
        'igo.geo.directionsForm.instructions'
      ) + ':' + newLine;
    this.activeRoute.properties.route.steps.forEach((step: IgoStep, stepIndex: number) => {
      const stepInstruction: string = this._formatStep(step, stepIndex + 1).instruction;
      const stepDistance =
        formatDistance(step.distance) === undefined
          ? ''
          : ' (' + formatDistance(step.distance) + ')';
      activeRouteDirections =
        activeRouteDirections +
        indent + (stepIndex + 1) + '. ' + stepInstruction + stepDistance + newLine;
    });

    const directionsBody: string =
      summary + waypointList + newLine + url + newLine + newLine + activeRouteDirections;

    return directionsBody;
  }

  private _formatStep(step: IgoStep, stepNumber: number) {
    return formatInstruction(
      step.maneuver.type,
      step.maneuver.modifier,
      step.name,
      step.maneuver.bearing_after,
      stepNumber,
      step.maneuver.exit,
      this.languageService,
      stepNumber === this.activeRoute.properties.route.steps.length
    );
  }

  private _getUrl(): string {
    if (!this.route) {
      return;
    }
    let context: string = '';
    if (this.contextUri) {
      context = `context=${this.contextUri}&`;
    }

    const pos: number = this.routesFeatureStore
      .all()
      .map((route: FeatureWithRoute) => route.properties.id)
      .indexOf(this.activeRoute.properties.id);
    let routingOptions: string = '';
    if (pos !== 0) {
      const routingOptionsKey: string | boolean = this.route.options.directionsOptionsKey;
      routingOptions = `&${routingOptionsKey}=result:${pos}`;
    }
    const directionsKey: string | boolean = this.route.options.directionsCoordKey;
    const waypointsCoordinates: Position[] = this.waypointStore.view
      .all()
      .map((waypoint: Waypoint) => roundCoordTo(waypoint.coordinates, 6));
    let directionsUrl: string = '';
    if (waypointsCoordinates.length >= 2) {
      directionsUrl = `${directionsKey}=${waypointsCoordinates.join(';')}`;
      return `${location.origin}${location.pathname}?${context}tool=directions&sidenav=1&${directionsUrl}${routingOptions}`;
    }
    return;
  }

  printDirections(): void {
    this.stepFeatureStore.clear();
    this.disabled$.next(true);
    this.directionsService
      .downloadDirections(
        this.routesFeatureStore.map,
        this.activeRoute.properties.route
      )
      .subscribe(() => {
        this.disabled$.next(false);
      });
  }
}
