import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { RouteService } from '@igo2/core/route';
import { Clipboard } from '@igo2/utils';

import { BehaviorSubject, Subject } from 'rxjs';

import { roundCoordTo } from '../../map/shared/map.utils';
import { DirectionsService } from '../shared';
import { FeatureWithDirection } from '../shared/directions.interface';
import {
  addStopToStore,
  formatDistance,
  formatDuration,
  formatInstruction
} from '../shared/directions.utils';
import {
  RoutesFeatureStore,
  StepFeatureStore,
  StopsStore
} from '../shared/store';

@Component({
  selector: 'igo-directions-buttons',
  templateUrl: './directions-buttons.component.html',
  styleUrls: ['./directions-buttons.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    NgIf,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class DirectionsButtonsComponent {
  get activeRoute() {
    return this.routesFeatureStore
      .all()
      .find((route) => route.properties.active);
  }
  @Input() contextUri: string;
  @Input() zoomToActiveRoute$ = new Subject<void>();
  @Input() stopsStore: StopsStore;
  @Input() routesFeatureStore: RoutesFeatureStore;
  @Input() stepFeatureStore: StepFeatureStore;

  public disabled$ = new BehaviorSubject(false);

  constructor(
    private languageService: LanguageService,
    private messageService: MessageService,
    @Optional() private route: RouteService,
    private directionsService: DirectionsService
  ) {}

  resetStops() {
    this.stopsStore.clearStops();
  }

  // stop are always added before the last stop.
  addStop(): void {
    addStopToStore(this.stopsStore);
  }

  copyLinkToClipboard() {
    const successful = Clipboard.copy(this.getUrl());
    if (successful) {
      this.messageService.success(
        'igo.geo.directionsForm.dialog.copyMsgLink',
        'igo.geo.directionsForm.dialog.copyTitle'
      );
    }
  }

  zoomRoute() {
    this.zoomToActiveRoute$.next();
  }

  copyDirectionsToClipboard() {
    const directionsBody = this.directionsToText();
    const successful = Clipboard.copy(directionsBody);
    if (successful) {
      this.messageService.success(
        'igo.geo.directionsForm.dialog.copyMsg',
        'igo.geo.directionsForm.dialog.copyTitle'
      );
    }
  }

  private directionsToText() {
    const indent = '\t';
    let activeRouteDirective =
      this.languageService.translate.instant(
        'igo.geo.directionsForm.instructions'
      ) + ':\n';
    let wayPointList = '';
    const summary =
      this.languageService.translate.instant('igo.geo.directionsForm.summary') +
      ': \n' +
      indent +
      this.activeRoute.properties.direction.title +
      '\n' +
      indent +
      formatDistance(this.activeRoute.properties.direction.distance) +
      '\n' +
      indent +
      formatDuration(this.activeRoute.properties.direction.duration) +
      '\n\n' +
      this.languageService.translate.instant(
        'igo.geo.directionsForm.stopsList'
      ) +
      ':\n';

    const url =
      this.languageService.translate.instant('igo.geo.directionsForm.link') +
      ':\n' +
      indent +
      this.getUrl();

    let wayPointsCnt = 1;
    this.stopsStore.view.all().forEach((stop) => {
      let coord = '';
      let stopText = '';
      if (stop.text !== roundCoordTo(stop.coordinates).join(',')) {
        stopText = stop.text;
        coord = ` ( ${roundCoordTo(stop.coordinates).join(',')} )`;
      } else {
        stopText = roundCoordTo(stop.coordinates).join(',');
      }

      wayPointList =
        wayPointList +
        indent +
        wayPointsCnt.toLocaleString() +
        '. ' +
        stopText +
        coord +
        '\n';
      wayPointsCnt++;
    });

    let localCnt = 0;
    this.activeRoute.properties.direction.steps.forEach((step) => {
      const instruction = this.formatStep(step, localCnt).instruction;
      const distance =
        formatDistance(step.distance) === undefined
          ? ''
          : ' (' + formatDistance(step.distance) + ')';
      activeRouteDirective =
        activeRouteDirective +
        indent +
        (localCnt + 1).toLocaleString() +
        '. ' +
        instruction +
        distance +
        '\n';
      localCnt++;
    });

    const directionsBody =
      summary + wayPointList + '\n' + url + '\n\n' + activeRouteDirective;

    return directionsBody;
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
      cnt === this.activeRoute.properties.direction.steps.length - 1
    );
  }

  private getUrl() {
    if (!this.route) {
      return;
    }
    let context = '';
    if (this.contextUri) {
      context = `context=${this.contextUri}&`;
    }

    const pos = this.routesFeatureStore
      .all()
      .map((direction: FeatureWithDirection) => direction.properties.id)
      .indexOf(this.activeRoute.properties.id);
    let routingOptions = '';
    if (pos !== 0) {
      const routingOptionsKey = this.route.options.directionsOptionsKey;
      routingOptions = `&${routingOptionsKey}=result:${pos}`;
    }
    const directionsKey = this.route.options.directionsCoordKey;
    const stopsCoordinates = this.stopsStore.view
      .all()
      .map((stop) => roundCoordTo(stop.coordinates, 6));
    let directionsUrl = '';
    if (stopsCoordinates.length >= 2) {
      directionsUrl = `${directionsKey}=${stopsCoordinates.join(';')}`;
      return `${location.origin}${location.pathname}?${context}tool=directions&sidenav=1&${directionsUrl}${routingOptions}`;
    }
    return;
  }

  printDirections() {
    this.stepFeatureStore.clear();
    this.disabled$.next(true);
    this.directionsService
      .downloadDirection(
        this.routesFeatureStore.map,
        this.activeRoute.properties.direction
      )
      .subscribe(() => {
        this.disabled$.next(false);
      });
  }
}
