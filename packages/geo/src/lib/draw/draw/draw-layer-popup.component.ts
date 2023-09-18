import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  label: string;
}

@Component({
  selector: 'igo-draw-popup-component',
  templateUrl: './draw-layer-popup.component.html',
  styleUrls: ['./draw-layer-popup.component.scss']
})
export class DrawLayerPopupComponent {
  @Input() confirmFlag: boolean = false;

  constructor(public dialogRef: MatDialogRef<DrawLayerPopupComponent>) {}

  cancelDrawing() {
    this.dialogRef.close();
  }
  confirm(labelString: string) {
    this.confirmFlag = true;
    this.dialogRef.close(labelString);
  }
}
