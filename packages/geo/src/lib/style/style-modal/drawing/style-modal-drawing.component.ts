import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

import { DrawStyleService } from '../../style-service/draw-style.service';
import { FontType } from '../../shared/font.enum';
import { DrawingMatDialogData, StyleModalData } from '../shared/style-modal.interface';
// import tinycolor from "tinycolor2";

@Component({
  selector: 'igo-style-modal-drawing',
  templateUrl: './style-modal-drawing.component.html',
  styleUrls: ['./style-modal-drawing.component.scss']
})
export class StyleModalDrawingComponent implements OnInit {
  @Input() confirmFlag: boolean = false;

  public form: UntypedFormGroup;

  public styleModalData: StyleModalData;
  public linestringOnly: boolean;

  constructor(
    public dialogRef: MatDialogRef<StyleModalDrawingComponent>,
    private formBuilder: UntypedFormBuilder,
    private drawStyleService: DrawStyleService,
    @Inject(MAT_DIALOG_DATA) public data: DrawingMatDialogData) {
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
      : this.drawStyleService.getOffsetY();
    } else {
      return this.styleModalData.offsetY;
    }
  }

  cancelDrawing() {
    this.dialogRef.close();
  }

  confirm() {
    this.confirmFlag = true;
    this.dialogRef.close(this.styleModalData);
  }

  handleColorClicked() {
    this.dialogRef.disableClose = true;
  }

  handleColorClosed() {
    setTimeout(() => {
      this.dialogRef.disableClose = false;
    }, 300);
  }
}
