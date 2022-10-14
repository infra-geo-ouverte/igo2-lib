import {
  Directive,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  Self,
  OnInit
} from '@angular/core';

import MapBrowserPointerEvent from 'ol/MapBrowserEvent';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';

import { transform } from 'ol/proj';
import { MediaService } from '@igo2/core';
import { unByKey } from 'ol/Observable';
/**
 * This directive return the pointer coordinate (on click or pointermove)
 * in [longitude, latitude], delayed by in input (pointerMoveDelay)
 * to avoid too many emitted values.
 */
@Directive({
  selector: '[igoPointerPosition]'
})
export class PointerPositionDirective implements OnInit, OnDestroy {

  private lastTimeoutRequest;

  /**
   * Listener to the pointer move event
   */
  private pointerMoveListener;

  /**
   * Listener to the map click event
   */
  private mapClickListener;

  /**
   * Delay before emitting an event
   */
  @Input() pointerPositionDelay: number = 1000;

  /**
   * Event emitted when the pointer move, delayed by pointerMoveDelay
   */
  @Output() pointerPositionCoord = new EventEmitter<[number, number]>();

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
    @Self() private component: MapBrowserComponent,
    private mediaService: MediaService
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
      (event: MapBrowserPointerEvent<any>) => this.onPointerEvent(event, this.pointerPositionDelay)
    );
  }

  /**
   * On map click
   */
  private listenToMapClick() {
    this.mapClickListener = this.map.ol.on(
      'singleclick',
      (event: MapBrowserPointerEvent<any>) => this.onPointerEvent(event, 0)
    );
  }

  /**
   * Stop listening for map pointermove
   */
  private unlistenToMapPointerMove() {
    unByKey(this.pointerMoveListener);
    this.pointerMoveListener = undefined;
  }

  /**
   * Stop listening for map clicks
   */
  private unlistenToMapClick() {
    this.mapClickListener = undefined;
  }

  /**
   * emit delayed coordinate (longitude, latitude array) based on pointerMoveDelay or on click
   * @param event OL map browser pointer event
   */
  private onPointerEvent(event: MapBrowserPointerEvent<any>, delay: number) {
    if (event.dragging || this.mediaService.isTouchScreen()) {return; }
    if (typeof this.lastTimeoutRequest !== 'undefined') { // cancel timeout when the mouse moves
      clearTimeout(this.lastTimeoutRequest);
    }

    const lonlat = transform(event.coordinate, this.mapProjection, 'EPSG:4326') as [number, number];
    this.lastTimeoutRequest = setTimeout(() => {
      this.pointerPositionCoord.emit(lonlat);
    }, delay);
  }
}
