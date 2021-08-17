import OlMap from 'ol/Map';
import OlFeature from 'ol/Feature';
import OlStyle from 'ol/style';
import type { default as OlGeometryType } from 'ol/geom/GeometryType';
import OlVectorSource from 'ol/source/Vector';
import OlVectorLayer from 'ol/layer/Vector';
import OlDraw from 'ol/interaction/Draw';
import OlModify from 'ol/interaction/Modify';
import OlSelect from 'ol/interaction/Select';
import { Geometry as OlGeometry, GeometryEvent as OlGeometryEvent } from 'ol/geom/Geometry';
import OlCollection from 'ol/Collection';
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';
import { ModifyEvent as OlModifyEvent } from 'ol/interaction/Modify';
import { SelectEvent as OlSelectEvent } from 'ol/interaction/Select';
import { unByKey } from 'ol/Observable';
import { doubleClick } from 'ol/events/condition';

import { Subject, Subscription, fromEvent, BehaviorSubject } from 'rxjs';

import { getMousePositionFromOlGeometryEvent } from '../geometry.utils';

export interface DrawControlOptions {
  geometryType: OlGeometryType;
  drawingLayerSource?: OlVectorSource;
  drawingLayer?: OlVectorLayer;
  drawingLayerStyle?: OlStyle | ((olFeature: OlFeature) => OlStyle);
  interactionStyle?: OlStyle | ((olFeature: OlFeature) => OlStyle);
  maxPoints?: number;
}

/**
 * Control to draw entities
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
   * Draw changes observable (while drawing)
   */
  public changes$: Subject<OlGeometry> = new Subject();

  /**
   * Draw modify observable (modify drawn features)
   */
  public modify$: Subject<OlCollection> = new Subject();

  /**
   * Draw select observable (modify drawn features)
   */
  public select$: Subject<any> =  new Subject();

  /**
   * Freehand mode observable (defaults to false)
   */
  freehand$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private keyDown$$: Subscription;

  private olGeometryType: OlGeometryType | undefined;
  private olMap: OlMap;
  private olDrawingLayer: OlVectorLayer;
  private olDrawInteraction: OlDraw;
  private olModifyInteraction: OlModify;
  private olSelectInteraction: OlSelect;
  private onDrawStartKey: string;
  private onDrawEndKey: string;
  private onDrawKey: string;

  private mousePosition: [number, number];

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
    this.olDrawingLayer = options.drawingLayer ? options.drawingLayer : this.createOlInnerOverlayLayer();
    this.olGeometryType = this.options.geometryType;
  }

  /**
   * Add or remove this control to/from a map.
   * @param map OL Map
   */
  setOlMap(olMap: OlMap | undefined) {
    if (!olMap) {
      this.clearOlInnerOverlaySource();
      this.removeOlInnerOverlayLayer();
      this.removeOlInteractions();
      this.olMap = olMap;
      return;
    }

    this.olMap = olMap;
    this.addOlInnerOverlayLayer();
    this.addOlInteractions();
  }

  /**
   * Return the drawing layer source
   */
  getSource(): OlVectorSource {
    return this.olDrawingLayerSource;
  }

  /**
   * Set the current geometry type
   * @param geometryType the geometry type
   */
  setGeometryType(geometryType: OlGeometryType) {
    this.olGeometryType = geometryType;
  }

  /**
   * Create a drawing source if none is defined in the options
   */
  private createOlInnerOverlayLayer(): OlVectorLayer {
    return new OlVectorLayer({
      source: this.options.drawingLayerSource ? this.options.drawingLayerSource : new OlVectorSource(),
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
  private addOlInnerOverlayLayer(): OlVectorLayer {
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
  addOlInteractions() {
    // Create Draw interaction
    let olDrawInteraction;
    if (!this.freehand$.getValue()) {
      olDrawInteraction = new OlDraw({
        type: this.olGeometryType,
        source: this.getSource(),
        stopClick: true,
        style: this.options.interactionStyle,
        maxPoints: this.options.maxPoints,
        freehand: false,
        freehandCondition: () => false
      });

    } else {
      if (this.olGeometryType === 'Point') {
        olDrawInteraction = new OlDraw({
          type: 'Circle',
          source: this.getSource(),
          maxPoints: this.options.maxPoints,
          freehand: true
        });

      } else {
        olDrawInteraction = new OlDraw({
          type: this.olGeometryType,
          source: this.getSource(),
          maxPoints: this.options.maxPoints,
          freehand: true
        });
      }
    }

    // Add Draw interaction to map and create listeners
    this.olMap.addInteraction(olDrawInteraction);
    this.olDrawInteraction = olDrawInteraction;

    this.onDrawStartKey = olDrawInteraction.on('drawstart', (event: OlDrawEvent) => this.onDrawStart(event));
    this.onDrawEndKey = olDrawInteraction.on('drawend', (event: OlDrawEvent) => this.onDrawEnd(event));

    // Create a Modify interaction, add it to map and create a listener
    const olModifyInteraction = new OlModify({
      source: this.getSource()
    });

    this.olMap.addInteraction(olModifyInteraction);
    this.olModifyInteraction = olModifyInteraction;

    this.olModifyInteraction.on('modifyend', (event: OlModifyEvent) => this.onModifyEnd(event));

    // Create a select interaction and add it to map
    if (!this.olSelectInteraction) {
      const olSelectInteraction = new OlSelect({
        condition: doubleClick,
        style: undefined,
        source: this.getSource()
      });
      this.olMap.addInteraction(olSelectInteraction);
      this.olSelectInteraction = olSelectInteraction;

      this.olSelectInteraction.on('select', (event: OlSelectEvent) => this.onSelect(event));
    }
  }

  /**
   * Remove interactions
   */
  private removeOlInteractions() {
    this.unsubscribeKeyDown();
    unByKey([this.onDrawStartKey, this.onDrawEndKey, this.onDrawKey]);

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
    this.onDrawKey = olGeometry.on('change', (olGeometryEvent: OlGeometryEvent) => {
      this.mousePosition = getMousePositionFromOlGeometryEvent(olGeometryEvent);
      this.changes$.next(olGeometryEvent.target);
    });
    this.subscribeKeyDown();
  }

  /**
   * When drawing ends, update the drawing (feature) geometry observable
   * @param event Draw event (drawend)
   */
  private onDrawEnd(event: OlDrawEvent) {
    this.unsubscribeKeyDown();
    unByKey(this.onDrawKey);
    this.end$.next(event.feature.getGeometry());
  }

  /**
   * When a feature is modified, update the drawn features observable
   * @param event Modify event (modifyend)
   */
  private onModifyEnd(event: OlModifyEvent) {
    this.modify$.next(event.features);
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
    this.keyDown$$ = fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
      // On Escape or 'c' keydowns, abort the current drawing
      if (event.key === 'Escape' || event.key === 'c') {
        this.olDrawInteraction.abortDrawing();
        return;
      }

      // On Backspace or 'u' keydowns, remove last vertex of current drawing
      if (event.key === 'Backspace' || event.key === 'u') {
        this.olDrawInteraction.removeLastPoint();
      }

      // On Enter or 'f' keydowns, finish current drawing
      if (event.key === 'Enter' || event.key === 'f') {
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
    });
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
