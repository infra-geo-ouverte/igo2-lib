import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LanguageService } from '@igo2/core';

export interface DialogData {
  type: string;
  cancel: boolean;
}

@Component({
  selector: 'igo-confirmation-popup-component',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss']
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
