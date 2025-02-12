import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl
} from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IgoFormFieldComponent } from '@igo2/common/form';
import { IgoLanguageModule } from '@igo2/core/language';

import type { Type } from 'ol/geom/Geometry';
import { StyleLike as OlStyleLike } from 'ol/style/Style';

import { BehaviorSubject, Subscription } from 'rxjs';

import { IgoMap } from '../../map/shared/map';
import { GeoJSONGeometry } from '../shared/geometry.interfaces';
import { GeometryFormFieldInputComponent } from './geometry-form-field-input.component';

/**
 * This input allows a user to draw a new geometry or to edit
 * an existing one on a map.
 */
@IgoFormFieldComponent('geometry')
@Component({
    selector: 'igo-geometry-form-field',
    templateUrl: './geometry-form-field.component.html',
    styleUrls: ['./geometry-form-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        GeometryFormFieldInputComponent,
        FormsModule,
        ReactiveFormsModule,
        NgIf,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        AsyncPipe,
        IgoLanguageModule
    ]
})
export class GeometryFormFieldComponent implements OnInit, OnDestroy {
  readonly value$ = new BehaviorSubject<GeoJSONGeometry>(undefined);

  private value$$: Subscription;

  set drawControlIsActive(value: boolean) {
    this._drawControlIsActive = value;
    this.cdRef.detectChanges();
  }

  get drawControlIsActive(): boolean {
    return this._drawControlIsActive;
  }
  private _drawControlIsActive = true;

  set freehandDrawIsActive(value: boolean) {
    this._freehandDrawIsActive = value;
    this.cdRef.detectChanges();
  }

  get freehandDrawIsActive(): boolean {
    return this._freehandDrawIsActive;
  }
  private _freehandDrawIsActive = false;

  /**
   * The field's form control
   */
  @Input() formControl: UntypedFormControl;

  /**
   * The map to draw the geometry on
   */
  @Input() map: IgoMap;

  @Input()
  set geometryType(value: Type) {
    this.geometryType$.next(value);
  }
  get geometryType(): Type {
    return this.geometryType$.value;
  }
  readonly geometryType$ = new BehaviorSubject<Type>(undefined);

  /**
   * Whether a geometry type toggle should be displayed
   */
  @Input() geometryTypeField = false;

  /**
   * Available geometry types
   */
  @Input() geometryTypes: string[] = ['Point', 'LineString', 'Polygon'];

  /**
   * Whether a draw guide field should be displayed
   */
  @Input() drawGuideField = false;

  /**
   * The drawGuide around the mouse pointer to help drawing
   */
  @Input()
  set drawGuide(value: number) {
    this.drawGuide$.next(value);
  }
  get drawGuide(): number {
    return this.drawGuide$.value;
  }
  readonly drawGuide$ = new BehaviorSubject<number>(0);

  /**
   * Draw guide placeholder
   */
  @Input() drawGuidePlaceholder = '';

  /**
   * Whether a measure tooltip should be displayed
   */
  @Input() measure = false;

  /**
   * Control options
   */
  @Input() controlOptions: Record<string, any> = {};

  /**
   * Style for the draw control (applies while the geometry is being drawn)
   */
  @Input() drawStyle: OlStyleLike;

  /**
   * Style for the overlay layer (applies once the geometry is added to the map)
   * If not specified, drawStyle applies
   */
  @Input() overlayStyle: OlStyleLike;

  constructor(private cdRef: ChangeDetectorRef) {}

  /**
   * Set up a value stream
   * @internal
   */
  ngOnInit() {
    this.value$.next(
      this.formControl.value ? this.formControl.value : undefined
    );
    this.value$$ = this.formControl.valueChanges.subscribe(
      (value: GeoJSONGeometry) => {
        this.value$.next(value ? value : undefined);
      }
    );
  }

  /**
   * Unsubscribe to the value stream
   * @internal
   */
  ngOnDestroy() {
    this.value$$.unsubscribe();
  }
}
