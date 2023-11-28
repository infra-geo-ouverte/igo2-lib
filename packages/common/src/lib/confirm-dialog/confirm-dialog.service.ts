import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable()
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  public open(
    message: string,
    title: string = 'igo.common.confirmDialog.title',
    modeYesNo: boolean = false
  ): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = message;
    dialogRef.componentInstance.titleKey = title;
    if (modeYesNo) {
      dialogRef.componentInstance.proccessKey = 'igo.common.confirmDialog.yes';
      dialogRef.componentInstance.cancelKey = 'igo.common.confirmDialog.no';
    }
    return dialogRef.afterClosed();
  }
}
