import { Component, Input, Optional } from '@angular/core';
import { LanguageService, MessageService, RouteService } from '@igo2/core';
import { Clipboard } from '@igo2/utils';
import { Subject } from 'rxjs';

import { addStopToStore, formatDistance, formatDuration, formatInstruction } from '../shared/directions.utils';
import { RoutesFeatureStore, StopsStore } from '../shared/store';

@Component({
  selector: 'igo-directions-buttons',
  templateUrl: './directions-buttons.component.html',
  styleUrls: ['./directions-buttons.component.scss']
})
export class DirectionsButtonsComponent {

  get activeRoute() {
    return this.routesFeatureStore.all().find(route => route.properties.active);
  }

  @Input() zoomToActiveRoute$: Subject<void> = new Subject();
  @Input() stopsStore: StopsStore;
  @Input() routesFeatureStore: RoutesFeatureStore;
  constructor(
    private languageService: LanguageService,
    private messageService: MessageService,
    @Optional() private route: RouteService) { }

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
      const translate = this.languageService.translate;
      const title = translate.instant(
        'igo.geo.directionsForm.dialog.copyTitle'
      );
      const msg = translate.instant(
        'igo.geo.directionsForm.dialog.copyMsgLink'
      );
      this.messageService.success(msg, title);
    }
  }

  zoomRoute() {
    this.zoomToActiveRoute$.next();
  }

  copyDirectionsToClipboard() {
    const directionsBody = this.directionsToText();
    const successful = Clipboard.copy(directionsBody);
    if (successful) {
      const translate = this.languageService.translate;
      const title = translate.instant(
        'igo.geo.directionsForm.dialog.copyTitle'
      );
      const msg = translate.instant('igo.geo.directionsForm.dialog.copyMsg');
      this.messageService.success(msg, title);
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
    this.stopsStore.view.all().forEach(stop => {
      let coord = '';
      let stopText = '';
      if (stop.text !== stop.coordinates.join(',')) {
        stopText = stop.text;
        coord = ` ( ${stop.coordinates.join(',')} )`;
      } else {
        stopText = stop.coordinates.join(
          ','
        );
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

    // Directions
    let localCnt = 0;
    this.activeRoute.properties.direction.steps.forEach(step => {
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
    const directionsKey = this.route.options.directionsCoordKey;
    const stopsCoordinates = this.stopsStore.view.all().map(stop => stop.coordinates);
    let directionsUrl = '';
    if (stopsCoordinates.length >= 2) {
      directionsUrl = `${directionsKey}=${stopsCoordinates.join(';')}`;
      return `${location.origin}${location.pathname}?tool=directions&sidenav=1&${directionsUrl}`;
    }
    return;
  }
}
