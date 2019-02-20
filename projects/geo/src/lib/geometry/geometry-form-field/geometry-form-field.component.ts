import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
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

  public geometryType$: BehaviorSubject<OlGeometryType> = new BehaviorSubject(undefined);
  public buffer$: BehaviorSubject<number> = new BehaviorSubject(0);
  public value$: BehaviorSubject<GeoJSONGeometry> = new BehaviorSubject(undefined);

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
  @Input()
  set geometryType(value: OlGeometryType) { this.geometryType$.next(value); }
  get geometryType(): OlGeometryType { return this.geometryType$.value; }

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

  /**
   * The buffer around the mouse pointer to help drawing
   */
  @Input()
  set buffer(value: number) { this.buffer$.next(value); }
  get buffer(): number { return this.buffer$.value; }

  onGeometryTypeChange(geometryType: OlGeometryType) {
    if (this.value$.value !== undefined) {
      return;
    }
    this.geometryType = geometryType;
  }

  onBufferChange(buffer: number) {
    this.buffer = buffer;
  }

}
