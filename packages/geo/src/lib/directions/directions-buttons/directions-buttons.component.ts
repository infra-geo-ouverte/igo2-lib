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

import { Coordinate } from 'ol/coordinate';

import { Subject } from 'rxjs';

import { roundCoordTo, roundCoordToString } from '../../map/shared/map.utils';
import { DirectionsService } from '../shared';
import { FeatureWithDirections, IgoStep } from '../shared/directions.interface';
import {
  formatDistance,
  formatDuration,
  formatStep
} from '../shared/directions.utils';
import {
  RoutesFeatureStore,
  StepsFeatureStore,
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
  @Input({ required: true }) contextUri: string;
  @Input({ required: true }) zoomOnActiveRoute$ = new Subject<void>();
  @Input({ required: true }) stopsStore: StopsStore;
  @Input({ required: true }) routesFeatureStore: RoutesFeatureStore;
  @Input({ required: true }) stepsFeatureStore: StepsFeatureStore;

  public downloadDirectionsBtnDisabled = false;

  constructor(
    private languageService: LanguageService,
    private messageService: MessageService,
    @Optional() private routeService: RouteService,
    private directionsService: DirectionsService
  ) {}

  /**
   * Returns the active route from the routesFeatureStore.
   *
   * @return {FeatureWithDirections | undefined} The active route, or undefined if no active route is found.
   */
  get activeRoute(): FeatureWithDirections {
    return this.routesFeatureStore
      .all()
      .find((route) => route.properties.active);
  }

  /**
   * Resets the stops in the stopsStore by clearing all the stops.
   *
   */
  resetStops(): void {
    this.stopsStore.clearStops();
  }

  /**
   * Triggers the zoom on the active route.
   *
   */
  zoomOnActiveRoute(): void {
    this.zoomOnActiveRoute$.next();
  }

  /**
   * Copies the directions to the clipboard and displays a success message if the copy is successful.
   *
   */
  copyDirectionsToClipboard(): void {
    const directions: string = this.directionsToText();
    const successful: boolean = Clipboard.copy(directions);
    if (successful) {
      this.messageService.success(
        'igo.geo.directions.buttons.message.copyDirections'
      );
    }
  }

  /**
   * Copies the link to the clipboard and displays a success message if the copy is successful.
   *
   */
  copyLinkToClipboard(): void {
    const copySuccessful: boolean = Clipboard.copy(this.getLink());
    if (copySuccessful) {
      this.messageService.success(
        'igo.geo.directions.buttons.message.copyLink'
      );
    }
  }

  /**
   * Downloads the directions.
   *
   */
  downloadDirections(): void {
    this.stepsFeatureStore.clear();
    this.downloadDirectionsBtnDisabled = true;
    this.directionsService
      .downloadDirections(
        this.routesFeatureStore.map,
        this.activeRoute.properties.directions
      )
      .subscribe(() => {
        this.downloadDirectionsBtnDisabled = false;
      });
  }

  /**
   * Generates a text representation of the directions, including summary, stops, URL, and directions.
   *
   * @return {string} The directions in text format.
   */
  private directionsToText(): string {
    const indent = '\t';
    const newLine = '\n';

    let summary: string =
      this.languageService.translate.instant(
        'igo.geo.directions.directionsText.summary'
      ) +
      ':' +
      newLine +
      indent +
      this.activeRoute.properties.directions.title;

    const distance: string = formatDistance(
      this.activeRoute.properties.directions.distance
    );
    const duration: string = formatDuration(
      this.activeRoute.properties.directions.duration
    );

    if (distance && duration) {
      summary += ' (' + distance + ' - ' + duration + ')';
    }

    summary += newLine + newLine;

    let stops: string =
      this.languageService.translate.instant(
        'igo.geo.directions.directionsText.stopList'
      ) +
      ':' +
      newLine;

    let stopNumber = 1;
    this.stopsStore.view.all().forEach((stop) => {
      let coords = '';
      let stopText = '';
      if (stop.text !== roundCoordToString(stop.coordinates, 6).join(', ')) {
        stopText = stop.text;
        coords = ` (${roundCoordToString(stop.coordinates, 6).join(', ')})`;
      } else {
        stopText = roundCoordToString(stop.coordinates, 6).join(', ');
      }

      stops =
        stops +
        indent +
        stopNumber.toLocaleString() +
        '. ' +
        stopText +
        coords +
        newLine;
      stopNumber++;
    });
    stops += newLine;

    const url: string =
      this.languageService.translate.instant(
        'igo.geo.directions.directionsText.link'
      ) +
      ':' +
      newLine +
      indent +
      this.getLink() +
      newLine +
      newLine;

    let directions: string =
      this.languageService.translate.instant('igo.geo.directions.directions') +
      ':' +
      newLine;

    this.activeRoute.properties.directions.steps.forEach(
      (step, stepIndex, steps) => {
        const distance: string = formatDistance(step.distance);
        const duration: string = formatDuration(step.duration);
        if ((distance && duration) || stepIndex === steps.length - 1) {
          const instruction: string = this.getFormattedStepInstruction(
            step,
            stepIndex
          );
          const formattedDistanceDuration: string =
            distance && duration ? ` (${distance} - ${duration}) ` : '';
          directions =
            directions +
            indent +
            '- ' +
            instruction +
            formattedDistanceDuration +
            newLine;
        }
      }
    );

    const directionsBody: string = summary + stops + url + directions;

    return directionsBody;
  }

  /**
   * Formats a step.
   *
   * @param {IgoStep} step - The step to format.
   * @param {number} stepIndex - The index of the step in the directions.
   * @return {string} The formatted instruction for the step.
   */
  private getFormattedStepInstruction(
    step: IgoStep,
    stepIndex: number
  ): string {
    return formatStep(
      step,
      this.languageService,
      stepIndex === this.activeRoute.properties.directions.steps.length - 1
    ).instruction;
  }

  /**
   * Generates a link based on the current route and stops.
   *
   * @return {string | undefined} The generated link, or undefined if the route service is not available.
   */
  private getLink(): string | undefined {
    if (!this.routeService) {
      return;
    }

    let context = '';
    if (this.contextUri) {
      context = `context=${this.contextUri}&`;
    }

    const routeIndex: number = this.routesFeatureStore
      .all()
      .map((direction) => direction.properties.id)
      .indexOf(this.activeRoute.properties.id);
    let routingOptions = '';
    if (routeIndex !== 0) {
      const routingOptionsKey: string | boolean =
        this.routeService.options.directionsOptionsKey;
      routingOptions = `&${routingOptionsKey}=result:${routeIndex}`;
    }
    const directionsKey: string | boolean =
      this.routeService.options.directionsCoordKey;
    const stopsCoordinates: Coordinate[] = this.stopsStore.view
      .all()
      .map((stop) => roundCoordTo(stop.coordinates, 6));
    let directionsUrl = '';
    if (stopsCoordinates.length >= 2) {
      directionsUrl = `${directionsKey}=${stopsCoordinates.join(';')}`;
      return `${location.origin}${location.pathname}?${context}tool=directions&sidenav=1&${directionsUrl}${routingOptions}`;
    }
    return;
  }
}
