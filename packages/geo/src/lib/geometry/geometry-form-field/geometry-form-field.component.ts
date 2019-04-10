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

  geometryType$: BehaviorSubject<OlGeometryType> = new BehaviorSubject(undefined);
  drawGuide$: BehaviorSubject<number> = new BehaviorSubject(0);
  value$: BehaviorSubject<GeoJSONGeometry> = new BehaviorSubject(undefined);

  private value$$: Subscription;

  /**
   * The field's form control
   */
  @Input() formControl: FormControl;

  /**
   * The map to draw the geometry on
   */
  @Input() map: IgoMap;

  /**
   * The geometry type
   */
  @Input() geometryType: OlGeometryType;

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
  @Input() drawGuide: number = 0;

  /**
   * Draw guide placeholder
   */
  @Input() drawGuidePlaceholder: string = '';

  /**
   * The geometry type model
   */
  set geometryTypeModel(value: OlGeometryType) {this.geometryType$.next(value); }
  get geometryTypeModel(): OlGeometryType { return this.geometryType$.value; }

  /**
   * The draw guide model
   */
  set drawGuideModel(value: number) {this.drawGuide$.next(value); }
  get drawGuideModel(): number { return this.drawGuide$.value; }

  constructor(private cdRef: ChangeDetectorRef) {}

  /**
   * Set up a value stream
   * @internal
   */
  ngOnInit() {
    this.geometryType$.next(this.geometryType);
    this.drawGuide$.next(this.drawGuide);
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

  onGeometryTypeChange(geometryType: OlGeometryType) {
    if (this.value$.value !== undefined) {
      return;
    }
    this.geometryType$.next(geometryType);
  }

  onDrawGuideChange(value: number) {
    this.drawGuide$.next(value);
  }

}
