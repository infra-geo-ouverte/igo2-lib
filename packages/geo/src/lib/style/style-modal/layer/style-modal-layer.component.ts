import { Component, Input, OnInit, inject } from '@angular/core';
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

import { ColorPickerFormFieldComponent } from '@igo2/common/color';
import { IgoLanguageModule } from '@igo2/core/language';

import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';

import { VectorLayer } from '../../../layer/shared/layers/vector-layer';
import { VectorTileLayer } from '../../../layer/shared/layers/vectortile-layer';
import { GeostylerStyleInterfaceOptions } from '../../shared/layer/layer-style.interface';
import {
  LayerMatDialogData,
  StyleModalData
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
    IgoLanguageModule
  ]
})
export class StyleModalLayerComponent implements OnInit {
  dialogRef = inject<MatDialogRef<StyleModalLayerComponent>>(MatDialogRef);
  private formBuilder = inject(UntypedFormBuilder);
  data = inject<LayerMatDialogData>(MAT_DIALOG_DATA);

  @Input() confirmFlag = false;

  public form: UntypedFormGroup;

  public styleModalData: StyleModalData;
  public linestringOnly: boolean;

  private initialValues: StyleModalData;

  private defaultValues: StyleModalData = {
    fillColor: 'rgba(255,255,255,0.4)',
    strokeColor: 'rgba(143,7,7,1)'
  };

  get layerGsStyle(): GeostylerStyleInterfaceOptions {
    return this.data.layer.geostylerStyle$?.getValue();
  }

  set layerGsStyle(gsStyle: GeostylerStyleInterfaceOptions) {
    this.data.layer.geostylerStyle$.next(gsStyle);
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

    this.linestringOnly = features.every(
      (feature) =>
        feature.getGeometry()?.getType() === 'LineString' ||
        feature.getGeometry()?.getType() === 'MultiLineString'
    );

    this.buildStyleData();
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      fill: [this.getLayerFillColor()],
      stroke: [this.getLayerStrokeColor()]
    });
  }

  private buildStyleData() {
    this.styleModalData = {
      fillColor: this.getLayerFillColor(),
      strokeColor: this.getLayerStrokeColor()
    };
    this.initialValues = {
      fillColor: this.getLayerFillColor(),
      strokeColor: this.getLayerStrokeColor(),
      gsStyle: JSON.parse(JSON.stringify(this.layerGsStyle ?? {}))
    };
  }

  private getLayerFillColor(): string {
    if (this.layerGsStyle) {
      const colors = [];
      this.layerGsStyle.global.rules.map((rule) => ({
        ...rule,
        symbolizers: rule.symbolizers.map((symbolizer) => {
          if (symbolizer.kind === 'Fill' || symbolizer.kind === 'Mark') {
            colors.push(symbolizer.color);
          }
        })
      }));
      colors.push(this.defaultValues.fillColor);
      return colors[0];
    } else {
      return this.defaultValues.fillColor;
    }
  }

  private getLayerStrokeColor(): string {
    if (this.layerGsStyle) {
      const colors = [];
      this.layerGsStyle.global.rules.map((rule) => ({
        ...rule,
        symbolizers: rule.symbolizers.map((symbolizer) => {
          if (symbolizer.kind === 'Line') {
            colors.push(symbolizer.color);
          } else if (symbolizer.kind === 'Mark') {
            colors.push(symbolizer.strokeColor);
          }
        })
      }));
      colors.push(this.defaultValues.strokeColor);
      return colors[0];
    } else {
      return this.defaultValues.strokeColor;
    }
  }

  setLayerFillColor(event) {
    if (this.layerGsStyle) {
      const updated = { ...this.layerGsStyle };
      updated.global.rules = updated.global.rules.map((rule) => ({
        ...rule,
        symbolizers: rule.symbolizers.map((symbolizer) =>
          symbolizer.kind === 'Fill' || symbolizer.kind === 'Mark'
            ? { ...symbolizer, color: event }
            : symbolizer
        )
      }));
      this.layerGsStyle = updated;
    }
    this.styleModalData.fillColor = event;
    this.initialValues.fillColor = event;
  }

  setLayerStrokeColor(event) {
    if (this.layerGsStyle) {
      const updated = { ...this.layerGsStyle };
      updated.global.rules = updated.global.rules.map((rule) => ({
        ...rule,
        symbolizers: rule.symbolizers.map((symbolizer) => {
          if (symbolizer.kind === 'Line') {
            return { ...symbolizer, color: event };
          } else if (symbolizer.kind === 'Mark') {
            return { ...symbolizer, strokeColor: event };
          } else {
            return symbolizer;
          }
        })
      }));
      this.layerGsStyle = updated;
    }
    this.styleModalData.strokeColor = event;
    this.initialValues.strokeColor = event;
  }

  cancel() {
    this.dialogRef.close();
    if (this.initialValues.gsStyle) {
      this.layerGsStyle = this.initialValues.gsStyle;
    } else {
      this.setLayerFillColor(this.initialValues.fillColor);
      this.setLayerStrokeColor(this.initialValues.strokeColor);
    }
  }

  confirm() {
    this.confirmFlag = true;
    if (this.form.get('fill').value) {
      this.styleModalData.fillColor = this.form.get('fill').value;
    }

    if (this.form.get('stroke').value) {
      this.styleModalData.strokeColor = this.form.get('stroke').value;
    }
    this.dialogRef.close(this.styleModalData);
  }

  openPicker() {
    this.dialogRef.disableClose = true;
  }

  closePicker() {
    this.dialogRef.disableClose = false;
  }
}
