import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MeasurerDialogData } from '../shared/measure.interfaces';

import { MeasureAreaUnit, MeasureLengthUnit } from '../shared/measure.enum';

@Component({
  selector: 'igo-measurer-dialog',
  templateUrl: 'measurer-dialog.component.html',
  styleUrls: ['./measurer-dialog.component.scss']
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
