import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';

import { LanguageService } from '@igo2/core/language';

export interface DialogData {
  type: string;
  cancel: boolean;
}

@Component({
  selector: 'igo-confirmation-popup-component',
  templateUrl: './confirmation-popup.component.html',
  styleUrls: ['./confirmation-popup.component.scss'],
  imports: [MatDialogContent, MatDialogActions, MatButtonModule]
})
export class ConfirmationPopupComponent {
  dialogRef = inject<MatDialogRef<ConfirmationPopupComponent>>(MatDialogRef);
  languageService = inject(LanguageService);
  data = inject<{
    type: string;
    cancel: boolean;
  }>(MAT_DIALOG_DATA);

  cancelAction() {
    this.data.cancel = true;
    this.dialogRef.close(this.data.cancel);
  }

  confirmedAction() {
    this.data.cancel = false;
    this.dialogRef.close(this.data.cancel);
  }
}
