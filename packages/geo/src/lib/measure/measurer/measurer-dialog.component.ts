import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { IgoLanguageModule } from '@igo2/core/language';

import { MeasureAreaUnit, MeasureLengthUnit } from '../shared/measure.enum';
import { MeasurerDialogData } from '../shared/measure.interfaces';
import { MeasureFormatPipe } from './measure-format.pipe';

@Component({
  selector: 'igo-measurer-dialog',
  templateUrl: 'measurer-dialog.component.html',
  styleUrls: ['./measurer-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    NgIf,
    IgoLanguageModule,
    MeasureFormatPipe
  ]
})
export class MeasurerDialogComponent {
  measureAreaUnit = MeasureAreaUnit;

  measureLengthUnit = MeasureLengthUnit;

  constructor(
    public dialogRef: MatDialogRef<MeasurerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MeasurerDialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
