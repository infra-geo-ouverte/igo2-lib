import {
  AfterViewInit,
  DOCUMENT,
  Directive,
  OnDestroy,
  OnInit,
  booleanAttribute,
  inject,
  input,
  output
} from '@angular/core';

import { LongPressDirective } from '@igo2/common/context-menu';

import olFeature from 'ol/Feature';
import type { default as OlMapBrowserEvent } from 'ol/MapBrowserEvent';
import { unByKey } from 'ol/Observable';
import type { Coordinate } from 'ol/coordinate';
import type { EventsKey } from 'ol/events';
import Point from 'ol/geom/Point';
import { transform } from 'ol/proj';

import { FeatureMotion } from '../../feature/shared/feature.enums';
import { featureFromOl } from '../../feature/shared/feature.utils';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { IgoMap } from '../../map/shared/map';
import { Overlay } from '../../overlay/shared/overlay';
import { OverlayService } from '../../overlay/shared/overlay.service';
import {
  MAP_CLICK_MESSAGE_TYPE,
  MapClickEvent,
  MapClickMessage,
  MapClickTrigger
} from './click.interface';
import { roundCoordTo } from './map.utils';

@Directive({
  selector: '[igoMapClick]'
})
export class MapClickDirective implements OnInit, AfterViewInit, OnDestroy {
  /**
   * How long a contextmenu fired right after a long press is
   * considered a duplicate of it (e.g. Android Chrome fires both)
   */
  private static readonly CONTEXT_MENU_SUPPRESS_MS = 1000;

  private component = inject(MapBrowserComponent, { self: true });
  private overlayService = inject(OverlayService);
  private document = inject(DOCUMENT);
  /**
   * Long press provider, when present on the element: hosted by
   * igoContextMenu (e.g. via igoMapContextMenu) or applied
   * explicitly with the igoLongPress attribute. Without it, the
   * `longpress` trigger is unavailable.
   */
  private longPress = inject(LongPressDirective, {
    self: true,
    optional: true
  });
  public overlay: Overlay | undefined;

  constructor() {
    this.longPress?.longpress.subscribe((domEvent: TouchEvent) =>
      this.onLongPress(domEvent)
    );
  }

  withClickOverlay = input(false, { transform: booleanAttribute });

  parentMessageOrigin = input('*');

  /**
   * Structured click event, emitted on every map interaction:
   * left click/tap, right click and touch long press. Use the
   * `trigger` field to discriminate them.
   */
  mapClick = output<MapClickEvent>();

  /**
   * Listener to the map click event
   */
  private mapClickListener: EventsKey | undefined;

  /**
   * Contextmenu events are ignored until this epoch, to dedupe the
   * contextmenu some browsers fire after a long press
   */
  private suppressContextMenuUntil = 0;

  /**
   * When true, the next OL singleclick is ignored: OL fires a click
   * on pointer release regardless of the press duration, so a long
   * press would otherwise also emit a `click` event. Reset on every
   * new gesture (pointerdown) so a legit click is never swallowed.
   */
  private suppressNextSingleClick = false;

  /**
   * IGO map
   * @internal
   */
  get map(): IgoMap {
    return this.component.map();
  }

  /**
   * Create the overlay once the map input is available
   * @internal
   */
  ngOnInit() {
    if (this.withClickOverlay()) {
      this.overlay = this.overlayService.create(this.map);
    }
  }

  /**
   * Start listening to click and drag box events
   * @internal
   */
  ngAfterViewInit() {
    this.listenToMapClick();
    this.listenToSecondaryClick();
  }

  /**
   * Stop listening to click and drag box events and cancel ongoind requests
   * @internal
   */
  ngOnDestroy() {
    this.unlistenToMapClick();
    this.unlistenToSecondaryClick();
    if (this.overlay) {
      this.map.layerController.remove(this.overlay.layer);
      this.overlay = undefined;
    }
  }

  /**
   * On map click, issue queries
   */
  private listenToMapClick() {
    this.mapClickListener = this.map.ol.on(
      'singleclick',
      (event: OlMapBrowserEvent) => this.onMapEvent(event)
    );
  }

  /**
   * Stop listening for map clicks
   */
  private unlistenToMapClick() {
    if (this.mapClickListener) {
      unByKey(this.mapClickListener);
      this.mapClickListener = undefined;
    }
  }

  /**
   * Issue queries from a map event and emit events with the results
   * @param event OL map browser pointer event
   */
  private onMapEvent(event: OlMapBrowserEvent) {
    if (this.suppressNextSingleClick) {
      this.suppressNextSingleClick = false;
      return;
    }
    this.handleClick(event.coordinate, 'click');
  }

  /**
   * Shared click pipeline: emit the output, relay to the
   * parent frame and update the overlay
   */
  private handleClick(coordinate: Coordinate, trigger: MapClickTrigger) {
    if (trigger !== 'click') {
      // OL fires a (single)click when the pointer is released after
      // a long press; ignore it
      this.suppressNextSingleClick = true;
    }
    const epsgCode = 'EPSG:4326';
    const lonlat = transform(coordinate, this.map.projectionCode, epsgCode);
    const click = this.buildClickEvent(lonlat, trigger);
    this.mapClick.emit(click);
    this.postMessageToParent(click);
    if (!this.overlay) {
      return;
    }
    if (trigger === 'click') {
      this.overlay.clear();

      const clickFeature = featureFromOl(
        new olFeature<Point>({
          geometry: new Point(lonlat)
        }),
        epsgCode
      );

      this.overlay.addFeature(clickFeature, FeatureMotion.None);
    }
  }

  /**
   * Listen to secondary clicks on the map viewport: `contextmenu`
   * covers the desktop right click (and the Android long press),
   * while the igoLongPress host directive covers the touch long
   * press on devices that don't fire `contextmenu` (e.g. iOS Safari)
   */
  private listenToSecondaryClick() {
    const viewport = this.map.ol.getViewport();
    viewport?.addEventListener('contextmenu', this.onContextMenu);
    viewport?.addEventListener('pointerdown', this.onPointerDown);
  }

  /**
   * Stop listening for secondary clicks
   */
  private unlistenToSecondaryClick() {
    const viewport = this.map.ol.getViewport();
    viewport?.removeEventListener('contextmenu', this.onContextMenu);
    viewport?.removeEventListener('pointerdown', this.onPointerDown);
  }

  /**
   * A new gesture starts: stop suppressing the OL singleclick
   */
  private onPointerDown = () => {
    this.suppressNextSingleClick = false;
  };

  private onContextMenu = (domEvent: MouseEvent) => {
    domEvent.preventDefault();
    if (Date.now() < this.suppressContextMenuUntil) {
      return;
    }
    // Some browsers fire the long-press contextmenu as a touch
    // PointerEvent; report the actual trigger in that case
    const trigger: MapClickTrigger =
      domEvent instanceof PointerEvent && domEvent.pointerType === 'touch'
        ? 'longpress'
        : 'contextmenu';
    this.handleClick(this.map.ol.getEventCoordinate(domEvent), trigger);
  };

  /**
   * Handle the igoLongPress event as a long-press click
   */
  private onLongPress(domEvent: TouchEvent) {
    // Some browsers (e.g. Android Chrome) also fire a contextmenu
    // on long press; suppress it so the click isn't emitted twice
    this.suppressContextMenuUntil =
      Date.now() + MapClickDirective.CONTEXT_MENU_SUPPRESS_MS;
    const pixel = this.map.ol.getEventPixel(domEvent);
    this.handleClick(this.map.ol.getCoordinateFromPixel(pixel), 'longpress');
  }

  /**
   * Build a structured, self-sufficient payload from the click position
   */
  private buildClickEvent(
    lonLat: Coordinate,
    trigger: MapClickTrigger
  ): MapClickEvent {
    const coords = roundCoordTo(lonLat, 6);
    return {
      trigger,
      longitude: coords[0],
      latitude: coords[1],
      timestamp: Date.now()
    };
  }

  /**
   * Relay the click event to the parent window when the app
   * is embedded in an iframe
   */
  private postMessageToParent(event: MapClickEvent) {
    const win = this.document.defaultView;
    // Not embedded in an iframe: a top-level window is its own parent
    if (!win || win.parent === win) {
      return;
    }
    const message: MapClickMessage = {
      type: MAP_CLICK_MESSAGE_TYPE,
      data: event
    };
    win.parent.postMessage(message, this.parentMessageOrigin());
  }
}
