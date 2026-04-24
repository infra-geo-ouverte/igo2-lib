import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
  input
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
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    IgoLanguageModule,
    AsyncPipe
  ]
})
export class GeometryFormFieldComponent implements OnInit, OnDestroy {
  private cdRef = inject(ChangeDetectorRef);
  readonly value$: BehaviorSubject<GeoJSONGeometry> = new BehaviorSubject(
    undefined
  );

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
  readonly formControl = input<UntypedFormControl>(undefined);

  /**
   * The map to draw the geometry on
   */
  readonly map = input<IgoMap>(undefined);

  @Input()
  set geometryType(value: Type) {
    this.geometryType$.next(value);
  }
  get geometryType(): Type {
    return this.geometryType$.value;
  }
  readonly geometryType$: BehaviorSubject<Type> = new BehaviorSubject(
    undefined
  );

  /**
   * Whether a geometry type toggle should be displayed
   */
  readonly geometryTypeField = input<boolean>(false);

  /**
   * Available geometry types
   */
  readonly geometryTypes = input<string[]>(['Point', 'LineString', 'Polygon']);

  /**
   * Whether a draw guide field should be displayed
   */
  readonly drawGuideField = input<boolean>(false);

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
  readonly drawGuide$: BehaviorSubject<number> = new BehaviorSubject(0);

  /**
   * Draw guide placeholder
   */
  readonly drawGuidePlaceholder = input<string>('');

  /**
   * Whether a measure tooltip should be displayed
   */
  readonly measure = input<boolean>(false);

  /**
   * Control options
   */
  readonly controlOptions = input<{
    [key: string]: any;
  }>({});

  /**
   * Style for the draw control (applies while the geometry is being drawn)
   */
  readonly drawStyle = input<OlStyleLike>(undefined);

  /**
   * Style for the overlay layer (applies once the geometry is added to the map)
   * If not specified, drawStyle applies
   */
  readonly overlayStyle = input<OlStyleLike>(undefined);

  /**
   * Set up a value stream
   * @internal
   */
  ngOnInit() {
    const formControl = this.formControl();
    this.value$.next(formControl.value ? formControl.value : undefined);
    this.value$$ = formControl.valueChanges.subscribe(
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
