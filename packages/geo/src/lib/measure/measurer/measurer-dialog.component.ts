import { Component, inject } from '@angular/core';
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
  imports: [
    MatDialogTitle,
    MatDialogContent,
    IgoLanguageModule,
    MeasureFormatPipe
  ]
})
export class MeasurerDialogComponent {
  dialogRef = inject<MatDialogRef<MeasurerDialogComponent>>(MatDialogRef);
  data = inject<MeasurerDialogData>(MAT_DIALOG_DATA);

  measureAreaUnit = MeasureAreaUnit;

  measureLengthUnit = MeasureLengthUnit;

  onNoClick(): void {
    this.dialogRef.close();
  }
}
