import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import OlFeature from 'ol/Feature';
import OlOverlay from 'ol/Overlay';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlCircle from 'ol/geom/Circle';
import OlGeometry from 'ol/geom/Geometry';
import type { Type } from 'ol/geom/Geometry';
import OlLineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import OlPoint from 'ol/geom/Point';
import OlPolygon from 'ol/geom/Polygon';
import OlVectorLayer from 'ol/layer/Vector';
import * as olproj from 'ol/proj';
import OlVectorSource from 'ol/source/Vector';
import * as OlStyle from 'ol/style';
import { StyleLike as OlStyleLike } from 'ol/style/Style';

import { Subscription } from 'rxjs';

import { IgoMap } from '../../map/shared/map';
import {
  MeasureLengthUnit,
  formatMeasure,
  measureOlGeometry,
  updateOlGeometryMidpoints
} from '../../measure';
import {
  DrawControl,
  ModifyControl,
  ModifyControlOptions
} from '../shared/controls';
import { GeoJSONGeometry } from '../shared/geometry.interfaces';
import { createDrawInteractionStyle } from '../shared/geometry.utils';
import { DrawControlOptions } from './../shared/controls/draw';

interface HasRadius {
  getRadius: () => number;
  setRadius: (radius: number) => void;
}

/**
 * This input allows a user to draw a new geometry or to edit
 * an existing one on a map. A text input is also displayed in the
 * form with some instructions.
 * This is still WIP.
 */
@Component({
  selector: 'igo-geometry-form-field-input',
  templateUrl: './geometry-form-field-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class GeometryFormFieldInputComponent
  implements OnInit, OnDestroy, ControlValueAccessor
{
  private olOverlayLayer: OlVectorLayer<OlVectorSource>;
  private olGeoJSON = new OlGeoJSON();
  private ready = false;

  private drawControl: DrawControl;
  private modifyControl: ModifyControl;
  private defaultDrawStyleRadius: number;
  private olGeometryEnds$$: Subscription;
  private olGeometryChanges$$: Subscription;
  private olTooltip = this.createMeasureTooltip();

  /**
   * Active control
   * @internal
   */
  public activeControl: DrawControl | ModifyControl;

  /**
   * The map to draw the geometry on
   */
  @Input() map: IgoMap;

  /**
   * The geometry type
   */
  @Input()
  set geometryType(value: Type) {
    this._geometryType = value;
    if (this.ready === false) {
      return;
    }

    this.deactivateControl();
    this.createDrawControl();
    this.drawControl.freehand$.next(this.freehandDrawIsActive);
    this.toggleControl();
  }
  get geometryType(): Type {
    return this._geometryType;
  }
  private _geometryType: Type;

  /**
   * The drawGuide around the mouse pointer to help drawing
   */
  @Input() drawGuide: number = null;

  /**
   * Whether a measure tooltip should be displayed
   */
  @Input() measure = false;

  /**
   * Whether draw control should be active or not
   */
  @Input()
  get drawControlIsActive(): boolean {
    return this._drawControlIsActive;
  }
  set drawControlIsActive(value: boolean) {
    this._drawControlIsActive = value;
    if (this.ready === false) {
      return;
    }
    this.deactivateControl();
    if (!this._drawControlIsActive) {
      return;
    } else {
      this.toggleControl();
    }
  }
  private _drawControlIsActive = true;

  /**
   * Whether freehand draw control should be active or not
   */
  @Input()
  get freehandDrawIsActive(): boolean {
    return this._freehandDrawIsActive;
  }
  set freehandDrawIsActive(value: boolean) {
    this._freehandDrawIsActive = value;
    this.deactivateControl();

    this.createDrawControl();
    this.createModifyControl();

    this.drawControl.freehand$.next(this.freehandDrawIsActive);

    if (this.ready === false) {
      return;
    }

    if (!this.drawControlIsActive) {
      return;
    }
    this.toggleControl();
  }
  private _freehandDrawIsActive: boolean;

  /**
   * Whether freehand draw control should be active or not
   */
  @Input()
  get predefinedRadius(): boolean {
    return this._predefinedRadius;
  }
  set predefinedRadius(value: boolean) {
    this._predefinedRadius = value;
    this.drawControl.ispredefinedRadius$.next(value);
  }
  private _predefinedRadius: boolean;

  /**
   * Control options
   */
  @Input() controlOptions: Record<string, any> = {};

  /**
   * Style for the draw control (applies while the geometry is being drawn)
   */
  @Input()
  set drawStyle(value: OlStyleLike | OlStyle.RegularShape) {
    if (value === undefined) {
      value = createDrawInteractionStyle();
    }
    this._drawStyle = value;

    const olGuideStyle = this.getGuideStyleFromDrawStyle(value);
    if (olGuideStyle !== undefined) {
      this.defaultDrawStyleRadius = olGuideStyle.getRadius();
    } else {
      this.defaultDrawStyleRadius = null;
    }

    if (this.ready === false) {
      return;
    }

    this.deactivateControl();
    this.createDrawControl();
    this.createModifyControl();

    this.drawControl.freehand$.next(this.freehandDrawIsActive);
    this.toggleControl();
  }
  get drawStyle(): OlStyleLike | OlStyle.RegularShape {
    return this._drawStyle;
  }
  private _drawStyle: OlStyleLike | OlStyle.RegularShape;

  /**
   * Style for the overlay layer (applies once the geometry is added to the map)
   * If not specified, drawStyle applies
   */
  @Input()
  set overlayStyle(value: OlStyleLike | OlStyle.RegularShape) {
    this._overlayStyle = value;
  }
  get overlayStyle(): OlStyleLike | OlStyle.RegularShape {
    return this._overlayStyle;
  }
  private _overlayStyle: OlStyleLike | OlStyle.RegularShape;

  /**
   * The geometry value (GeoJSON)
   * Implemented as part of ControlValueAccessor.
   */
  @Input()
  set value(value: GeoJSONGeometry) {
    this._value = value;
    if (this.ready === false) {
      return;
    }

    if (value) {
      this.addGeoJSONToOverlay(value);
    } else {
      this.olOverlaySource.clear(true);
    }
    this.onChange(value);
    this.toggleControl();
    this.cdRef.detectChanges();
  }
  get value(): GeoJSONGeometry {
    return this._value;
  }
  private _value: GeoJSONGeometry;

  /**
   * The vector source to add the geometry to
   * @internal
   */
  get olOverlaySource(): OlVectorSource {
    return this.olOverlayLayer.getSource();
  }

  @Input()
  set radius(value: any) {
    if (this.ready === false) {
      return;
    }
    if (this.modifyControl.getSource()) {
      this.modifyControl.getSource().refresh();
    }
    if (this.freehandDrawIsActive) {
      let olModify;
      setTimeout(() => {
        olModify = this.modifyControl.olModifyInteraction;
        if (olModify) {
          if (olModify.features_) {
            olModify.features_.clear();
            this.addGeoJSONToOverlay(this.value);
          }
        }
      }, 0);
    }
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl !== undefined) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  /**
   * Create an overlay layer, add the initial geometry to it (if any)
   * and toggle the right interaction.
   * @internal
   */
  ngOnInit() {
    if (this.drawStyle === undefined) {
      this.drawStyle = createDrawInteractionStyle();
    }

    if (this.overlayStyle === undefined) {
      this.overlayStyle = this.drawStyle;
    }

    this.addOlOverlayLayer();
    this.createDrawControl();
    this.createModifyControl();

    if (this.value) {
      this.addGeoJSONToOverlay(this.value);
    }
    this.toggleControl();

    this.ready = true;
  }

  /**
   * Clear the overlay layer and any interaction added by this component.
   * @internal
   */
  ngOnDestroy() {
    // This is mandatory when the form control is reused after
    // this component has been destroyed. It seems like the control
    // keeps a reference to this component even after it's destroyed
    // and it attempts to set it's value
    this.ready = false;

    this.deactivateControl();
    this.olOverlaySource.clear();
    this.map.ol.removeLayer(this.olOverlayLayer);
  }

  /**
   * Implemented as part of ControlValueAccessor.
   */
  registerOnChange(fn: Function) {
    this.onChange = fn;
  }
  private onChange: any = () => {};

  /**
   * Implemented as part of ControlValueAccessor.
   */
  registerOnTouched(fn: Function) {
    this.onTouched = fn;
  }
  private onTouched: any = () => {};

  /**
   * Implemented as part of ControlValueAccessor.
   */
  writeValue(value: GeoJSONGeometry) {
    this.value = value;
  }

  /**
   * Add an overlay layer to the map
   */
  private addOlOverlayLayer() {
    this.olOverlayLayer = new OlVectorLayer({
      source: new OlVectorSource(),
      zIndex: 500,
      style: null
    });
    this.map.ol.addLayer(this.olOverlayLayer);
  }

  /**
   * Create a draw control and subscribe to it's geometry
   */
  private createDrawControl() {
    const controlOptions = Object.assign({}, this.controlOptions, {
      geometryType: this.geometryType || 'Point',
      drawingLayer: this.olOverlayLayer,
      interactionStyle:
        typeof this.drawStyle === 'function'
          ? this.drawStyle
          : (olFeature: OlFeature<OlGeometry>, resolution: number) => {
              const style = this.drawStyle;
              this.updateDrawStyleWithDrawGuide(style, resolution);
              return style;
            }
    }) as DrawControlOptions;
    this.drawControl = new DrawControl(controlOptions);
  }

  /**
   * Create a modify control and subscribe to it's geometry
   */
  private createModifyControl() {
    const controlOptions = Object.assign({}, this.controlOptions, {
      layer: this.olOverlayLayer,
      drawStyle:
        typeof this.drawStyle === 'function'
          ? this.drawStyle
          : (olFeature: OlFeature<OlGeometry>, resolution: number) => {
              const style = this.drawStyle;
              this.updateDrawStyleWithDrawGuide(style, resolution);
              return style;
            }
    }) as ModifyControlOptions;
    this.modifyControl = new ModifyControl(controlOptions);
  }

  /**
   * Toggle the proper control (draw or modify)
   */
  private toggleControl() {
    let activate;
    if (!this.value && this.geometryType) {
      activate = this.drawControl;
    } else {
      activate = this.modifyControl;
    }

    // If the control that should be activated
    // is not the same as the current active control,
    // deactivate the current control and activate the new one
    // Otherwise, do nothing and keep the current control active
    if (activate !== this.activeControl) {
      this.deactivateControl();
      this.activateControl(activate);
    }
  }

  /**
   * Activate a given control
   * @param control Control
   */
  private activateControl(control: DrawControl | ModifyControl) {
    this.activeControl = control;
    this.olGeometryEnds$$ = control.end$.subscribe((olGeometry: OlGeometry) =>
      this.onOlGeometryEnds(olGeometry)
    );
    if (this.measure === true && control === this.drawControl) {
      this.olGeometryChanges$$ = control.changes$.subscribe(
        (olGeometry: OlPolygon | OlPoint | OlLineString | OlCircle) =>
          this.onOlGeometryChanges(olGeometry)
      );
    }
    control.setOlMap(this.map.ol, false);
  }

  /**
   * Deactivate the active control
   */
  private deactivateControl() {
    this.removeMeasureTooltip();
    if (this.activeControl !== undefined) {
      this.activeControl.setOlMap(undefined);
    }
    if (this.olGeometryEnds$$ !== undefined) {
      this.olGeometryEnds$$.unsubscribe();
    }
    if (this.olGeometryChanges$$ !== undefined) {
      this.olGeometryChanges$$.unsubscribe();
    }
    this.activeControl = undefined;
  }

  /**
   * Update measures observables and map tooltips
   * @param olGeometry Ol linestring or polygon
   */
  private onOlGeometryEnds(olGeometry: OlGeometry | undefined) {
    this.removeMeasureTooltip();
    this.setOlGeometry(olGeometry);
  }

  /**
   * Update measures observables and map tooltips
   * @param olGeometry Ol linestring or polygon
   */
  private onOlGeometryChanges(
    olGeometry: OlPolygon | OlPoint | OlLineString | OlCircle
  ) {
    if (olGeometry.getType() !== 'Point') {
      this.updateMeasureTooltip(olGeometry);
    }
  }

  /**
   * When drawing ends, convert the output value to GeoJSON and keep it.
   * Restore the double click interaction.
   * @param olGeometry OL geometry
   */
  private setOlGeometry(olGeometry: OlGeometry | undefined) {
    let value;
    if (olGeometry === undefined) {
      return;
    }

    if (olGeometry.getType() === 'Circle') {
      // Because Circle doesn't exist as a GeoJSON object
      olGeometry = this.circleToPoint(olGeometry);
    }

    value = this.olGeoJSON.writeGeometryObject(olGeometry, {
      featureProjection: this.map.projection,
      dataProjection: 'EPSG:4326'
    });
    if (olGeometry.get('radius')) {
      value.radius = olGeometry.get('radius');
      olGeometry.set('radius', value.radius);
    }
    this.writeValue(value);
  }

  private circleToPoint(olGeometry) {
    const center = olGeometry.getCenter();
    const coordinates = olproj.transform(
      center,
      this.map.projection,
      'EPSG:4326'
    );
    const radius = Math.round(
      olGeometry.getRadius() * Math.cos((Math.PI / 180) * coordinates[1])
    );

    // Convert it to a point object
    olGeometry = new Point(center);
    olGeometry.set('radius', radius, true);
    return olGeometry;
  }

  /**
   * Add a GeoJSON geometry to the overlay
   * @param geometry GeoJSON geometry
   */
  private addGeoJSONToOverlay(geometry: GeoJSONGeometry) {
    const olGeometry = this.olGeoJSON.readGeometry(geometry, {
      dataProjection: 'EPSG:4326',
      featureProjection: this.map.projection
    });
    const olFeature = new OlFeature({
      geometry: olGeometry
    });
    olFeature.setStyle(this.overlayStyle as OlStyle.Style);
    this.olOverlaySource.clear();
    this.olOverlaySource.addFeature(olFeature);
  }

  /**
   * Create the measure tooltip
   */
  private createMeasureTooltip() {
    return new OlOverlay({
      element: document.createElement('div'),
      offset: [-30, -10],
      className: ['igo-map-tooltip', 'igo-map-tooltip-measure'].join(' '),
      stopEvent: false
    });
  }

  /**
   * Update the measure tooltip of an OL geometry
   * @param olGeometry OL Geometry
   */
  private updateMeasureTooltip(
    olGeometry: OlPolygon | OlPoint | OlLineString | OlCircle
  ) {
    const measure = measureOlGeometry(olGeometry, this.map.projection);
    const lengths = measure.lengths;
    const lastIndex =
      olGeometry.getType() === 'Polygon'
        ? lengths.length - 2
        : lengths.length - 1;
    const lastLength = lengths[lastIndex];

    const olMidpoints = updateOlGeometryMidpoints(olGeometry);
    const olLastMidpoint = olMidpoints[lastIndex];
    if (olMidpoints.length === 0 || olLastMidpoint === undefined) {
      this.removeMeasureTooltip();
      return;
    }

    this.olTooltip.setPosition(olLastMidpoint.getFlatCoordinates());

    const innerHtml = formatMeasure(lastLength, {
      decimal: 1,
      unit: MeasureLengthUnit.Meters,
      unitAbbr: true,
      locale: 'fr'
    });
    this.olTooltip.getElement().innerHTML = innerHtml;
    if (this.olTooltip.getMap() === undefined) {
      this.map.ol.addOverlay(this.olTooltip);
    }
  }

  /**
   * Remove the measure tooltip from the map
   */
  private removeMeasureTooltip() {
    if (this.olTooltip.getMap && this.olTooltip.getMap() !== undefined) {
      this.map.ol.removeOverlay(this.olTooltip);
      this.olTooltip.setMap(undefined);
    }
  }

  /**
   * Adjust the draw style with the specified draw guide distance, if possible
   * @param olStyle Draw style to update
   * @param resolution Resolution (to make the screen size of symbol fit the drawGuide value)
   */
  private updateDrawStyleWithDrawGuide(
    olStyle: OlStyleLike | OlStyle.RegularShape,
    resolution: number
  ) {
    const olGuideStyle = this.getGuideStyleFromDrawStyle(olStyle);
    if (olGuideStyle === undefined) {
      return;
    }
    const drawGuide = this.drawGuide;
    let radius;
    if (!drawGuide || drawGuide < 0) {
      radius = this.defaultDrawStyleRadius;
    } else {
      radius = drawGuide > 0 ? drawGuide / resolution : drawGuide;
    }
    olGuideStyle.setRadius(radius);
  }

  /**
   * Returns wether a given Open Layers style has a radius property that can be set (used to set draw guide)
   * @param olStyle The style on which to perform the check
   */
  private getGuideStyleFromDrawStyle(
    olStyle: OlStyleLike | OlStyle.RegularShape
  ): HasRadius | undefined {
    let baseStyle: unknown;
    if (Array.isArray(olStyle)) {
      baseStyle = olStyle[0];
    } else {
      baseStyle = olStyle;
    }

    if (typeof (baseStyle as any).getImage === 'function') {
      baseStyle = (baseStyle as any).getImage() as OlStyle.Image;
    }

    let guideStyle: HasRadius;
    if (typeof (baseStyle as any).setRadius === 'function') {
      guideStyle = baseStyle as HasRadius;
    }

    return guideStyle;
  }
}
