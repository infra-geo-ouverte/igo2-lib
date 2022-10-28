import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

import { DrawStyleService, FontType } from '../../draw';

export interface StyleModalData {
  fillColor: string;
  strokeColor: string;
  fontSize: string;
  fontStyle: FontType;
  offsetX: number;
  offsetY: number;
}

@Component({
  selector: 'igo-style-modal-component',
  templateUrl: './style-modal.component.html',
  styleUrls: ['./style-modal.component.scss']
})
export class StyleModalComponent implements OnInit {
  @Input() confirmFlag: boolean = false;

  public form: UntypedFormGroup;

  public styleModalData: StyleModalData;
  public linestringOnly: boolean;

  constructor(
    public dialogRef: MatDialogRef<StyleModalComponent>,
    private formBuilder: UntypedFormBuilder,
    private drawStyleService: DrawStyleService,
    @Inject(MAT_DIALOG_DATA) public data: { features }) {
      this.buildForm();
    }

  ngOnInit() {
    this.linestringOnly = true;
    for (const feature of this.data.features) {
      if (feature.geometry.type !== 'LineString') {
        this.linestringOnly = false;
      }
    }
    this.buildStyleData();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      fill: [''],
      stroke: ['']
    });
  }

  private buildStyleData() {
    this.styleModalData = {
      fillColor:
        this.data.features.length > 0
        ? this.data.features[0].properties.drawingStyle.fill
        : 'rgba(255,255,255,0.4)',
      strokeColor:
        this.data.features.length > 0
        ? this.data.features[0].properties.drawingStyle.stroke
        : 'rgba(143,7,7,1)',
      fontSize:
        this.data.features.length > 0
        ? this.data.features[0].properties.fontStyle
            .split(' ')[0]
            .replace('px', '')
        : '20',
      fontStyle:
        this.data.features.length > 0
        ? this.data.features[0].properties.fontStyle.substring(
            this.data.features[0].properties.fontStyle.indexOf(' ') + 1)
        : FontType.Arial,
      offsetX:
        this.data.features.length > 0
        ? this.data.features[0].properties.offsetX
        : this.drawStyleService.getOffsetX(),
      offsetY:
        this.data.features.length > 0
        ? this.data.features[0].properties.offsetY
        : this.drawStyleService.getOffsetY()
    };
    this.form.controls['fill'].markAsUntouched();
    this.form.controls['stroke'].markAsUntouched();
  }

  get allFontStyles(): string[] {
    return Object.values(FontType);
  }

  getFeatureFontSize(): string {
    if (!this.styleModalData.fontSize) {
      return this.data.features.length > 0
      ? this.data.features[0].properties.fontStyle
          .split(' ')[0]
          .replace('px', '')
      : '20';
    } else {
      return this.styleModalData.fontSize;
    }
  }

  getFeatureFontStyle() {
    if (!this.styleModalData.fontStyle) {
      return this.data.features.length > 0
      ? this.data.features[0].properties.fontStyle.substring(
        this.data.features[0].properties.fontStyle.indexOf(' ') + 1
        )
      : FontType.Arial;
    } else {
      return this.styleModalData.fontStyle;
    }
  }

  getFeatureFillColor() {
    if (!this.styleModalData.fillColor) {
      return this.data.features.length > 0
        ? this.data.features[0].properties.drawingStyle.fill
        : 'rgba(255,255,255,0.4)';
    } else {
      return this.styleModalData.fillColor;
    }
  }

  getFeatureStrokeColor() {
    if (!this.styleModalData.strokeColor) {
      return this.data.features.length > 0
        ? this.data.features[0].properties.drawingStyle.stroke
        : 'rgba(143,7,7,1)';
    } else {
      return this.styleModalData.strokeColor;
    }
  }

  getFeatureOffsetX() {
    if (!this.styleModalData.offsetX) {
      return this.data.features.length > 0
        ? this.data.features[0].properties.offsetX
        : this.drawStyleService.getOffsetX();
    } else {
      return this.styleModalData.offsetX;
    }
  }

  getFeatureOffsetY() {
    if (!this.styleModalData.offsetY) {
      return this.data.features.length > 0
      ? this.data.features[0].properties.offsetY
      : '0';
    } else {
      this.styleModalData.offsetY;
    }
  }

  cancelDrawing() {
    this.dialogRef.close();
  }

  confirm() {
    this.confirmFlag = true;
    this.dialogRef.close(this.styleModalData);
  }
}
