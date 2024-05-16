import { Component } from '@angular/core';
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
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class ConfirmDialogComponent {
  public confirmMessage: string;
  public titleKey: string = 'igo.common.confirmDialog.title';
  public proccessKey: string = 'igo.common.confirmDialog.confirmBtn';
  public cancelKey: string = 'igo.common.confirmDialog.cancelBtn';

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}
}
