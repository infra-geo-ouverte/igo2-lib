import { NgFor, NgIf } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ColorPickerFormFieldComponent } from '@igo2/common/color';
import { IgoLanguageModule } from '@igo2/core/language';

import { FontType } from '../../shared/font.enum';
import { DrawStyleService } from '../../style-service/draw-style.service';
import {
  DrawingMatDialogData,
  StyleModalData
} from '../shared/style-modal.interface';

@Component({
  selector: 'igo-style-modal-drawing',
  templateUrl: './style-modal-drawing.component.html',
  styleUrls: ['./style-modal-drawing.component.scss'],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatIconModule,
    ColorPickerFormFieldComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    MatDialogActions,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class StyleModalDrawingComponent implements OnInit {
  @Input() confirmFlag = false;

  public form: UntypedFormGroup;

  public styleModalData: StyleModalData;
  public linestringOnly: boolean;

  constructor(
    public dialogRef: MatDialogRef<StyleModalDrawingComponent>,
    private formBuilder: UntypedFormBuilder,
    private drawStyleService: DrawStyleService,
    @Inject(MAT_DIALOG_DATA) public data: DrawingMatDialogData
  ) {}

  ngOnInit() {
    this.linestringOnly = true;
    for (const feature of this.data.features) {
      if (feature.geometry.type !== 'LineString') {
        this.linestringOnly = false;
      }
    }
    this.buildStyleData();
    this.buildForm();
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      fill: [this.getFeatureFillColor()],
      stroke: [this.getFeatureStrokeColor()]
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
              this.data.features[0].properties.fontStyle.indexOf(' ') + 1
            )
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

  private getFeatureFillColor() {
    if (!this.styleModalData.fillColor) {
      return this.data.features.length > 0
        ? this.data.features[0].properties.drawingStyle.fill
        : 'rgba(255,255,255,0.4)';
    } else {
      return this.styleModalData.fillColor;
    }
  }

  private getFeatureStrokeColor() {
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
