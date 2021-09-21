import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  label: string;
}

@Component({
    selector: 'igo-draw-popup-component',
    templateUrl: './draw-popup.component.html',
    styleUrls: ['./draw-popup.component.scss'],
  })
  export class DrawPopupComponent {

    constructor(
      public dialogRef: MatDialogRef<DrawPopupComponent>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    noLabel() {
      this.dialogRef.close();
    }
  }
