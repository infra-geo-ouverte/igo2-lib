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
import { Subscription, BehaviorSubject, fromEvent } from 'rxjs';
import { MediaService } from '@igo2/core';
/**
 * This directive return the pointer coordinate (on click or pointermove)
 * in [longitude, latitude], delayed by in input (pointerMoveDelay)
 * to avoid too many emitted values.
 * User needs to hold the key defined by pointerByKeyEventKeyCode to emit a coord.
 */
@Directive({
  selector: '[igoPointerPositionByKey]'
})
export class PointerPositionByKeyDirective implements OnInit, OnDestroy {

  private keyDown$$: Subscription;
  private keyUp$$: Subscription;
  private definedKeyIsDown$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
  @Input() pointerPositionByKeyDelay: number = 1000;

  /**
   * The key pressed (must be hold) to trigger the output
   */
  @Input() pointerPositionByKeyCode: number = 17;

  /**
   * Event emitted when the pointer move, delayed by pointerMoveDelay
   */
  @Output() pointerPositionByKeyCoord = new EventEmitter<[number, number]>();

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
    this.subscribeToKeyDown();
    this.subscribeToKeyUp();
  }

  /**
   * Stop listening to pointermove
   * @internal
   */
  ngOnDestroy() {
    this.unlistenToMapPointerMove();
    this.unlistenToMapClick();
    this.unsubscribeToKeyDown();
    this.unsubscribeToKeyUp();
  }

  /**
   * On map pointermove
   */
  private listenToMapPointerMove() {
    this.pointerMoveListener = this.map.ol.on(
      'pointermove',
      (event: OlMapBrowserPointerEvent) => this.onPointerEvent(event, this.pointerPositionByKeyDelay)
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
   * Subscribe to user defined key keyDown, hold down to activate the emit
   */
  private subscribeToKeyDown() {
    this.unsubscribeToKeyDown();
    this.keyDown$$ = fromEvent(document, 'keydown')
    .subscribe((event: KeyboardEvent) => {
      // On user defined key is down,
      if (event.keyCode === this.pointerPositionByKeyCode) {
        this.definedKeyIsDown$.next(true);
        return;
      }
    });
  }
  /**
   * Subscribe to user defined key keyUp, release to desactivate the emit
   */
  private subscribeToKeyUp() {
    this.unsubscribeToKeyUp();
    this.keyUp$$ = fromEvent(document, 'keyup')
    .subscribe((event: KeyboardEvent) => {
      // When user defined key is released,
      if (event.keyCode === this.pointerPositionByKeyCode) {
        this.definedKeyIsDown$.next(false);
        return;
      }
    });
  }

  /**
   * Stop listening for map pointermove
   */
  private unlistenToMapPointerMove() {
    this.map.ol.un(this.pointerMoveListener.type, this.pointerMoveListener.listener);
    this.pointerMoveListener = undefined;
  }

  /**
   * Stop listening for map clicks
   */
  private unlistenToMapClick() {
    this.map.ol.un(this.mapClickListener.type, this.mapClickListener.listener);
    this.mapClickListener = undefined;
  }

  /**
   * Unsubscribe to key down
   */
  private unsubscribeToKeyDown() {
    if (this.keyDown$$ !== undefined) {
      this.keyDown$$.unsubscribe();
      this.keyDown$$ = undefined;
    }
  }

  /**
   * Unsubscribe to key up
   */
  private unsubscribeToKeyUp() {
    if (this.keyUp$$ !== undefined) {
      this.keyUp$$.unsubscribe();
      this.keyUp$$ = undefined;
    }
  }

  /**
   * emit delayed coordinate (longitude, latitude array) based on pointerMoveDelay or on click
   * User must hold the defined key to allow the emit.
   * @param event OL map browser pointer event
   */
  private onPointerEvent(event: OlMapBrowserPointerEvent, delay: number) {
    if (event.dragging || this.mediaService.isTouchScreen()) {return; }
    if (typeof this.lastTimeoutRequest !== 'undefined') { // cancel timeout when the mouse moves
      clearTimeout(this.lastTimeoutRequest);
    }

    if (this.definedKeyIsDown$.value) {
    const lonlat = transform(event.coordinate, this.mapProjection, 'EPSG:4326');
    this.lastTimeoutRequest = setTimeout(() => {
      this.pointerPositionByKeyCoord.emit(lonlat);
    }, delay);
  }
  }
}
