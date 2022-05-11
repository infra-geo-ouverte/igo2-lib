import { Component, Inject, Input } from '@angular/core';
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

    @Input() confirmFlag: boolean = false; 

    constructor(
      public dialogRef: MatDialogRef<DrawPopupComponent>,
      @Inject(MAT_DIALOG_DATA) public data: {currentLabel: string}) {}

    noLabel() {
      this.dialogRef.close();
    }
    confirm(labelString: string){
      this.confirmFlag = true;
      this.dialogRef.close(labelString);
    }
  }
