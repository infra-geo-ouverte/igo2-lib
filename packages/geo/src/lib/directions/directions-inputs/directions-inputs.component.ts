import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteModule
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';

import * as olObservable from 'ol/Observable';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import * as olProj from 'ol/proj';

import pointOnFeature from '@turf/point-on-feature';
import { Position } from 'geojson';

import {
  Feature,
  FeatureGeometry
} from '../../feature/shared/feature.interfaces';
import { roundCoordTo, roundCoordToString } from '../../map/shared/map.utils';
import { Stop } from '../shared/directions.interface';
import {
  addStopToStore,
  computeRelativePosition,
  removeStopFromStore,
  updateStoreSorting
} from '../shared/directions.utils';
import { StopsFeatureStore, StopsStore } from '../shared/store';
import { DirectionRelativePositionType } from './../shared/directions.enum';

@Component({
    selector: 'igo-directions-inputs',
    templateUrl: './directions-inputs.component.html',
    styleUrls: ['./directions-inputs.component.scss'],
    imports: [
        CdkDropList,
        NgFor,
        CdkDrag,
        NgClass,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatAutocompleteModule,
        MatTooltipModule,
        NgIf,
        MatButtonModule,
        MatIconModule,
        MatOptionModule,
        CdkDragHandle,
        AsyncPipe,
        IgoLanguageModule
    ]
})
export class DirectionsInputsComponent implements OnDestroy {
  @Input({ required: true }) stopsStore: StopsStore;
  @Input({ required: true }) stopsFeatureStore: StopsFeatureStore;
  @Input({ required: true }) projection: string;
  @Input() coordRoundedDecimals = 6;
  @Input() debounce = 200;
  @Input() length = 2;
  @Output() stopInputHasFocus: EventEmitter<boolean> =
    new EventEmitter<boolean>(false);

  private readonly invalidKeys: string[] = ['Control', 'Shift', 'Alt'];
  private onMapClickEventKeys = [];
  public stopWithHover: Stop;
  public stopIsDragged = false;

  constructor(private languageService: LanguageService) {}

  /**
   * Returns the position property of the geolocationController.
   *
   * @return {BehaviorSubject<boolean> | undefined} The position property of
   * the geolocationController.
   */
  get currentPosition(): boolean {
    return (
      this.stopsFeatureStore?.map?.geolocationController?.position$?.value
        ?.position &&
      this.stopsFeatureStore?.map?.geolocationController?.tracking
    );
  }

  ngOnDestroy(): void {
    this.unlistenMapSingleClick();
  }
  /**
   * Sets the stop with hover to the given stop.
   *
   * @param {Stop} stop - The stop to set as the stop with hover.
   */
  onStopEnter(stop: Stop): void {
    this.stopWithHover = stop;
  }
  /**
   * Sets the stop with hover to undefined.
   *
   */
  onStopLeave(): void {
    this.stopWithHover = undefined;
  }

  /**
   * Adds a stop to the stops store.
   *
   */
  addStop(): void {
    addStopToStore(this.stopsStore);
  }

  /**
   * Returns the title of the option if it is an object and has a meta property with a title,
   * otherwise returns the option itself.
   *
   * @param {any} option - The option to get the text from.
   * @return {string} The title of the option if it is an object and has a meta property with a title,
   * otherwise returns the option itself.
   */
  getOptionText(option: any): string {
    if (option instanceof Object) {
      const { meta } = option;
      return meta?.title || '';
    }
    return option;
  }

  /**
   * Chooses an option from a MatAutocomplete and updates the stop coordinates and text
   * based on the selected feature.
   *
   * @param {Object} event - The event object containing the MatAutocomplete and MatOption.
   * @param {MatAutocomplete} event.source - The MatAutocomplete component.
   * @param {MatOption} event.option - The selected MatOption.
   * @param {Stop} stop - The stop object to update.
   */
  chooseOption(
    event: { source: MatAutocomplete; option: MatOption },
    stop: Stop
  ): void {
    const feature: Feature = event.option.value;
    if (feature) {
      let coords: Coordinate;
      const geometry: FeatureGeometry = feature.geometry;
      if (geometry.type === 'Point') {
        coords = geometry.coordinates as Position;
      } else {
        const point = pointOnFeature(feature.geometry);
        coords = [point.geometry.coordinates[0], point.geometry.coordinates[1]];
      }
      if (coords) {
        stop.coordinates = coords;
        stop.text = feature.meta.title;
        this.stopsStore.update(stop);
      }
    }
  }

  /**
   * Sets the text of a stop based on the value of an input field.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered by the input field.
   * @param {Stop} stop - The stop object to update.
   */
  setStopText(event: KeyboardEvent, stop: Stop): void {
    this.unlistenMapSingleClick();
    const searchTerm: string = (event.target as HTMLInputElement).value;
    if (searchTerm.length === 0) {
      this.clearStopInput(stop);
    } else if (this.validateSearchTerm(searchTerm)) {
      stop.text = searchTerm;
      this.stopsStore.update(stop);
    }
  }

  /**
   * Validates a search term by checking if it contains any invalid characters and if its length is valid.
   *
   * @param {string} searchTerm - The search term to be validated.
   * @return {boolean} Returns true if the search term is valid, false otherwise.
   */
  private validateSearchTerm(searchTerm: string): boolean {
    const charactersAreValid: boolean =
      this.invalidKeys.indexOf(searchTerm) === -1;
    const lengthIsValid: boolean =
      searchTerm.length >= this.length || searchTerm.length === 0;
    return charactersAreValid && lengthIsValid;
  }

  /**
   * Returns the label for the given stop input.
   *
   * @param {Stop} stop - The stop containing relativePosition and position.
   * @return {string} The label for the stop input.
   */
  getInputLabel(stop: Stop): string {
    const { relativePosition, position } = stop;
    const label: string = relativePosition
      ? this.languageService.translate.instant(
          `igo.geo.directions.input.${relativePosition}`
        )
      : '';
    return relativePosition === DirectionRelativePositionType.Intermediate
      ? `${label} #${position}`
      : label;
  }

  /**
   * Removes a stop from the stops store.
   *
   * @param {Stop} stop - The stop object to be removed.
   */
  removeStop(stop: Stop): void {
    removeStopFromStore(this.stopsStore, stop);
  }

  /**
   * Clears the specified stop in the stops store.
   *
   * @param {Stop} stop - The stop to be cleared.
   */
  clearStopInput(stop: Stop): void {
    this.stopsStore.update({
      id: stop.id,
      relativePosition: stop.relativePosition,
      position: stop.position
    });
  }

  /**
   * Use the current position as a stop.
   *
   * @param {Stop} stop - The stop to update with the current position.
   */
  useCurrentPosition(stop: Stop): void {
    this.useCoordinatesAsStop(
      this.stopsFeatureStore.map.geolocationController.position$.value.position,
      stop
    );
  }

  /**
   * Moves a stop in the list of stops..
   *
   * @param {CdkDragDrop<string[]>} event - The event containing the previous and current index of the dropped stop.
   */
  dropStop(event: CdkDragDrop<string[]>): void {
    this.moveStops(event.previousIndex, event.currentIndex);
  }

  /**
   * Moves a stop in the list of stops from one index to another.
   *
   * @param {number} fromIndex - The index to move the stop from.
   * @param {number} toIndex - The index to move the stop to.
   */
  private moveStops(fromIndex: number, toIndex: number): void {
    if (fromIndex !== toIndex) {
      const stops: Stop[] = [...this.stopsStore.view.all()];
      moveItemInArray(stops, fromIndex, toIndex);
      stops.map((stop, stopIndex) => {
        stop.relativePosition = computeRelativePosition(
          stopIndex,
          stops.length - 1
        );
        stop.position = stopIndex;
      });
      this.stopsStore.updateMany(stops);
      updateStoreSorting(this.stopsStore);
    }
  }

  /**
   * Handles the focus event on an input field for a stop.
   *
   * @param {Stop} stop - The stop that the input field is associated with.
   */
  onInputFocus(stop: Stop): void {
    this.unlistenMapSingleClick();
    this.stopInputHasFocus.emit(true);
    this.listenMapSingleClick(stop);
  }

  /**
   * Listens for a single click event on the map and uses the coordinates of the click
   * to set the given stop's coordinates.
   *
   * @param {Stop} stop - The stop to update with the clicked coordinates.
   */
  private listenMapSingleClick(stop: Stop): void {
    const key: EventsKey = this.stopsFeatureStore.layer.map.ol.once(
      'singleclick',
      (event) => {
        this.useCoordinatesAsStop(event.coordinate, stop);
      }
    );
    this.onMapClickEventKeys.push(key);
  }

  /**
   * Unlistens for map single click events and clears the list of event keys.
   */
  private unlistenMapSingleClick(): void {
    this.onMapClickEventKeys.map((key) => {
      olObservable.unByKey(key);
    });
    this.onMapClickEventKeys = [];
  }

  /**
   * Uses the given coordinates to update the given stop.
   *
   * @param {Coordinate} coordinates - The coordinates to transform and round.
   * @param {Stop} stop - The stop to update with the new coordinates and text.
   */
  private useCoordinatesAsStop(coordinates: Coordinate, stop: Stop): void {
    const projectedCoordinates: Coordinate = olProj.transform(
      coordinates,
      this.stopsFeatureStore.layer.map.projection,
      this.projection
    );
    const roundedCoordinates: Coordinate = roundCoordTo(
      projectedCoordinates,
      this.coordRoundedDecimals
    );

    stop.text = roundCoordToString(
      projectedCoordinates,
      this.coordRoundedDecimals
    ).join(', ');
    stop.coordinates = roundedCoordinates;
    this.stopsStore.update(stop);
    setTimeout(() => {
      this.stopInputHasFocus.emit(false);
    }, 500);
  }
}
