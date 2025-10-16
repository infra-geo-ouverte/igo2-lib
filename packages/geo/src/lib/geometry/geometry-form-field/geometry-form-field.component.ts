import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IgoFormFieldComponent } from '@igo2/common/form';
import { IgoLanguageModule } from '@igo2/core/language';

import type { Type } from 'ol/geom/Geometry';
import { StyleLike as OlStyleLike } from 'ol/style/Style';

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
    IgoLanguageModule
  ]
})
export class GeometryFormFieldComponent {
  /**
   * The field's form control
   */
  readonly formControl = input<FormControl<GeoJSONGeometry>>(undefined);

  /**
   * The map to draw the geometry on
   */
  readonly map = input<IgoMap>(undefined);

  readonly geometryType = input<Type>(undefined);

  /**
   * Whether a geometry type toggle should be displayed
   */
  readonly geometryTypeField = input(false);

  /**
   * Available geometry types
   */
  readonly geometryTypes = input<string[]>(['Point', 'LineString', 'Polygon']);

  /**
   * Whether a draw guide field should be displayed
   */
  readonly drawGuideField = input(false);
  /**
   * The drawGuide around the mouse pointer to help drawing
   */
  readonly drawGuide = input(0);

  /**
   * Draw guide placeholder
   */
  readonly drawGuidePlaceholder = input('');

  /**
   * Whether a measure tooltip should be displayed
   */
  readonly measure = input(false);

  /**
   * Control options
   */
  readonly controlOptions = input<Record<string, any>>({});

  /**
   * Style for the draw control (applies while the geometry is being drawn)
   */
  readonly drawStyle = input<OlStyleLike>(undefined);

  /**
   * Style for the overlay layer (applies once the geometry is added to the map)
   * If not specified, drawStyle applies
   */
  readonly overlayStyle = input<OlStyleLike>(undefined);
}
