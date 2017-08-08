import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'igo-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {

  public confirmMessage: string;

  constructor(public dialogRef: MdDialogRef<ConfirmDialogComponent>) {}

}
