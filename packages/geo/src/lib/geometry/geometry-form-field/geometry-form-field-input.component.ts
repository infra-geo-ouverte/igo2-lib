import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Optional,
  Self,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgControl, ControlValueAccessor } from '@angular/forms';

import { Subscription } from 'rxjs';

import * as OlStyle from 'ol/style';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlGeometry from 'ol/geom/Geometry';
import OlGeometryType from 'ol/geom/GeometryType';
import OlFeature from 'ol/Feature';
import OlVectorSource from 'ol/source/Vector';
import OlVectorLayer from 'ol/layer/Vector';
import OlOverlay from 'ol/Overlay';

import { IgoMap } from '../../map';
import {
  MeasureLengthUnit,
  updateOlGeometryMidpoints,
  formatMeasure,
  measureOlGeometry
} from '../../measure';
import { DrawControl, ModifyControl } from '../shared/controls';
import { createDrawInteractionStyle } from '../shared/geometry.utils';
import { GeoJSONGeometry } from '../shared/geometry.interfaces';

/**
 * This input allows a user to draw a new geometry or to edit
 * an existing one on a map. A text input is also displayed in the
 * form with some instructions.
 * This is still WIP.
 */
@Component({
  selector: 'igo-geometry-form-field-input',
  templateUrl: './geometry-form-field-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryFormFieldInputComponent implements OnInit, OnDestroy, ControlValueAccessor {

  private olOverlayLayer: OlVectorLayer;
  private olGeoJSON = new OlGeoJSON();
  private ready = false;

  private drawControl: DrawControl;
  private modifyControl: ModifyControl;
  private defaultDrawStyleRadius: number;
  private olGeometryEnds$$: Subscription;
  private olGeometryChanges$$: Subscription;
  private olTooltip = OlOverlay;

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
  set geometryType(value: OlGeometryType) {
    this._geometryType = value;
    if (this.ready === false) {
      return;
    }
    this.deactivateControl();
    this.createDrawControl();
    this.toggleControl();
  }
  get geometryType(): OlGeometryType { return this._geometryType; }
  private _geometryType: OlGeometryType;

  /**
   * The drawGuide around the mouse pointer to help drawing
   */
  @Input() drawGuide: number = null;

  /**
   * Whether a measure tooltip should be displayed
   */
  @Input() measure: boolean = false;

  /**
   * Style for the draw control (applies while the geometry is being drawn)
   */
  @Input()
  set drawStyle(value: OlStyle) {
    this._drawStyle = value;
    if (value && this.isStyleWithRadius(value)) {
      this.defaultDrawStyleRadius = value.getImage().getRadius();
    } else {
      this.defaultDrawStyleRadius = null;
    }
  }
  get drawStyle(): OlStyle { return this._drawStyle; }
  private _drawStyle: OlStyle;

  /**
   * Style for the overlay layer (applies once the geometry is added to the map)
   * If not specified, drawStyle applies
   */
  @Input()
  set overlayStyle(value: OlStyle) { this._overlayStyle = value; }
  get overlayStyle(): OlStyle { return this._overlayStyle; }
  private _overlayStyle: OlStyle;

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
      this.olOverlaySource.clear();
    }

    this.onChange(value);
    this.toggleControl();
    this.cdRef.detectChanges();
  }
  get value(): GeoJSONGeometry { return this._value; }
  private _value: GeoJSONGeometry;

  /**
   * The vector source to add the geometry to
   * @internal
   */
  get olOverlaySource(): OlVectorSource {
    return this.olOverlayLayer.getSource();
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
    this.createMeasureTooltip();
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
  // tslint:disable-next-line:ban-types
  registerOnChange(fn: Function) {
    this.onChange = fn;
  }
  private onChange: any = () => {};

  /**
   * Implemented as part of ControlValueAccessor.
   */
  // tslint:disable-next-line:ban-types
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
  private addOlOverlayLayer(): OlVectorLayer {
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
    this.drawControl = new DrawControl({
      geometryType: this.geometryType || 'Point',
      layer: this.olOverlayLayer,
      drawStyle: (olFeature: OlFeature, resolution: number) => {
        const style = this.drawStyle;
        this.updateDrawStyleWithDrawGuide(style, resolution);
        return style;
      }
    });
  }

  /**
   * Create a modify control and subscribe to it's geometry
   */
  private createModifyControl() {
    this.modifyControl = new ModifyControl({
      layer: this.olOverlayLayer,
      drawStyle: (olFeature: OlFeature, resolution: number) => {
        const style = this.drawStyle;
        this.updateDrawStyleWithDrawGuide(style, resolution);
        return style;
      }
    });
  }

  /**
   * Toggle the proper control (draw or modify)
   */
  private toggleControl() {
    this.deactivateControl();

    if (!this.value && this.geometryType) {
      this.activateControl(this.drawControl);
    } else {
      this.activateControl(this.modifyControl);
    }
  }

  /**
   * Activate a given control
   * @param control Control
   */
  private activateControl(control: DrawControl | ModifyControl) {
    this.activeControl = control;
    this.olGeometryEnds$$ = control.end$
      .subscribe((olGeometry: OlGeometry) => this.onOlGeometryEnds(olGeometry));
    if (this.measure === true && control === this.drawControl) {
      this.olGeometryChanges$$ = control.changes$
        .subscribe((olGeometry: OlGeometry) => this.onOlGeometryChanges(olGeometry));
    }
    control.setOlMap(this.map.ol);
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
  private onOlGeometryChanges(olGeometry: OlGeometry) {
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
    if (olGeometry === undefined) {
      return;
    }
    const value = this.olGeoJSON.writeGeometryObject(olGeometry, {
      featureProjection: this.map.projection,
      dataProjection: 'EPSG:4326'
    });
    this.writeValue(value);
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
    olFeature.setStyle(this.overlayStyle);
    this.olOverlaySource.clear();
    this.olOverlaySource.addFeature(olFeature);
  }

  /**
   * Create the measure tooltip
   */
  private createMeasureTooltip(): OlOverlay {
    this.olTooltip = new OlOverlay({
      element: document.createElement('div'),
      offset: [-30, -10],
      className: [
        'igo-map-tooltip',
        'igo-map-tooltip-measure'
      ].join(' '),
      stopEvent: false
    });
  }

  /**
   * Update the measure tooltip of an OL geometry
   * @param olGeometry OL Geometry
   */
  private updateMeasureTooltip(olGeometry: OlGeometry) {
    const measure = measureOlGeometry(olGeometry, this.map.projection);
    const lengths = measure.lengths;
    const lastIndex = olGeometry.getType() === 'Polygon' ? lengths.length - 2 : lengths.length - 1;
    const lastLength = lengths[lastIndex];

    const olMidpoints = updateOlGeometryMidpoints(olGeometry);
    const olLastMidpoint = olMidpoints[lastIndex];
    if (olMidpoints.length === 0 || olLastMidpoint === undefined) {
      this.removeMeasureTooltip();
      return;
    }

    this.olTooltip.setPosition(olLastMidpoint.flatCoordinates);

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
  private updateDrawStyleWithDrawGuide(olStyle: OlStyle, resolution: number) {
    if (this.isStyleWithRadius(olStyle)) {
      const drawGuide = this.drawGuide;
      let radius;
      if (!drawGuide || drawGuide < 0) {
        radius = this.defaultDrawStyleRadius;
      } else {
        radius = drawGuide > 0 ? drawGuide / resolution : drawGuide;
      }
      olStyle.getImage().setRadius(radius);
    }
  }

  /**
   * Returns wether a given Open Layers style has a radius property that can be set (used to set draw guide)
   * @param olStyle The style on which to perform the check
   */
  private isStyleWithRadius(olStyle: OlStyle): boolean {
    return olStyle.getImage && olStyle.getImage().setRadius;
  }
}
