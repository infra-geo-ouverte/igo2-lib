import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, Subscription } from 'rxjs';

import OlGeometryType from 'ol/geom/GeometryType';
import { Style as OlStyle } from 'ol/style';

import { FormFieldComponent } from '@igo2/common';

import { IgoMap } from '../../map';
import { GeoJSONGeometry } from '../shared/geometry.interfaces';

/**
 * This input allows a user to draw a new geometry or to edit
 * an existing one on a map.
 */
@FormFieldComponent('geometry')
@Component({
  selector: 'igo-geometry-form-field',
  templateUrl: './geometry-form-field.component.html',
  styleUrls: ['./geometry-form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryFormFieldComponent implements OnInit, OnDestroy {

  readonly value$: BehaviorSubject<GeoJSONGeometry> = new BehaviorSubject(undefined);

  private value$$: Subscription;

  /**
   * The field's form control
   */
  @Input() formControl: FormControl;

  /**
   * The map to draw the geometry on
   */
  @Input() map: IgoMap;

  @Input()
  set geometryType(value: OlGeometryType) { this.geometryType$.next(value); }
  get geometryType(): OlGeometryType { return this.geometryType$.value; }
  readonly geometryType$: BehaviorSubject<OlGeometryType> = new BehaviorSubject(undefined);

  /**
   * Whether a geometry type toggle should be displayed
   */
  @Input() geometryTypeField: boolean = false;

  /**
   * Available geometry types
   */
  @Input() geometryTypes: string[] = ['Point', 'LineString', 'Polygon'];

  /**
   * Whether a draw guide field should be displayed
   */
  @Input() drawGuideField: boolean = false;

  /**
   * The drawGuide around the mouse pointer to help drawing
   */
  @Input()
  set drawGuide(value: number) { this.drawGuide$.next(value); }
  get drawGuide(): number { return this.drawGuide$.value; }
  readonly drawGuide$: BehaviorSubject<number> = new BehaviorSubject(0);

  /**
   * Draw guide placeholder
   */
  @Input() drawGuidePlaceholder: string = '';

  /**
   * Whether a measure tooltip should be displayed
   */
  @Input() measure: boolean = false;

  /**
   * Style for the draw control (applies while the geometry is being drawn)
   */
  @Input() drawStyle: OlStyle;

  /**
   * Style for the overlay layer (applies once the geometry is added to the map)
   * If not specified, drawStyle applies
   */
  @Input() overlayStyle: OlStyle;

  constructor(private cdRef: ChangeDetectorRef) {}

  /**
   * Set up a value stream
   * @internal
   */
  ngOnInit() {
    this.value$.next(this.formControl.value ? this.formControl.value : undefined);
    this.value$$ = this.formControl.valueChanges.subscribe((value: GeoJSONGeometry) => {
      this.value$.next(value ? value : undefined);
    });
  }

  /**
   * Unsubscribe to the value stream
   * @internal
   */
  ngOnDestroy() {
    this.value$$.unsubscribe();
  }
}
