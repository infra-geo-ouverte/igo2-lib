import { Component, Input } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface DialogData {
  label: string;
}

@Component({
    selector: 'igo-draw-popup-component',
    templateUrl: './draw-layer-popup.component.html',
    styleUrls: ['./draw-layer-popup.component.scss'],
    standalone: true,
    imports: [MatDialogContent, MatFormFieldModule, MatInputModule, MatDialogActions, MatButtonModule, TranslateModule]
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
