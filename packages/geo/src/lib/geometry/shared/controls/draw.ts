import MapBrowserEvent from 'ol/MapBrowserEvent';
import { EventsKey } from 'ol/events';
import OlMap from 'ol/Map';
import OlFeature from 'ol/Feature';
import * as OlStyle from 'ol/style';
import type { default as OlGeometryType } from 'ol/geom/GeometryType';
import OlVectorSource from 'ol/source/Vector';
import OlVectorLayer from 'ol/layer/Vector';
import OlDraw from 'ol/interaction/Draw';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';
import { unByKey } from 'ol/Observable';

import { Subject, Subscription, fromEvent, BehaviorSubject } from 'rxjs';

import { getMousePositionFromOlGeometryEvent } from '../geometry.utils';

export interface DrawControlOptions {
  geometryType: typeof OlGeometryType | string;
  source?: OlVectorSource<OlGeometry>;
  layer?: OlVectorLayer<OlVectorSource<OlGeometry>>;
  layerStyle?: OlStyle.Style | ((olfeature: OlFeature<OlGeometry>) => OlStyle.Style);
  drawStyle?: OlStyle.Style | ((olfeature: OlFeature<OlGeometry>) => OlStyle.Style) | OlStyle.Circle |
    ((olfeature: OlFeature<OlGeometry>) => OlStyle.Circle);
  maxPoints?: number;
}

/**
 * Control to draw geometries
 */
export class DrawControl {
  /**
   * Draw start observable
   */
  public start$: Subject<OlGeometry> = new Subject();

  /**
   * Draw end observable
   */
  public end$: Subject<OlGeometry> = new Subject();

  /**
   * Geometry changes observable
   */
  public changes$: Subject<any> = new Subject();

  private olMap: OlMap;
  private olOverlayLayer: OlVectorLayer<OlVectorSource<OlGeometry>>;
  private olDrawInteraction: OlDraw;
  private onDrawStartKey: EventsKey;
  private onDrawEndKey: EventsKey;
  private onDrawKey: EventsKey;

  private mousePosition: [number, number];

  private keyDown$$: Subscription;

  freehand$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Wheter the control is active
   */
  get active(): boolean {
    return this.olMap !== undefined;
  }

  /**
   * Geometry type
   * @internal
   */
  get geometryType(): typeof OlGeometryType | string {
    return this.options.geometryType;
  }

  /**
   * OL overlay source
   * @internal
   */
  get olOverlaySource(): OlVectorSource<OlGeometry> {
    return this.olOverlayLayer.getSource();
  }

  constructor(private options: DrawControlOptions) {
    if (options.layer !== undefined) {
      this.olOverlayLayer = options.layer;
    } else {
      this.olOverlayLayer = this.createOlInnerOverlayLayer();
    }
  }

  /**
   * Add or remove this control to/from a map.
   * @param map OL Map
   */
  setOlMap(olMap: OlMap | undefined) {
    if (olMap === undefined) {
      this.clearOlInnerOverlaySource();
      this.removeOlInnerOverlayLayer();
      this.removeOlDrawInteraction();
      this.olMap = olMap;
      return;
    }

    this.olMap = olMap;
    this.addOlInnerOverlayLayer();
    this.addOlDrawInteraction();
  }

  /**
   * Return the overlay source
   */
  getSource(): OlVectorSource<OlGeometry> {
    return this.olOverlaySource;
  }

  /**
   * Create an overlay source if none is defined in the options
   */
  private createOlInnerOverlayLayer(): OlVectorLayer<OlVectorSource<OlGeometry>> {
    return new OlVectorLayer({
      source: this.options.source ? this.options.source : new OlVectorSource(),
      style: this.options.layerStyle,
      zIndex: 500
    });
  }

  /**
   * Clear the overlay layer if it wasn't defined in the options
   */
  private removeOlInnerOverlayLayer() {
    if (this.options.layer === undefined && this.olMap !== undefined) {
      this.olMap.removeLayer(this.olOverlayLayer);
    }
  }

  /**
   * Add the overlay layer if it wasn't defined in the options
   */
  private addOlInnerOverlayLayer() {
    if (this.options.layer === undefined) {
      this.olMap.addLayer(this.olOverlayLayer);
    }
  }

  /**
   * Clear the overlay source if it wasn't defined in the options
   */
  private clearOlInnerOverlaySource() {
    if (this.options.layer === undefined && this.options.source === undefined) {
      this.olOverlaySource.clear(true);
    }
  }

  /**
   * Add a draw interaction to the map an set up some listeners
   */
  addOlDrawInteraction() {
    let olDrawInteraction;
    if (this.freehand$.getValue() === false) {
      olDrawInteraction = new OlDraw({
        type: this.geometryType,
        source: this.getSource(),
        stopClick: true,
        style: this.options.drawStyle as OlStyle.Style,
        maxPoints: this.options.maxPoints,
        freehand: false,
        freehandCondition: () => false
      });
    } else {
      if (this.geometryType === 'Point') {
        olDrawInteraction = new OlDraw({
          type: 'Circle',
          source: this.getSource(),
          maxPoints: this.options.maxPoints,
          freehand: true
        });
      } else {
        olDrawInteraction = new OlDraw({
          type: this.geometryType,
          source: this.getSource(),
          maxPoints: this.options.maxPoints,
          freehand: true
        });
      }
    }

    this.onDrawStartKey = olDrawInteraction.on(
      'drawstart',
      (event: OlDrawEvent) => this.onDrawStart(event)
    );
    this.onDrawEndKey = olDrawInteraction.on('drawend', (event: OlDrawEvent) =>
      this.onDrawEnd(event)
    );
    this.olMap.addInteraction(olDrawInteraction);
    this.olDrawInteraction = olDrawInteraction;
  }

  /**
   * Remove the draw interaction
   */
  private removeOlDrawInteraction() {
    if (this.olDrawInteraction === undefined) {
      return;
    }

    this.unsubscribeToKeyDown();
    unByKey([this.onDrawStartKey, this.onDrawEndKey, this.onDrawKey]);
    if (this.olMap !== undefined) {
      this.olMap.removeInteraction(this.olDrawInteraction);
    }
    this.olDrawInteraction = undefined;
  }

  /**
   * When drawing starts, clear the overlay and start watching from changes
   * @param event Draw start event
   */
  private onDrawStart(event: OlDrawEvent) {
    const olGeometry = event.feature.getGeometry();
    this.start$.next(olGeometry);
    this.clearOlInnerOverlaySource();
    this.onDrawKey = olGeometry.on(
      'change',
      (olGeometryEvent: MapBrowserEvent<any>) => {
        this.mousePosition = getMousePositionFromOlGeometryEvent(
          olGeometryEvent
        );
        this.changes$.next(olGeometryEvent.target);
      }
    );
    this.subscribeToKeyDown();
  }

  /**
   * When drawing ends, update the geometry observable and start watching from changes
   * @param event Draw end event
   */
  private onDrawEnd(event: OlDrawEvent) {
    this.unsubscribeToKeyDown();
    unByKey(this.onDrawKey);
    this.end$.next(event.feature.getGeometry());
  }

  /**
   * Subscribe to CTRL key down to activate the draw control
   */
  private subscribeToKeyDown() {
    this.unsubscribeToKeyDown();
    this.keyDown$$ = fromEvent(document, 'keydown').subscribe(
      (event: KeyboardEvent) => {
        // On ESC key down, remove the last vertex
        if (event.key === 'Escape') {
          this.olDrawInteraction.removeLastPoint();
          return;
        }

        // On space bar, pan to the current mouse position
        if (event.key === ' ') {
          this.olMap.getView().animate({
            center: this.mousePosition,
            duration: 0
          });
          return;
        }
      }
    );
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
}
