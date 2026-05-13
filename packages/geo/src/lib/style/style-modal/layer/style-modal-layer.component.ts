import { KeyValuePipe } from '@angular/common';
import { Component, OnInit, inject, model } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ColorPickerFormFieldComponent } from '@igo2/common/color';
import { IgoLanguageModule } from '@igo2/core/language';

import Feature from 'ol/Feature';
import { asArray as ColorAsArray, toString } from 'ol/color';
import Geometry, { Type } from 'ol/geom/Geometry';
import { FlatStyle } from 'ol/style/flat';

import { VectorLayer } from '../../../layer/shared/layers/vector-layer';
import { VectorTileLayer } from '../../../layer/shared/layers/vectortile-layer';
import { isOlFlatStyleLike } from '../../shared/style.guards';
import { AnyStyle } from '../../shared/style.types';
import {
  LayerMatDialogData,
  StyleModalLayerData
} from '../shared/style-modal.interface';

@Component({
  selector: 'igo-style-modal-layer',
  templateUrl: './style-modal-layer.component.html',
  styleUrls: ['./style-modal-layer.component.scss'],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    ColorPickerFormFieldComponent,
    MatDialogActions,
    MatButtonModule,
    IgoLanguageModule,
    MatInputModule,
    MatSelectModule,
    KeyValuePipe
  ]
})
export class StyleModalLayerComponent implements OnInit {
  dialogRef = inject<MatDialogRef<StyleModalLayerComponent>>(MatDialogRef);
  private formBuilder = inject(UntypedFormBuilder);
  data = inject<LayerMatDialogData>(MAT_DIALOG_DATA);
  confirmFlag = model(false);
  public form: UntypedFormGroup;
  public geometryTypes = new Map<Type, number>();
  public featuresProperties = new Map<string, number>();
  public mostFrequentGeometryType: Type;
  public showForm = {
    fill: true,
    stroke: true,
    width: true,
    fields: true,
    radius: false
  };
  private initialLayerStyle: AnyStyle;
  private defaultValues: StyleModalLayerData = {
    fillColor: 'rgba(255,255,255,0.4)',
    strokeColor: 'rgba(143,7,7,1)',
    strokeWidth: 3,
    field: '_mapTitle',
    radius: 3
  };
  get style(): AnyStyle {
    return this.data.layer.style;
  }
  set style(value: AnyStyle) {
    this.data.layer.style = value;
  }
  isOlFlatStyleLike(): boolean {
    return isOlFlatStyleLike(this.style);
  }

  ngOnInit() {
    let features: Feature<Geometry>[] = [];
    if (this.data.layer instanceof VectorLayer) {
      features = this.data.layer.ol.getSource().getFeatures();
    } else if (this.data.layer instanceof VectorTileLayer) {
      features = this.data.layer.ol.getFeaturesInExtent(
        this.data.layer.map.viewController.getExtent()
      );
    }
    this.initialLayerStyle = JSON.parse(JSON.stringify(this.style));
    this.computeInfoFromFeatures(features);
    this.buildForm();
  }
  private computeInfoFromFeatures(olFeatures: Feature<Geometry>[]): void {
    olFeatures.forEach((olFeature) => {
      const type = olFeature.getGeometry()?.getType();
      if (type) {
        const current = this.geometryTypes.get(type) ?? 0;
        this.geometryTypes.set(type, current + 1);
      }
      const properties = olFeature.getProperties();
      Object.keys(properties).forEach((propName) => {
        if (propName === 'geometry' || propName.startsWith('_')) return;
        const currentPropCount = this.featuresProperties.get(propName) ?? 0;
        this.featuresProperties.set(propName, currentPropCount + 1);
      });
    });
    let maxCount = 0;
    this.geometryTypes.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        this.mostFrequentGeometryType = type;
      }
    });
    switch (this.mostFrequentGeometryType) {
      case 'Point':
      case 'MultiPoint':
      case 'Circle':
        this.showForm = {
          fill: true,
          stroke: true,
          width: true,
          fields: true,
          radius: true
        };
        break;
      case 'Polygon':
      case 'MultiPolygon':
        this.showForm = {
          fill: true,
          stroke: true,
          width: true,
          fields: true,
          radius: false
        };
        break;
      case 'LineString':
      case 'MultiLineString':
        this.showForm = {
          fill: false,
          stroke: true,
          width: true,
          fields: true,
          radius: false
        };
        break;
      default:
        break;
    }
  }
  private buildForm() {
    const initialValues = Object.assign(
      {},
      this.defaultValues,
      this.getInputsFromLayerFlatStyle()
    );
    this.form = this.formBuilder.group({
      fillColor: [initialValues.fillColor],
      strokeColor: [initialValues.strokeColor],
      strokeWidth: [initialValues.strokeWidth],
      field: [initialValues.field],
      radius: [initialValues.radius]
    });

    this.form.valueChanges.subscribe((vc) => this.setLayerFlatStyle(vc));
  }

  private getInputsFromLayerFlatStyle(): StyleModalLayerData {
    const olFlatStyle: FlatStyle = this.style as FlatStyle;
    const rv: StyleModalLayerData = {
      field: this.extractPropertyName(olFlatStyle['text-value'])
    };
    switch (this.mostFrequentGeometryType) {
      case 'Point':
      case 'MultiPoint':
      case 'Circle':
        Object.assign(rv, {
          fillColor: toString(ColorAsArray(olFlatStyle['circle-fill-color'])),
          strokeColor: toString(
            ColorAsArray(olFlatStyle['circle-stroke-color'])
          ),
          strokeWidth: olFlatStyle['circle-stroke-width'],
          radius: olFlatStyle['circle-radius']
        });
        break;
      case 'Polygon':
      case 'MultiPolygon':
        Object.assign(rv, {
          fillColor: toString(ColorAsArray(olFlatStyle['fill-color'])),
          strokeColor: toString(ColorAsArray(olFlatStyle['stroke-color'])),
          strokeWidth: olFlatStyle['stroke-width']
        });
        break;
      case 'LineString':
      case 'MultiLineString':
        Object.assign(rv, {
          strokeColor: toString(ColorAsArray(olFlatStyle['stroke-color'])),
          strokeWidth: olFlatStyle['stroke-width']
        });
        break;
      default:
        break;
    }

    return rv;
  }

  private setLayerFlatStyle(data: StyleModalLayerData) {
    const rv: FlatStyle = {
      'stroke-color': data.strokeColor,
      'stroke-width': data.strokeWidth,

      'fill-color': data.fillColor,

      'circle-radius': data.radius,
      'circle-stroke-color': data.strokeColor,
      'circle-stroke-width': data.strokeWidth,
      'circle-fill-color': data.fillColor,

      'text-value': ['case', ['has', data.field], ['get', data.field], ''],
      'text-offset-x': 5,
      'text-offset-y': -5,
      'text-font': '12px Calibri,sans-serif',
      'text-fill-color': '#000',
      'text-stroke-color': '#fff',
      'text-stroke-width': 3,
      'text-overflow': true
    };

    this.style = rv;
  }

  cancel() {
    this.dialogRef.close();
    this.data.layer.style = this.initialLayerStyle;
  }
  confirm() {
    this.confirmFlag.set(true);
    this.dialogRef.close();
  }
  openPicker() {
    this.dialogRef.disableClose = true;
  }
  closePicker() {
    this.dialogRef.disableClose = false;
  }

  extractPropertyName(expression: unknown) {
    if (!Array.isArray(expression)) {
      return null;
    }

    for (const item of expression) {
      if (Array.isArray(item) && item[0] === 'get' && item[1]) {
        return item[1];
      }

      if (Array.isArray(item)) {
        const result = this.extractPropertyName(item);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }
}
