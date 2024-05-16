import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogOptions } from './confirm-dialog.interface';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  public open(
    message: string,
    options?: ConfirmDialogOptions
  ): Observable<boolean> {
    const _options: ConfirmDialogOptions = {
      title: 'igo.common.confirmDialog.title',
      modeYesNo: false,
      ...options
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = message;
    dialogRef.componentInstance.titleKey = _options.title;
    if (_options.modeYesNo) {
      dialogRef.componentInstance.proccessKey = 'igo.common.confirmDialog.yes';
      dialogRef.componentInstance.cancelKey = 'igo.common.confirmDialog.no';
    }
    return dialogRef.afterClosed();
  }
}
