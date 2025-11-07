import OlMap from 'ol/Map';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BasicEvent from 'ol/events/Event';
import { doubleClick } from 'ol/events/condition';
import type { Type } from 'ol/geom/Geometry';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import OlDraw from 'ol/interaction/Draw';
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';
import OlModify from 'ol/interaction/Modify';
import OlSelect from 'ol/interaction/Select';
import { SelectEvent as OlSelectEvent } from 'ol/interaction/Select';
import OlVectorLayer from 'ol/layer/Vector';
import OlVectorSource from 'ol/source/Vector';
import { StyleLike as OlStyleLike } from 'ol/style/Style';

import { BehaviorSubject, Subject, Subscription, fromEvent } from 'rxjs';

import { getMousePositionFromOlGeometryEvent } from '../geometry.utils';

export interface DrawControlOptions {
  geometryType: Type | string;
  drawingLayerSource?: OlVectorSource;
  drawingLayer?: OlVectorLayer<OlVectorSource>;
  drawingLayerStyle?: OlStyleLike;
  interactionStyle?: OlStyleLike;
  maxPoints?: number;
}

/**
 * Control to draw entities
 */
export class DrawControl {
  /**
   * Draw start observable
   */
  public start$ = new Subject<OlGeometry>();

  /**
   * Draw end observable
   */
  public end$ = new Subject<OlGeometry>();

  /**
   * Draw changes observable (while drawing)
   */
  public changes$ = new Subject<any>();

  /**
   * Draw modify observable (modify drawn features)
   */
  public modify$ = new Subject<OlGeometry>();

  /**
   * Draw select observable (modify drawn features)
   */
  public select$ = new Subject<any>();

  /**
   * Draw abort observable (abort drawn features)
   */
  public abort$ = new Subject<any>();

  /**
   * Freehand mode observable (defaults to false)
   */
  freehand$ = new BehaviorSubject<boolean>(false);
  /**
   * Observables from predefined radius (defaults to false and undefined)
   */
  ispredefinedRadius$ = new BehaviorSubject<boolean>(false);
  predefinedRadius$ = new BehaviorSubject<number>(undefined);
  radiusDrawEnd$ = new BehaviorSubject<number>(undefined);

  private keyDown$$: Subscription;

  private olGeometryType: typeof OlGeometry | undefined | string;
  private olInteractionStyle: OlStyleLike;
  private olMap: OlMap;
  private olDrawingLayer: OlVectorLayer<OlVectorSource>;
  private olDrawInteraction: OlDraw;
  private olSelectInteraction: OlSelect;
  private olModifyInteraction: OlModify;
  private onDrawStartKey: EventsKey;
  private onDrawEndKey: EventsKey;
  private onDrawAbortKey: EventsKey;
  private onDrawKey: EventsKey;
  public radius: number;

  private mousePosition: [number, number];

  /**
   * take the value of radius
   */
  get radiusVal(): number {
    return this.predefinedRadius$.getValue();
  }
  set radiusValData(radiusCercle: number) {
    this.predefinedRadius$.next(radiusCercle);
  }

  /**
   * Wheter the control is active
   */
  get active(): boolean {
    return this.olMap !== undefined;
  }

  /**
   * OL overlay source
   * @internal
   */
  get olDrawingLayerSource(): OlVectorSource {
    return this.olDrawingLayer.getSource();
  }

  constructor(private options: DrawControlOptions) {
    this.olDrawingLayer = options.drawingLayer
      ? options.drawingLayer
      : this.createOlInnerOverlayLayer();
    this.olGeometryType = this.options.geometryType;
    this.olInteractionStyle = this.options.interactionStyle;
  }

  /**
   * Add or remove this control to/from a map.
   * @param map OL Map
   */
  setOlMap(olMap: OlMap | undefined, activateModifyAndSelect?: boolean) {
    if (!olMap) {
      this.clearOlInnerOverlaySource();
      this.removeOlInnerOverlayLayer();
      this.removeOlInteractions();
      this.olMap = olMap;
      return;
    }

    this.olMap = olMap;
    this.addOlInnerOverlayLayer();
    this.addOlInteractions(activateModifyAndSelect);
  }

  /**
   * Return the drawing layer source
   */
  getSource(): OlVectorSource {
    return this.olDrawingLayerSource;
  }

  setOlInteractionStyle(style) {
    this.olInteractionStyle = style;
  }

  /**
   * Set the current geometry type
   * @param geometryType the geometry type
   */
  setGeometryType(geometryType: Type) {
    this.olGeometryType = geometryType;
  }

  /**
   * Get the current geometry type
   */
  getGeometryType() {
    return this.olGeometryType;
  }

  /**
   * Create a drawing source if none is defined in the options
   */
  private createOlInnerOverlayLayer(): OlVectorLayer<OlVectorSource> {
    return new OlVectorLayer({
      source: this.options.drawingLayerSource
        ? this.options.drawingLayerSource
        : new OlVectorSource(),
      style: this.options.drawingLayerStyle,
      zIndex: 500
    });
  }

  /**
   * Clear the drawing layer if it wasn't defined in the options
   */
  private removeOlInnerOverlayLayer() {
    if (!this.options.drawingLayer && this.olMap) {
      this.olMap.removeLayer(this.olDrawingLayer);
    }
  }

  /**
   * Add the drawing layer if it wasn't defined in the options
   */
  private addOlInnerOverlayLayer() {
    if (!this.options.drawingLayer) {
      this.olMap.addLayer(this.olDrawingLayer);
    }
  }

  /**
   * Clear the drawing layer source if it wasn't defined in the options
   */
  private clearOlInnerOverlaySource() {
    if (!this.options.drawingLayer && !this.options.drawingLayerSource) {
      this.olDrawingLayerSource.clear(true);
    }
  }

  /**
   * Add interactions to the map an set up some listeners
   */
  addOlInteractions(activateModifyAndSelect?: boolean) {
    // Create Draw interaction
    let olDrawInteraction;
    if (!this.freehand$.getValue()) {
      if (!this.ispredefinedRadius$.getValue()) {
        olDrawInteraction = new OlDraw({
          type: this.olGeometryType as Type,
          source: this.getSource(),
          stopClick: true,
          style: this.olInteractionStyle,
          maxPoints: this.options.maxPoints,
          freehand: false,
          freehandCondition: () => false
        });
      } else {
        olDrawInteraction = new OlDraw({
          type: 'Point',
          source: this.getSource(),
          stopClick: true,
          style: this.olInteractionStyle,
          maxPoints: this.options.maxPoints,
          freehand: false,
          freehandCondition: () => false
        });
      }
    } else {
      if (this.olGeometryType === 'Point') {
        olDrawInteraction = new OlDraw({
          type: 'Circle',
          source: this.getSource(),
          style:
            typeof this.olInteractionStyle === 'function'
              ? undefined
              : this.olInteractionStyle,
          maxPoints: this.options.maxPoints,
          freehand: true
        });
      } else {
        olDrawInteraction = new OlDraw({
          type: this.olGeometryType as Type,
          source: this.getSource(),
          style: this.olInteractionStyle,
          maxPoints: this.options.maxPoints,
          freehand: true
        });
      }
    }

    // Add Draw interaction to map and create listeners
    this.olMap.addInteraction(olDrawInteraction);
    this.olDrawInteraction = olDrawInteraction;
    this.onDrawStartKey = olDrawInteraction.on(
      'drawstart',
      (event: OlDrawEvent) => this.onDrawStart(event)
    );
    this.onDrawEndKey = olDrawInteraction.on('drawend', (event: OlDrawEvent) =>
      this.onDrawEnd(event)
    );
    this.onDrawAbortKey = olDrawInteraction.on(
      'drawabort',
      (event: OlDrawEvent) => this.abort$.next(event.feature.getGeometry())
    );

    if (activateModifyAndSelect) {
      // Create a Modify interaction, add it to map and create a listener
      const olModifyInteraction = new OlModify({
        source: this.getSource()
      });

      this.olMap.addInteraction(olModifyInteraction);
      this.olModifyInteraction = olModifyInteraction;

      // Create a select interaction and add it to map
      if (!this.olSelectInteraction) {
        const olSelectInteraction = new OlSelect({
          condition: doubleClick,
          style: undefined
        });
        this.olMap.addInteraction(olSelectInteraction);
        this.olSelectInteraction = olSelectInteraction;

        this.olSelectInteraction.on('select', (event: OlSelectEvent) =>
          this.onSelect(event)
        );
      }
    }
  }

  /**
   * Remove interactions
   */
  private removeOlInteractions() {
    this.unsubscribeKeyDown();
    unByKey([
      this.onDrawStartKey,
      this.onDrawEndKey,
      this.onDrawKey,
      this.onDrawAbortKey
    ]);

    if (this.olMap) {
      this.olMap.removeInteraction(this.olDrawInteraction);
      this.olMap.removeInteraction(this.olModifyInteraction);
    }

    this.olDrawInteraction = undefined;
    this.olModifyInteraction = undefined;
  }

  /**
   * When drawing starts, clear the overlay and start watching for changes
   * @param event Draw start event
   */
  private onDrawStart(event: OlDrawEvent) {
    const olGeometry = event.feature.getGeometry();
    this.start$.next(olGeometry);
    this.clearOlInnerOverlaySource();
    this.onDrawKey = olGeometry.on('change', (olGeometryEvent: BasicEvent) => {
      this.mousePosition = getMousePositionFromOlGeometryEvent(olGeometryEvent);
      this.changes$.next(olGeometryEvent.target);
    });
    this.subscribeKeyDown();
  }

  /**
   * When drawing ends, update the drawing (feature) geometry observable and add
   * @param event Draw event (drawend)
   */
  private onDrawEnd(event: OlDrawEvent) {
    if (event.feature.getGeometry().getType() === 'Point') {
      this.radiusDrawEnd$.next(this.predefinedRadius$.getValue());
    }
    this.unsubscribeKeyDown();
    unByKey(this.onDrawKey);
    const olGeometry = event.feature.getGeometry();
    olGeometry.on('change', () => {
      this.modify$.next(olGeometry);
    });
    this.end$.next(olGeometry);
  }

  /**
   * When a feature is selected, update the selected feature observable
   * @param event Modify event (modifyend)
   */
  private onSelect(event: OlSelectEvent) {
    if (event.selected.length === 1) {
      this.select$.next(event.selected[0]);
    }
  }

  /**
   * Subscribe to key downs used as drawing interaction shorcuts
   */
  private subscribeKeyDown() {
    this.unsubscribeKeyDown();
    this.keyDown$$ = fromEvent(document, 'keydown').subscribe(
      (event: KeyboardEvent) => {
        // On Escape or 'c' keydowns, abort the current drawing
        if (event.key === 'Escape') {
          this.olDrawInteraction.abortDrawing();
          return;
        }

        // On Backspace or 'u' keydowns, remove last vertex of current drawing
        if (event.key === 'Backspace') {
          this.olDrawInteraction.removeLastPoint();
        }

        // On Enter or 'f' keydowns, finish current drawing
        if (event.key === 'Enter') {
          this.olDrawInteraction.finishDrawing();
        }

        // On space bar key down, pan to the current mouse position
        if (event.key === ' ') {
          this.olMap.getView().animate({
            center: this.mousePosition,
            duration: 100
          });
          return;
        }
      }
    );
  }

  /**
   * Unsubscribe to key down
   */
  private unsubscribeKeyDown() {
    if (this.keyDown$$) {
      this.keyDown$$.unsubscribe();
      this.keyDown$$ = undefined;
    }
  }
}
