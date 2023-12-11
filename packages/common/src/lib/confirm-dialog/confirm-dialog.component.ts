import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'igo-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  public confirmMessage: string;
  public titleKey: string = 'igo.common.confirmDialog.title';
  public proccessKey: string = 'igo.common.confirmDialog.confirmBtn';
  public cancelKey: string = 'igo.common.confirmDialog.cancelBtn';

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}
}
