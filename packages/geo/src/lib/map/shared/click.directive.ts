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
  MapClickMessage
} from './click.interface';
import { roundCoordTo } from './map.utils';

@Directive({
  selector: '[igoMapClick]'
})
export class MapClickDirective implements OnInit, AfterViewInit, OnDestroy {
  private component = inject(MapBrowserComponent, { self: true });
  private overlayService = inject(OverlayService);
  private document = inject(DOCUMENT);
  public overlay: Overlay | undefined;

  withClickOverlay = input(false, { transform: booleanAttribute });

  parentMessageOrigin = input('*');

  /**
   * Structured click event, emitted on each map click/tap
   */
  mapClick = output<MapClickEvent>();

  /**
   * Listener to the map click event
   */
  private mapClickListener: EventsKey | undefined;

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
  }

  /**
   * Stop listening to click and drag box events and cancel ongoind requests
   * @internal
   */
  ngOnDestroy() {
    this.unlistenToMapClick();
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
    const epsg4326 = 'EPSG:4326';
    const lonlat = transform(
      event.coordinate,
      this.map.projectionCode,
      epsg4326
    );
    const click = this.buildClickEvent(event, lonlat);
    this.mapClick.emit(click);
    this.postMessageToParent(click);
    if (!this.overlay) {
      return;
    }

    this.overlay.clear();

    const clickFeature = featureFromOl(
      new olFeature<Point>({
        geometry: new Point(lonlat)
      }),
      epsg4326
    );

    this.overlay.addFeature(clickFeature, FeatureMotion.None);
  }

  /**
   * Build a structured, self-sufficient payload from the OL event
   */
  private buildClickEvent(
    event: OlMapBrowserEvent,
    lonLat: Coordinate
  ): MapClickEvent {
    const coords = roundCoordTo(lonLat, 6);
    return {
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
    if (!win || win.self === win.top) {
      return;
    }
    const message: MapClickMessage = {
      type: MAP_CLICK_MESSAGE_TYPE,
      data: event
    };
    win.parent.postMessage(message, this.parentMessageOrigin());
  }
}
