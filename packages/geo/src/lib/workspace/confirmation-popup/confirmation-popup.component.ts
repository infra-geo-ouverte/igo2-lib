import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';

import { LanguageService } from '@igo2/core';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  type: string;
  cancel: boolean;
}

@Component({
    selector: 'igo-confirmation-popup-component',
    templateUrl: './confirmation-popup.component.html',
    styleUrls: ['./confirmation-popup.component.scss'],
    standalone: true,
    imports: [MatDialogContent, MatDialogActions, MatButtonModule]
})
export class ConfirmationPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationPopupComponent>,
    public languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: { type: string; cancel: boolean }
  ) {}

  cancelAction() {
    this.data.cancel = true;
    this.dialogRef.close(this.data.cancel);
  }

  confirmedAction() {
    this.data.cancel = false;
    this.dialogRef.close(this.data.cancel);
  }
}
