import { Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule } from '@igo2/core/language';

export interface DialogData {
  label: string;
}

@Component({
  selector: 'igo-draw-popup-component',
  templateUrl: './draw-layer-popup.component.html',
  styleUrls: ['./draw-layer-popup.component.scss'],
  imports: [
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class DrawLayerPopupComponent {
  dialogRef = inject<MatDialogRef<DrawLayerPopupComponent>>(MatDialogRef);

  @Input() confirmFlag = false;

  cancelDrawing() {
    this.dialogRef.close();
  }
  confirm(labelString: string) {
    this.confirmFlag = true;
    this.dialogRef.close(labelString);
  }
}
