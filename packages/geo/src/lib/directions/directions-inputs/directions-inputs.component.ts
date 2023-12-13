import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';

import { LanguageService } from '@igo2/core';

import * as olObservable from 'ol/Observable';
import * as olProj from 'ol/proj';

import pointOnFeature from '@turf/point-on-feature';

import { roundCoordTo } from '../../map/shared/map.utils';
import { DirectionRelativePositionType } from '../shared/directions.enum';
import { FeatureWithRoute, Waypoint } from '../shared/directions.interface';

import { Feature, FeatureGeometry } from '../../feature/shared/feature.interfaces';
import {
  addWaypointToStore,
  computeRelativePosition,
  removeWaypointFromStore,
  updateStoreSorting
} from '../shared/directions.utils';
import { RoutesFeatureStore, WaypointFeatureStore, WaypointStore } from '../shared/store';
import { Position } from 'geojson';
import { EventsKey } from 'ol/events';

@Component({
  selector: 'igo-directions-inputs',
  templateUrl: './directions-inputs.component.html',
  styleUrls: ['./directions-inputs.component.scss']
})
export class DirectionsInputsComponent implements OnDestroy {
  get activeRoute(): FeatureWithRoute {
    return this.routesFeatureStore
      .all()
      .find((route: FeatureWithRoute) => route.properties.active);
  }
  private readonly invalidKeys: string[] = ['Control', 'Shift', 'Alt'];
  private onMapClickEventKeys = [];
  public waypointWithHover: Waypoint;
  public waypointIsDragged: boolean = false;
  @Input() waypointStore: WaypointStore;
  @Input() waypointFeatureStore: WaypointFeatureStore;
  @Input() routesFeatureStore: RoutesFeatureStore;
  @Input() projection: string;
  @Input() coordRoundedDecimals: number = 6;

  @Input() debounce: number = 200;
  @Input() length: number = 2;

  @Output() waypointInputHasFocus: EventEmitter<boolean> =
    new EventEmitter<boolean>(false);
  constructor(private languageService: LanguageService) {}

  ngOnDestroy(): void {
    this.unlistenMapSingleClick();
  }

  // intermediate waypoints are always added before the last waypoint.
  addWaypoint(): void {
    addWaypointToStore(this.waypointStore);
  }

  onWaypointEnter(waypoint: Waypoint): void {
    this.waypointWithHover = waypoint;
  }
  onWaypointLeave(): void {
    this.waypointWithHover = undefined;
  }

  getOptionText(option: any): any {
    if (option instanceof Object) {
      return option?.meta ? option.meta.title : '';
    }
    return option;
  }

  resetWaypoints(): void {
    this.waypointStore.clearWaypoints();
  }

  chooseProposal(
    event: { source: MatAutocomplete; option: MatOption },
    waypoint: Waypoint
  ): void {
    const result: Feature = event.option.value;
    if (result) {
      let geomCoord: Position;
      const geom: FeatureGeometry = result.geometry;
      if (geom.type === 'Point') {
        geomCoord = geom.coordinates;
      } else {
        const point = pointOnFeature(result.geometry);
        geomCoord = [
          point.geometry.coordinates[0],
          point.geometry.coordinates[1]
        ];
      }
      if (geomCoord) {
        waypoint.coordinates = geomCoord;
        waypoint.text = result.meta.title;
        this.waypointStore.update(waypoint);
      }
    }
  }

  setWaypointText(event: KeyboardEvent, waypoint: Waypoint): void {
    this.unlistenMapSingleClick();
    const term: string = (event.target as HTMLInputElement).value;
    if (term.length === 0) {
      this.clearWaypoint(waypoint);
    } else if (this.validateTerm(term)) {
      waypoint.text = term;
      this.waypointStore.update(waypoint);
    }
  }

  validateTerm(term: string): boolean {
    if (
      this.keyIsValid(term) &&
      (term.length >= this.length || term.length === 0)
    ) {
      return true;
    }
    return false;
  }

  private keyIsValid(key: string): boolean {
    return this.invalidKeys.find((value: string) => value === key) === undefined;
  }

  getNgClass(waypoint: Waypoint): string {
    if (!this.waypointWithHover) {
      return 'igo-input-container';
    } else if (waypoint.id === this.waypointWithHover.id) {
      return 'igo-input-container reduce';
    } else {
      return 'igo-input-container';
    }
  }

  getLabel(waypoint: Waypoint): string {
    let extra = '';
    if (waypoint.relativePosition) {
      if (waypoint.relativePosition === DirectionRelativePositionType.Intermediate) {
        extra = ' #' + waypoint.position;
      }
      return (
        this.languageService.translate.instant(
          'igo.geo.directionsForm.' + waypoint.relativePosition + ".label"
        ) + extra
      );
    } else {
      return '';
    }
  }

  getPlaceholder(waypoint: Waypoint): string {
    if (waypoint.relativePosition) {
      return (
        this.languageService.translate.instant(
          'igo.geo.directionsForm.' + waypoint.relativePosition + ".placeholder"
        )
      );
    } else {
      return '';
    }
  }

  removeWaypoint(waypoint: Waypoint) {
    removeWaypointFromStore(this.waypointStore, waypoint);
  }

  clearWaypoint(waypoint: Waypoint) {
    this.waypointStore.update({
      id: waypoint.id,
      relativePosition: waypoint.relativePosition,
      position: waypoint.position
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    this.moveWaypoints(event.previousIndex, event.currentIndex);
  }

  private moveWaypoints(fromIndex: number, toIndex: number) {
    if (fromIndex !== toIndex) {
      const waypoints: Waypoint[] = [...this.waypointStore.view.all()];
      moveItemInArray(waypoints, fromIndex, toIndex);
      waypoints.map((waypoint: Waypoint, waypointIndex: number) => {
        waypoint.relativePosition = computeRelativePosition(waypointIndex, waypoints.length);
        waypoint.position = waypointIndex;
      });
      this.waypointStore.updateMany(waypoints);
      updateStoreSorting(this.waypointStore);
    }
  }

  onInputFocus(waypoint: Waypoint) {
    if (!waypoint.text || waypoint.text?.length === 0) {
      this.unlistenMapSingleClick();
      this.waypointInputHasFocus.emit(true);
      this.listenMapSingleClick(waypoint);
    }
  }

  private listenMapSingleClick(waypoint: Waypoint) {
    const key: EventsKey = this.waypointFeatureStore.layer.map.ol.once(
      'singleclick',
      (event) => {
        const clickCoordinates: Position = olProj.transform(
          event.coordinate,
          this.waypointFeatureStore.layer.map.projection,
          this.projection
        );
        const roundedCoord: Position = roundCoordTo(
          clickCoordinates,
          this.coordRoundedDecimals
        );
        waypoint.text = roundedCoord.join(',');
        waypoint.coordinates = roundedCoord;
        this.waypointStore.update(waypoint);
        setTimeout(() => {
          this.waypointInputHasFocus.emit(false);
        }, 500);
      }
    );
    this.onMapClickEventKeys.push(key);
  }

  private unlistenMapSingleClick() {
    this.onMapClickEventKeys.map((key) => {
      olObservable.unByKey(key);
    });
    this.onMapClickEventKeys = [];
  }
}
