import OlMap from 'ol/Map';
import OlFeature from 'ol/Feature';
import * as OlStyle from 'ol/style';
import OlVectorSource from 'ol/source/Vector';
import OlVectorLayer from 'ol/layer/Vector';
import OlModify from 'ol/interaction/Modify';
import OlTranslate from 'ol/interaction/Translate';
import OlDraw from 'ol/interaction/Draw';
import OlPolygon from 'ol/geom/Polygon';
import OlLineString from 'ol/geom/LineString';
import OlCircle from 'ol/geom/Circle';
import OlLinearRing from 'ol/geom/LinearRing';
import OlInteraction from 'ol/interaction/Interaction';
import OlDragBoxInteraction from 'ol/interaction/DragBox';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import BasicEvent from 'ol/events/Event';
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
  source?: OlVectorSource<any>;
  layer?: OlVectorLayer<any>;
  layerStyle?: OlStyle.Style | ((olfeature: OlFeature<any>) => OlStyle.Style);
  drawStyle?: OlStyle.Style | ((olfeature: OlFeature<any>) => OlStyle.Style) | OlStyle.Circle |
    ((olfeature: OlFeature<OlGeometry>) => OlStyle.Circle);
  modify?: boolean;
  translate?: boolean;
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
  private olOverlayLayer: OlVectorLayer<any>;
  public olModifyInteraction: OlModify;
  private onModifyStartKey: any;
  private onModifyEndKey: any;
  private onModifyKey: any;
  private olModifyInteractionIsActive: boolean = false;
  private olTranslateInteraction: OlTranslate;
  private onTranslateStartKey: any;
  private onTranslateEndKey: any;
  private onTranslateKey: any;
  private olTranslateInteractionIsActive: boolean = false;
  private olDrawInteraction: OlDraw;
  private onDrawStartKey: any;
  private onDrawEndKey: any;
  private onDrawKey: any;
  private olDrawInteractionIsActive: boolean = false;

  private mousePosition: [number, number];

  private keyDown$$: Subscription;
  private drawKeyUp$$: Subscription;
  private drawKeyDown$$: Subscription;

  private removedOlInteractions: OlInteraction[] = [];
  private olLinearRingsLayer: OlVectorLayer<any>;

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
  get olOverlaySource(): OlVectorSource<any> {
    return this.olOverlayLayer.getSource();
  }

  /**
   * OL linear rings source
   * @internal
   */
  get olLinearRingsSource(): OlVectorSource<any> {
    return this.olLinearRingsLayer.getSource();
  }

  /**
   * Whether a modify control should be available
   */
  private modify: boolean = true;

  /**
   * Whether a translate control should be available
   */
  private translate: boolean = true;

  constructor(private options: ModifyControlOptions) {
    if (options.modify !== undefined) {
      this.modify = options.modify;
    }
    if (options.translate !== undefined) {
      this.translate = options.translate;
    }

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

    // The order in which these interactions
    // are added is important
    if (this.modify === true) {
      this.addOlDrawInteraction();
    }

    if (this.translate === true) {
      this.addOlTranslateInteraction();
      this.activateTranslateInteraction();
    }

    if (this.modify === true) {
      this.addOlModifyInteraction();
      this.activateModifyInteraction();
    }
  }

  /**
   * Return the overlay source
   */
  getSource(): OlVectorSource<any> {
    return this.olOverlaySource;
  }

  /**
   * Add an OL geometry to the overlay and start modifying it
   * @param olGeometry Ol Geometry
   */
  setOlGeometry(olGeometry: OlGeometry) {
    const olFeature = new OlFeature({ geometry: olGeometry });
    this.olOverlaySource.clear();
    this.olOverlaySource.addFeature(olFeature);
  }

  /**
   * Create an overlay source if none is defined in the options
   */
  private createOlInnerOverlayLayer(): OlVectorLayer<any> {
    return new OlVectorLayer({
      source: this.options.source ? this.options.source : new OlVectorSource(),
      style: this.options.layerStyle,
      zIndex: 500
    });
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
      this.olOverlaySource.clear(true);
    }
  }

  private createOlLinearRingsLayer(): OlVectorLayer<any> {
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
      style: this.options.drawStyle as OlStyle.Style
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
    this.onModifyStartKey = this.olModifyInteraction.on(
      'modifystart',
      (event: OlModifyEvent) => this.onModifyStart(event)
    );
    this.onModifyEndKey = this.olModifyInteraction.on(
      'modifyend',
      (event: OlModifyEvent) => this.onModifyEnd(event)
    );
    this.olMap.addInteraction(this.olModifyInteraction);
  }

  private deactivateModifyInteraction() {
    if (this.olModifyInteractionIsActive === false) {
      return;
    }

    this.olModifyInteractionIsActive = false;

    unByKey([this.onModifyStartKey, this.onModifyEndKey, this.onModifyKey]);
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
    this.onModifyKey = olGeometry.on(
      'change',
      (olGeometryEvent: BasicEvent) => {
        this.mousePosition = getMousePositionFromOlGeometryEvent(
          olGeometryEvent
        );
        this.changes$.next(olGeometryEvent.target as OlLineString | OlCircle | OlPolygon);
      }
    );
    this.subscribeToKeyDown();
  }

  /**
   * When modifying ends, update the geometry observable and stop watching for changes
   * @param event Modify end event
   */
  private onModifyEnd(event: OlModifyEvent) {
    unByKey(this.onModifyKey);
    this.end$.next(event.features.item(0).getGeometry());
    this.unsubscribeToKeyDown();
  }

  /**
   * Subscribe to space key down to pan the map
   */
  private subscribeToKeyDown() {
    this.keyDown$$ = fromEvent(document, 'keydown').subscribe(
      (event: KeyboardEvent) => {
        if (event.key === ' ') {
          // On space bar, pan to the current mouse position
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
    this.onTranslateStartKey = this.olTranslateInteraction.on(
      'translatestart',
      (event: OlTranslateEvent) => this.onTranslateStart(event)
    );
    this.onTranslateEndKey = this.olTranslateInteraction.on(
      'translateend',
      (event: OlTranslateEvent) => this.onTranslateEnd(event)
    );
    this.olMap.addInteraction(this.olTranslateInteraction);
  }

  private deactivateTranslateInteraction() {
    if (this.olTranslateInteractionIsActive === false) {
      return;
    }

    this.olTranslateInteractionIsActive = false;
    unByKey([
      this.onTranslateStartKey,
      this.onTranslateEndKey,
      this.onTranslateKey
    ]);
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
    this.onTranslateKey = olGeometry.on(
      'change',
      (olGeometryEvent: BasicEvent) => {
        // this.changes$.next(olGeometryEvent.target);
      }
    );
  }

  /**
   * When translation ends, update the geometry observable and stop watchign for changes
   * @param event Translate end event
   */
  private onTranslateEnd(event: OlTranslateEvent) {
    unByKey(this.onTranslateKey);
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
      condition: (event: MapBrowserEvent<any>) => {
        const olOuterGeometry = this.olOuterGeometry || this.getOlGeometry();
        const intersects = olOuterGeometry.intersectsCoordinate(
          event.coordinate
        );
        return intersects;
      }
    });

    this.olDrawInteraction = olDrawInteraction;
    this.subscribeToDrawKeyDown();
  }

  /**
   * Subscribe to CTRL key down to activate the draw control
   */
  private subscribeToDrawKeyDown() {
    this.drawKeyDown$$ = fromEvent(document, 'keydown').subscribe(
      (event: KeyboardEvent) => {
        if (event.key !== 'Control') {
          return;
        }

        this.unsubscribeToDrawKeyDown();

        const olGeometry = this.getOlGeometry();
        if (!olGeometry || !(olGeometry instanceof OlPolygon)) {
          return;
        }

        this.subscribeToDrawKeyUp();

        this.deactivateModifyInteraction();
        this.deactivateTranslateInteraction();
        this.activateDrawInteraction();
      }
    );
  }

  /**
   * Subscribe to CTRL key up to deactivate the draw control
   */
  private subscribeToDrawKeyUp() {
    this.drawKeyUp$$ = fromEvent(document, 'keyup').subscribe(
      (event: KeyboardEvent) => {
        if (event.key !== 'Control') {
          return;
        }

        this.unsubscribeToDrawKeyUp();
        this.unsubscribeToKeyDown();
        this.deactivateDrawInteraction();

        this.activateModifyInteraction();
        if (this.translate === true) {
          this.activateTranslateInteraction();
        }
        this.subscribeToDrawKeyDown();

        this.olOuterGeometry = undefined;
        this.clearOlLinearRingsSource();
        this.end$.next(this.getOlGeometry());
      }
    );
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
    this.clearOlLinearRingsSource();
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
    this.onDrawStartKey = this.olDrawInteraction.on(
      'drawstart',
      (event: OlDrawEvent) => this.onDrawStart(event)
    );
    this.onDrawEndKey = this.olDrawInteraction.on(
      'drawend',
      (event: OlDrawEvent) => this.onDrawEnd(event)
    );
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
    this.removedOlInteractions = [];

    this.olDrawInteractionIsActive = false;
    unByKey([this.onDrawStartKey, this.onDrawEndKey, this.onDrawKey]);
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

    this.onDrawKey = olGeometry.on(
      'change',
      (olGeometryEvent: BasicEvent) => {
        this.mousePosition = getMousePositionFromOlGeometryEvent(
          olGeometryEvent
        );
        const olGeometryTarget = olGeometryEvent.target as OlPolygon;
        const _linearRingCoordinates = olGeometryTarget
          .getLinearRing(0)
          .getCoordinates();
        this.updateLinearRingOfOlGeometry(_linearRingCoordinates);
        this.changes$.next(this.getOlGeometry());
      }
    );
    this.subscribeToKeyDown();
  }

  /**
   * When translation ends, update the geometry observable and stop watchign for changes
   * @param event Draw end event
   */
  private onDrawEnd(event: OlDrawEvent) {
    unByKey(this.onDrawKey);
    this.olOuterGeometry = undefined;

    const linearRingCoordinates = event.feature
      .getGeometry()
      .getLinearRing()
      .getCoordinates();
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
    const olGeometry = this.getOlGeometry() as OlPolygon;
    const olLinearRing = new OlLinearRing(coordinates);
    addLinearRingToOlPolygon(olGeometry, olLinearRing);
  }

  /**
   * Update the last linear ring of the geometry being modified
   * @param coordinates Linear ring coordinates
   */
  private updateLinearRingOfOlGeometry(coordinates: number[][]) {
    const olGeometry = this.getOlGeometry() as OlPolygon;
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
