import {
  Directive,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  Self,
  OnInit
} from '@angular/core';

import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';
import { ListenerFunction } from 'ol/events';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';

import { transform } from 'ol/proj';
/**
 * This directive return the pointer coordinate (on click or pointermove)
 * in [longitude, latitude], delayed by in input (pointerMoveDelay)
 * to avoid too many emitted values.
 */
@Directive({
  selector: '[igoMapPointer]'
})
export class MapPointerDirective implements OnInit, OnDestroy {

  private lastTimeoutRequest;

  /**
   * Listener to the pointer move event
   */
  private pointerMoveListener: ListenerFunction;

  /**
   * Listener to the map click event
   */
  private mapClickListener: ListenerFunction;

  /**
   * Delay before emitting an event
   */
  @Input() pointerMoveDelay: number = 1000;

  /**
   * Event emitted when the pointer move, delayed by pointerMoveDelay
   */
  @Output() mapPointerCoord = new EventEmitter<[number, number]>();

  /**
   * IGO map
   * @internal
   */
  get map(): IgoMap {
    return this.component.map;
  }

  get mapProjection(): string {
    return (this.component.map as IgoMap).projection;
  }

  constructor(
    @Self() private component: MapBrowserComponent
  ) { }

  /**
   * Start listening to pointermove
   * @internal
   */
  ngOnInit(): void {
    this.listenToMapPointerMove();
    this.listenToMapClick();
  }

  /**
   * Stop listening to pointermove
   * @internal
   */
  ngOnDestroy() {
    this.unlistenToMapPointerMove();
    this.unlistenToMapClick();
  }

  /**
   * On map pointermove
   */
  private listenToMapPointerMove() {
    this.pointerMoveListener = this.map.ol.on(
      'pointermove',
      (event: OlMapBrowserPointerEvent) => this.onPointerEvent(event, this.pointerMoveDelay)
    );
  }

  /**
   * On map click
   */
  private listenToMapClick() {
    this.mapClickListener = this.map.ol.on(
      'singleclick',
      (event: OlMapBrowserPointerEvent) => this.onPointerEvent(event, 0)
    );
  }

  /**
   * Stop listening for map pointermove
   */
  private unlistenToMapPointerMove() {
    this.map.ol.un(this.pointerMoveListener.type, this.pointerMoveListener.listener);
    this.pointerMoveListener = undefined;
  }

  /**
   * Stop listenig for map clicks
   */
  private unlistenToMapClick() {
    this.map.ol.un(this.mapClickListener.type, this.mapClickListener.listener);
    this.mapClickListener = undefined;
  }

  /**
   * emit delayed coordinate (longitude, latitude array) based on pointerMoveDelay or on click
   * @param event OL map browser pointer event
   */
  private onPointerEvent(event: OlMapBrowserPointerEvent, delay: number) {
    if (event.dragging) {return; }
    if (typeof this.lastTimeoutRequest !== 'undefined') { // cancel timeout when the mouse moves
      clearTimeout(this.lastTimeoutRequest);
    }

    const lonlat = transform(event.coordinate, this.mapProjection, 'EPSG:4326');
    this.lastTimeoutRequest = setTimeout(() => {
      this.mapPointerCoord.emit(lonlat);
    }, delay);
  }
}
