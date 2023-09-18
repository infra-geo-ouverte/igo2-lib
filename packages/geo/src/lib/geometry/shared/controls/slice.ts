import OlMap from 'ol/Map';
import OlFeature from 'ol/Feature';
import { StyleLike as OlStyleLike } from 'ol/style/Style';
import OlVectorSource from 'ol/source/Vector';
import OlVectorLayer from 'ol/layer/Vector';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import OlLineString from 'ol/geom/LineString';

import { Subject, Subscription } from 'rxjs';

import { GeometrySliceError } from '../geometry.errors';
import { sliceOlGeometry } from '../geometry.utils';
import { DrawControl } from './draw';

export interface SliceControlOptions {
  source?: OlVectorSource<OlGeometry>;
  layer?: OlVectorLayer<OlVectorSource<OlGeometry>>;
  layerStyle?: OlStyleLike;
  drawStyle?: OlStyleLike;
}

/**
 * Control to modify geometries
 */
export class SliceControl {
  /**
   * Slice end observable
   */
  public end$: Subject<OlGeometry[]> = new Subject();

  /**
   * Slice error, if any
   */
  public error$: Subject<GeometrySliceError> = new Subject();

  private olMap: OlMap;
  private olOverlayLayer: OlVectorLayer<OlVectorSource<OlGeometry>>;

  /**
   * Draw line control
   */
  private drawLineControl: DrawControl;

  /**
   * Subscription to draw start
   */
  private drawLineStart$$: Subscription;

  /**
   * Subscription to draw end
   */
  private drawLineEnd$$: Subscription;

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
  get olOverlaySource(): OlVectorSource<OlGeometry> {
    return this.olOverlayLayer.getSource();
  }

  constructor(private options: SliceControlOptions) {
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
      this.removeDrawLineControl();
      this.olMap = olMap;
      return;
    }

    this.olMap = olMap;
    this.addOlInnerOverlayLayer();
    this.addDrawLineControl();
  }

  /**
   * Return the overlay source
   */
  getSource(): OlVectorSource<OlGeometry> {
    return this.olOverlaySource;
  }

  /**
   * Add an OL geometry to the overlay for slicing
   * @param olGeometry Ol Geometry
   */
  setOlGeometry(olGeometry: OlGeometry) {
    const olFeature = new OlFeature({ geometry: olGeometry });
    this.olOverlaySource.clear(true);
    this.olOverlaySource.addFeature(olFeature);
  }

  /**
   * Create an overlay source if none is defined in the options
   */
  private createOlInnerOverlayLayer(): OlVectorLayer<
    OlVectorSource<OlGeometry>
  > {
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
   * Create a draw line control and add it to the map
   */
  private addDrawLineControl() {
    this.drawLineControl = new DrawControl({
      geometryType: 'LineString',
      interactionStyle: this.options.drawStyle,
      maxPoints: 2
    });
    this.drawLineStart$$ = this.drawLineControl.start$.subscribe(
      (olLine: OlLineString) => this.onDrawLineStart(olLine)
    );
    this.drawLineEnd$$ = this.drawLineControl.end$.subscribe(
      (olLine: OlLineString) => this.onDrawLineEnd(olLine)
    );
    this.drawLineControl.setOlMap(this.olMap);
  }

  /**
   * Remove draw line control
   */
  private removeDrawLineControl() {
    if (this.drawLineControl === undefined) {
      return;
    }

    this.drawLineStart$$.unsubscribe();
    this.drawLineEnd$$.unsubscribe();
    this.drawLineControl.getSource().clear(true);
    this.drawLineControl.setOlMap(undefined);
  }

  /**
   * Clear the draw source and track the geometry being draw
   * @param olLine Ol linestring or polygon
   */
  private onDrawLineStart(olLine: OlLineString) {
    this.drawLineControl.getSource().clear(true);
  }

  /**
   * Slice the first geometry encountered with the drawn line
   * @param olLine Ol linestring
   */
  private onDrawLineEnd(olLine: OlLineString) {
    const olSlicedGeometries = [];
    const lineExtent = olLine.getExtent();

    const olFeaturesToRemove = [];
    try {
      this.olOverlaySource.forEachFeatureInExtent(
        lineExtent,
        (olFeature: OlFeature<OlGeometry>) => {
          const olGeometry = olFeature.getGeometry() as any;
          const olParts = sliceOlGeometry(olGeometry, olLine);
          if (olParts.length > 0) {
            olSlicedGeometries.push(...olParts);
            olFeaturesToRemove.push(olFeature);
          }
        }
      );
    } catch (e) {
      if (e instanceof GeometrySliceError) {
        this.error$.next(e);
        return;
      } else {
        throw e;
      }
    }

    this.drawLineControl.getSource().clear(true);

    this.olOverlaySource.addFeatures(
      olSlicedGeometries.map(
        (olGeometry: OlGeometry) => new OlFeature(olGeometry)
      )
    );
    olFeaturesToRemove.forEach((olFeature: OlFeature<OlGeometry>) => {
      this.olOverlaySource.removeFeature(olFeature);
    });

    this.error$.next(undefined);
    this.end$.next(olSlicedGeometries);
  }
}
