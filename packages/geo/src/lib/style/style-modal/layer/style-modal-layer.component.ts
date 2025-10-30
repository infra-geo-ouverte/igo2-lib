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
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { ColorPickerFormFieldComponent } from '@igo2/common/color';
import { IgoLanguageModule } from '@igo2/core/language';

import Feature from 'ol/Feature';
import Geometry, { Type } from 'ol/geom/Geometry';

import { VectorLayer } from '../../../layer/shared/layers/vector-layer';
import { VectorTileLayer } from '../../../layer/shared/layers/vectortile-layer';
import {
  HandledLayerStyle,
  LayerStyle
} from '../../shared/layer/layer-style.interface';
import {
  LayerRandomGsStyle,
  isEditableLayerStyle,
  isGeostylerLayerStyle
} from '../../shared/layer/layer-style.utils';
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

  private initialHandledLayerStyle: HandledLayerStyle;

  private defaultValues: StyleModalLayerData = {
    fillColor: 'rgba(255,255,255,0.4)',
    strokeColor: 'rgba(143,7,7,1)',
    strokeWidth: 3,
    field: '_mapTitle',
    radius: 3
  };

  get style(): LayerStyle {
    const ls = this.data.layer.style;
    return isEditableLayerStyle(ls)
      ? ls
      : {
          editable: true,
          type: 'Geostyler',
          style: LayerRandomGsStyle(
            this.defaultValues.field,
            Array.from(this.geometryTypes.keys())
          )
        };
  }

  set style(value: LayerStyle) {
    this.data.layer.style = value;
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
    this.form = this.formBuilder.group({
      fill: [this.getLayerFillColor()],
      stroke: [this.getLayerStrokeColor()],
      strokeWidth: [this.getLayerStrokeWidth()],
      field: [this.getLayerLabelField()],
      radius: [this.getLayerRadius()]
    });
    const layerStyle = this.data.layer.style;
    this.initialHandledLayerStyle = isGeostylerLayerStyle(layerStyle)
      ? JSON.parse(JSON.stringify(layerStyle))
      : layerStyle;
  }

  private getLayerStyleValue<T>(
    extractor: (s: any) => T | undefined,
    defaultValue: T
  ): T {
    if (!this.style) return defaultValue;
    for (const rule of this.style.style?.rules ?? []) {
      for (const s of rule.symbolizers ?? []) {
        const v = extractor(s);
        if (v !== undefined && v !== null) return v;
      }
    }
    return defaultValue;
  }

  private getLayerFillColor(): string {
    return this.getLayerStyleValue<string>(
      (s) => (s.kind === 'Fill' || s.kind === 'Mark' ? s.color : undefined),
      this.defaultValues.fillColor
    );
  }

  private getLayerStrokeColor(): string {
    return this.getLayerStyleValue<string>(
      (s) =>
        s.kind === 'Line'
          ? s.color
          : s.kind === 'Mark'
            ? s.strokeColor
            : s.kind === 'Fill'
              ? s.outlineColor
              : undefined,
      this.defaultValues.strokeColor
    );
  }

  private getLayerStrokeWidth(): number {
    return this.getLayerStyleValue<number>(
      (s) =>
        s.kind === 'Line'
          ? s.width
          : s.kind === 'Mark'
            ? s.strokeWidth
            : s.kind === 'Fill'
              ? s.outlineWidth
              : undefined,
      this.defaultValues.strokeWidth
    );
  }
  private getLayerLabelField(): string {
    return this.getLayerStyleValue<string>(
      (s) =>
        s.kind === 'Text' && s.label != null
          ? s.label.toString().replace('{{', '').replace('}}', '')
          : undefined,
      this.defaultValues.field
    );
  }
  private getLayerRadius(): number {
    return this.getLayerStyleValue<number>(
      (s) => (s.kind === 'Mark' ? s.radius : undefined),
      this.defaultValues.radius
    );
  }

  private updateLayerSymbolizers(updater: (symbolizer: any) => any): void {
    if (!this.style) return;
    const updated = {
      ...this.style,
      style: {
        ...this.style.style,
        rules: (this.style.style.rules ?? []).map((rule) => ({
          ...rule,
          symbolizers: (rule.symbolizers ?? []).map((sym) => {
            const newSym = updater(sym);
            return newSym === undefined ? sym : newSym;
          })
        }))
      }
    };
    this.style = updated;
  }

  setLayerFillColor(event: string) {
    this.updateLayerSymbolizers((sym) =>
      sym.kind === 'Fill' || sym.kind === 'Mark'
        ? { ...sym, color: event }
        : undefined
    );
  }
  setLayerStrokeColor(event: string) {
    this.updateLayerSymbolizers((sym) => {
      if (sym.kind === 'Line') return { ...sym, color: event };
      if (sym.kind === 'Mark') return { ...sym, strokeColor: event };
      if (sym.kind === 'Fill') return { ...sym, outlineColor: event };
      return undefined;
    });
  }
  setLayerStrokeWidth(value: number | string) {
    const width = Number(value);
    this.updateLayerSymbolizers((sym) => {
      if (sym.kind === 'Line') return { ...sym, width };
      if (sym.kind === 'Mark') return { ...sym, strokeWidth: width };
      if (sym.kind === 'Fill') return { ...sym, outlineWidth: width };
      return undefined;
    });
  }

  setLayerFieldLabel(event: MatSelectChange) {
    const label = event.value;
    this.updateLayerSymbolizers((sym) =>
      sym.kind === 'Text' ? { ...sym, label: `{{${label}}}` } : undefined
    );
  }
  setLayerRadius(value: number | string) {
    const radius = Number(value);
    this.updateLayerSymbolizers((sym) =>
      sym.kind === 'Mark' ? { ...sym, radius } : undefined
    );
  }

  cancel() {
    this.dialogRef.close();
    this.data.layer.style = this.initialHandledLayerStyle;
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
}
