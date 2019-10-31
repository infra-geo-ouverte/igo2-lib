import OlMap from 'ol/Map';
import OlFeature from 'ol/Feature';
import OlStyle from 'ol/style';
import OlVectorSource from 'ol/source/Vector';
import OlVectorLayer from 'ol/layer/Vector';
import OlModify from 'ol/interaction/Modify';
import OlTranslate from 'ol/interaction/Translate';
import OlDraw from 'ol/interaction/Draw';
import OlPolygon from 'ol/geom/Polygon';
import OlLinearRing from 'ol/geom/LinearRing';
import OlInteraction from 'ol/interaction/Interaction';
import OlDragBoxInteraction from 'ol/interaction/DragBox';
import { MapBrowserEvent as OlMapBrowserEvent } from 'ol/MapBrowserEvent';
import {
  Geometry as OlGeometry,
  GeometryEvent as OlGeometryEvent
} from 'ol/geom/Geometry';
import { ModifyEvent as OlModifyEvent } from 'ol/interaction/Modify';
import { TranslateEvent as OlTranslateEvent } from 'ol/interaction/Translate';
import { DrawEvent as OlDrawEvent } from 'ol/interaction/Draw';
import { unByKey } from 'ol/Observable';

import { Subject, Subscription, fromEvent } from 'rxjs';

import {
  addLinearRingToOlPolygon,
  createDrawHoleInteractionStyle,
  getMousePositionFromOlGeometryEvent
} from '../geometry.utils';

export interface ModifyControlOptions {
  source?: OlVectorSource;
  layer?: OlVectorLayer;
  layerStyle?: OlStyle | ((olfeature: OlFeature) => OlStyle);
  drawStyle?: OlStyle | ((olfeature: OlFeature) => OlStyle);
}

/**
 * Control to modify geometries
 */
export class ModifyControl {

  /**
   * Modify start observable
   */
  public start$: Subject<OlGeometry> = new Subject();

  /**
   * Modify end observable
   */
  public end$: Subject<OlGeometry> = new Subject();

  /**
   * Geometry changes observable
   */
  public changes$: Subject<OlGeometry> = new Subject();

  private olMap: OlMap;
  private olOverlayLayer: OlVectorLayer;
  private olModifyInteraction: OlModify;
  private onModifyStartKey: string;
  private onModifyEndKey: string;
  private onModifyKey: string;
  private olModifyInteractionIsActive: boolean = false;
  private olTranslateInteraction: OlTranslate;
  private onTranslateStartKey: string;
  private onTranslateEndKey: string;
  private onTranslateKey: string;
  private olTranslateInteractionIsActive: boolean = false;
  private olDrawInteraction: OlTranslate;
  private onDrawStartKey: string;
  private onDrawEndKey: string;
  private onDrawKey: string;
  private olDrawInteractionIsActive: boolean = false;

  private mousePosition: [number, number];

  private keyDown$$: Subscription;
  private drawKeyUp$$: Subscription;
  private drawKeyDown$$: Subscription;

  private removedOlInteractions: OlInteraction[] = [];
  private olLinearRingsLayer: OlVectorLayer;

  // This is the geometry to test against when drawing holes
  private olOuterGeometry: OlGeometry;

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
  get olOverlaySource(): OlVectorSource {
    return this.olOverlayLayer.getSource();
  }

  /**
   * OL linear rings source
   * @internal
   */
  get olLinearRingsSource(): OlVectorSource {
    return this.olLinearRingsLayer.getSource();
  }

  constructor(private options: ModifyControlOptions) {
    if (options.layer !== undefined) {
      this.olOverlayLayer = options.layer;
    } else {
      this.olOverlayLayer = this.createOlInnerOverlayLayer();
    }
    this.olLinearRingsLayer = this.createOlLinearRingsLayer();
  }

  /**
   * Add or remove this control to/from a map.
   * @param map OL Map
   */
  setOlMap(olMap: OlMap | undefined) {
    if (olMap === undefined) {
      this.clearOlInnerOverlaySource();
      this.removeOlInnerOverlayLayer();
      this.removeOlModifyInteraction();
      this.removeOlTranslateInteraction();
      this.removeOlDrawInteraction();
      this.olMap = olMap;
      return;
    }

    this.olMap = olMap;
    this.addOlInnerOverlayLayer();
    this.addOlDrawInteraction();
    this.addOlTranslateInteraction();
    this.activateTranslateInteraction();
    this.addOlModifyInteraction();
    this.activateModifyInteraction();
  }

  /**
   * Return the overlay source
   */
  getSource(): OlVectorSource {
    return this.olOverlaySource;
  }

  /**
   * Add an OL geometry to the overlay and start modifying it
   * @param olGeometry Ol Geometry
   */
  setOlGeometry(olGeometry: OlGeometry) {
    const olFeature = new OlFeature({geometry: olGeometry});
    this.olOverlaySource.clear();
    this.olOverlaySource.addFeature(olFeature);
  }

  /**
   * Create an overlay source if none is defined in the options
   */
  private createOlInnerOverlayLayer(): OlVectorLayer {
    return new OlVectorLayer({
      source: this.options.source ? this.options.source : new OlVectorSource(),
      style: this.options.layerStyle,
      zIndex: 500
    });
  }

  /**
   * Add the overlay layer if it wasn't defined in the options
   */
  private addOlInnerOverlayLayer(): OlVectorLayer {
    if (this.options.layer === undefined) {
      this.olMap.addLayer(this.olOverlayLayer);
    }
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
   * Clear the overlay source if it wasn't defined in the options
   */
  private clearOlInnerOverlaySource() {
    if (this.options.layer === undefined && this.options.source === undefined) {
      this.olOverlaySource.clear();
    }
  }

  private createOlLinearRingsLayer(): OlVectorLayer {
    return new OlVectorLayer({
      source: new OlVectorSource(),
      style: createDrawHoleInteractionStyle(),
      zIndex: 500
    });
  }

  /**
   * Add the linear rings layer
   */
  private addOlLinearRingsLayer() {
    this.olMap.addLayer(this.olLinearRingsLayer);
  }

  /**
   * Clear the linear rings layer
   */
  private removeOlLinearRingsLayer() {
    this.olMap.removeLayer(this.olLinearRingsLayer);
  }

  /**
   * Clear the linear rings source
   */
  private clearOlLinearRingsSource() {
    this.olLinearRingsSource.clear(true);
  }

  /**
   * Add a modify interaction to the map an set up some listeners
   */
  private addOlModifyInteraction() {
    const olModifyInteraction = new OlModify({
      source: this.olOverlaySource,
      style: this.options.drawStyle
    });
    this.olModifyInteraction = olModifyInteraction;
  }

  /**
   * Remove the modify interaction
   */
  private removeOlModifyInteraction() {
    if (this.olModifyInteraction === undefined) {
      return;
    }

    this.deactivateModifyInteraction();
    this.olModifyInteraction = undefined;
  }

  private activateModifyInteraction() {
    if (this.olModifyInteractionIsActive === true) {
      return;
    }

    this.olModifyInteractionIsActive = true;
    this.onModifyStartKey = this.olModifyInteraction
      .on('modifystart', (event: OlModifyEvent) => this.onModifyStart(event));
    this.onModifyEndKey = this.olModifyInteraction
      .on('modifyend', (event: OlModifyEvent) => this.onModifyEnd(event));
    this.olMap.addInteraction(this.olModifyInteraction);
  }

  private deactivateModifyInteraction() {
    if (this.olModifyInteractionIsActive === false) {
      return;
    }

    this.olModifyInteractionIsActive = false;
    unByKey(this.onModifyStartKey);
    unByKey(this.onModifyEndKey);
    if (this.olMap !== undefined) {
      this.olMap.removeInteraction(this.olModifyInteraction);
    }
  }

  /**
   * When modifying starts, clear the overlay and start watching for changes
   * @param event Modify start event
   */
  private onModifyStart(event: OlModifyEvent) {
    const olGeometry = event.features.item(0).getGeometry();
    this.start$.next(olGeometry);
    this.onModifyKey = olGeometry.on('change', (olGeometryEvent: OlGeometryEvent) => {
      this.mousePosition = getMousePositionFromOlGeometryEvent(olGeometryEvent);
      this.changes$.next(olGeometryEvent.target);
    });
    this.subscribeToKeyDown();
  }

  /**
   * When modifying ends, update the geometry observable and stop watching for changes
   * @param event Modify end event
   */
  private onModifyEnd(event: OlModifyEvent) {
    if (this.onModifyKey !== undefined) {
      unByKey(this.onModifyKey);
    }
    this.end$.next(event.features.item(0).getGeometry());
    this.unsubscribeToKeyDown();
  }

  /**
   * Subscribe to CTRL key down to activate the draw control
   */
  private subscribeToKeyDown() {
    this.keyDown$$ = fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
      if (event.keyCode === 32) {
        // On space bar, pan to the current mouse position
        this.olMap.getView().animate({
          center: this.mousePosition,
          duration: 0
        });
        return;
      }
    });
  }

  /**
   * Unsubscribe to key down
   */
  private unsubscribeToKeyDown() {
    if (this.keyDown$$ !== undefined) {
      this.keyDown$$.unsubscribe();
    }
  }

  /**
   * Add a translate interaction to the map an set up some listeners
   */
  private addOlTranslateInteraction() {
    const olTranslateInteraction = new OlTranslate({
      layers: [this.olOverlayLayer]
    });
    this.olTranslateInteraction = olTranslateInteraction;
  }

  /**
   * Remove the translate interaction
   */
  private removeOlTranslateInteraction() {
    if (this.olTranslateInteraction === undefined) {
      return;
    }

    this.deactivateTranslateInteraction();
    this.olTranslateInteraction = undefined;
  }

  private activateTranslateInteraction() {
    if (this.olTranslateInteractionIsActive === true) {
      return;
    }

    this.olTranslateInteractionIsActive = true;
    this.onTranslateStartKey = this.olTranslateInteraction
      .on('translatestart', (event: OlTranslateEvent) => this.onTranslateStart(event));
    this.onTranslateEndKey = this.olTranslateInteraction
      .on('translateend', (event: OlTranslateEvent) => this.onTranslateEnd(event));
    this.olMap.addInteraction(this.olTranslateInteraction);
  }

  private deactivateTranslateInteraction() {
    if (this.olTranslateInteractionIsActive === false) {
      return;
    }

    this.olTranslateInteractionIsActive = false;
    unByKey(this.onTranslateStartKey);
    unByKey(this.onTranslateEndKey);
    if (this.olMap !== undefined) {
      this.olMap.removeInteraction(this.olTranslateInteraction);
    }
  }

  /**
   * When translation starts, clear the overlay and start watching for changes
   * @param event Translate start event
   */
  private onTranslateStart(event: OlTranslateEvent) {
    const olGeometry = event.features.item(0).getGeometry();
    this.start$.next(olGeometry);
    this.onTranslateKey = olGeometry.on('change', (olGeometryEvent: OlGeometryEvent) => {
      this.changes$.next(olGeometryEvent.target);
    });
  }

  /**
   * When translation ends, update the geometry observable and stop watchign for changes
   * @param event Translate end event
   */
  private onTranslateEnd(event: OlTranslateEvent) {
    if (this.onTranslateKey !== undefined) {
      unByKey(this.onTranslateKey);
    }
    this.end$.next(event.features.item(0).getGeometry());
  }

  /**
   * Add a draw interaction to the map an set up some listeners
   */
  private addOlDrawInteraction() {
    const olDrawInteraction = new OlDraw({
      type: 'Polygon',
      source: this.olLinearRingsSource,
      stopClick: true,
      style: createDrawHoleInteractionStyle(),
      condition: (event: OlMapBrowserEvent) => {
        const olOuterGeometry = this.olOuterGeometry || this.getOlGeometry();
        return olOuterGeometry.intersectsCoordinate(event.coordinate);
      }
    });

    this.olDrawInteraction = olDrawInteraction;
    this.subscribeToDrawKeyDown();
  }

  /**
   * Subscribe to CTRL key down to activate the draw control
   */
  private subscribeToDrawKeyDown() {
    this.drawKeyDown$$ = fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
      if (event.keyCode !== 17) { return; }

      this.unsubscribeToDrawKeyDown();

      const olGeometry = this.getOlGeometry();
      if (!olGeometry || !(olGeometry instanceof OlPolygon)) { return; }

      this.subscribeToDrawKeyUp();

      this.deactivateModifyInteraction();
      this.deactivateTranslateInteraction();
      this.activateDrawInteraction();
    });
  }

  /**
   * Subscribe to CTRL key up to deactivate the draw control
   */
  private subscribeToDrawKeyUp() {
    this.drawKeyUp$$ = fromEvent(document, 'keyup')
      .subscribe((event: KeyboardEvent) => {
        if (event.keyCode !== 17) {
          return;
        }

        this.unsubscribeToDrawKeyUp();
        this.unsubscribeToKeyDown();
        this.deactivateDrawInteraction();

        this.activateModifyInteraction();
        this.activateTranslateInteraction();
        this.subscribeToDrawKeyDown();

        this.end$.next(this.getOlGeometry());
      });
  }

  /**
   * Unsubscribe to draw key down
   */
  private unsubscribeToDrawKeyDown() {
    if (this.drawKeyDown$$ !== undefined) {
      this.drawKeyDown$$.unsubscribe();
    }
  }

  /**
   * Unsubscribe to key up
   */
  private unsubscribeToDrawKeyUp() {
    if (this.drawKeyUp$$ !== undefined) {
      this.drawKeyUp$$.unsubscribe();
    }
  }

  /**
   * Remove the draw interaction
   */
  private removeOlDrawInteraction() {
    if (this.olDrawInteraction === undefined) {
      return;
    }

    this.unsubscribeToKeyDown();
    this.unsubscribeToDrawKeyUp();
    this.unsubscribeToDrawKeyDown();
    this.deactivateDrawInteraction();
    this.olDrawInteraction = undefined;
  }

  /**
   * Activate the draw interaction
   */
  private activateDrawInteraction() {
    if (this.olDrawInteractionIsActive === true) {
      return;
    }

    this.clearOlLinearRingsSource();
    this.addOlLinearRingsLayer();

    this.olMap.getInteractions().forEach((olInteraction: OlInteraction) => {
      if (olInteraction instanceof OlDragBoxInteraction) {
        this.olMap.removeInteraction(olInteraction);
        this.removedOlInteractions.push(olInteraction);
      }
    });

    this.olDrawInteractionIsActive = true;
    this.onDrawStartKey = this.olDrawInteraction
      .on('drawstart', (event: OlDrawEvent) => this.onDrawStart(event));
    this.onDrawEndKey = this.olDrawInteraction
      .on('drawend', (event: OlDrawEvent) => this.onDrawEnd(event));
    this.olMap.addInteraction(this.olDrawInteraction);
  }

  /**
   * Deactivate the draw interaction
   */
  private deactivateDrawInteraction() {
    if (this.olDrawInteractionIsActive === false) {
      return;
    }

    this.removeOlLinearRingsLayer();

    this.removedOlInteractions.forEach((olInteraction: OlInteraction) => {
      this.olMap.addInteraction(olInteraction);
    });

    this.olDrawInteractionIsActive = false;
    unByKey(this.onDrawStartKey);
    unByKey(this.onDrawEndKey);
    if (this.olMap !== undefined) {
      this.olMap.removeInteraction(this.olDrawInteraction);
    }
  }

  /**
   * When draw start, add a new linerar ring to the geometry and start watching for changes
   * @param event Draw start event
   */
  private onDrawStart(event: OlDrawEvent) {
    const olGeometry = event.feature.getGeometry();
    this.olOuterGeometry = this.getOlGeometry().clone();

    const linearRingCoordinates = olGeometry.getLinearRing().getCoordinates();
    this.addLinearRingToOlGeometry(linearRingCoordinates);
    this.start$.next(this.getOlGeometry());

    this.onDrawKey = olGeometry.on('change', (olGeometryEvent: OlGeometryEvent) => {
      const _linearRingCoordinates = olGeometryEvent.target.getLinearRing().getCoordinates();
      this.updateLinearRingOfOlGeometry(_linearRingCoordinates);
      this.changes$.next(this.getOlGeometry());
    });
    this.subscribeToKeyDown();
  }

  /**
   * When translation ends, update the geometry observable and stop watchign for changes
   * @param event Draw end event
   */
  private onDrawEnd(event: OlDrawEvent) {
    if (this.onDrawKey !== undefined) {
      unByKey(this.onDrawKey);
    }

    this.olOuterGeometry = undefined;

    const linearRingCoordinates = event.feature.getGeometry().getLinearRing().getCoordinates();
    this.updateLinearRingOfOlGeometry(linearRingCoordinates);
    this.clearOlLinearRingsSource();
    this.end$.next(this.getOlGeometry());
    this.unsubscribeToKeyDown();
  }

  /**
   * Add a linear ring to the geometry being modified
   * @param coordinates Linear ring coordinates
   */
  private addLinearRingToOlGeometry(coordinates: number[]) {
    const olGeometry = this.getOlGeometry();
    const olLinearRing = new OlLinearRing(coordinates);
    addLinearRingToOlPolygon(olGeometry, olLinearRing);
  }

  /**
   * Update the last linear ring of the geometry being modified
   * @param coordinates Linear ring coordinates
   */
  private updateLinearRingOfOlGeometry(coordinates: number[]) {
    const olGeometry = this.getOlGeometry();
    // Remove the last linear ring (the one we are updating)
    const olLinearRings = olGeometry.getLinearRings().slice(0, -1);
    const newCoordinates = olLinearRings.map((olLinearRing: OlLinearRing) => {
      return olLinearRing.getCoordinates();
    });
    newCoordinates.push(coordinates);
    olGeometry.setCoordinates(newCoordinates);
  }

  /**
   * Get the geometry being modified
   * @returns OL Geometry
   */
  private getOlGeometry(): OlGeometry {
    const olFeatures = this.olOverlaySource.getFeatures();
    return olFeatures.length > 0 ? olFeatures[0].getGeometry() : undefined;
  }

}
