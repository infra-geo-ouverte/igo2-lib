import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { IgoLanguageModule } from '@igo2/core/language';

@Component({
  selector: 'igo-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class ConfirmDialogComponent {
  dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);

  public confirmMessage: string;
  public titleKey = 'igo.common.confirmDialog.title';
  public proccessKey = 'igo.common.confirmDialog.confirmBtn';
  public cancelKey = 'igo.common.confirmDialog.cancelBtn';
}
