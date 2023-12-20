import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { TranslateModule } from '@ngx-translate/core';

export interface DialogData {
  label: string;
}

@Component({
  selector: 'igo-draw-popup-component',
  templateUrl: './draw-layer-popup.component.html',
  styleUrls: ['./draw-layer-popup.component.scss'],
  standalone: true,
  imports: [
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    MatButtonModule,
    TranslateModule
  ]
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
