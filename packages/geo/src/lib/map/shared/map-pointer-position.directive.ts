import {
  Directive,
  OnDestroy,
  OnInit,
  inject,
  input,
  output
} from '@angular/core';

import { MediaService } from '@igo2/core/media';

import MapBrowserPointerEvent from 'ol/MapBrowserEvent';
import { unByKey } from 'ol/Observable';
import { transform } from 'ol/proj';

import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { IgoMap } from '../../map/shared/map';

/**
 * This directive return the pointer coordinate (on click or pointermove)
 * in [longitude, latitude], delayed by in input (pointerMoveDelay)
 * to avoid too many emitted values.
 */
@Directive({
  selector: '[igoPointerPosition]',
  standalone: true
})
export class PointerPositionDirective implements OnInit, OnDestroy {
  private component = inject(MapBrowserComponent, { self: true });
  private mediaService = inject(MediaService);

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
  readonly pointerPositionDelay = input(1000);

  /**
   * Event emitted when the pointer move, delayed by pointerMoveDelay
   */
  readonly pointerPositionCoord = output<[number, number]>();

  /**
   * IGO map
   * @internal
   */
  get map(): IgoMap {
    return this.component.map();
  }

  get mapProjection(): string {
    return (this.component.map() as IgoMap).projection;
  }

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
      (event: MapBrowserPointerEvent<any>) =>
        this.onPointerEvent(event, this.pointerPositionDelay())
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
    if (event.dragging || this.mediaService.isTouchScreen()) {
      return;
    }
    if (typeof this.lastTimeoutRequest !== 'undefined') {
      // cancel timeout when the mouse moves
      clearTimeout(this.lastTimeoutRequest);
    }

    const lonlat = transform(
      event.coordinate,
      this.mapProjection,
      'EPSG:4326'
    ) as [number, number];
    this.lastTimeoutRequest = setTimeout(() => {
      this.pointerPositionCoord.emit(lonlat);
    }, delay);
  }
}
