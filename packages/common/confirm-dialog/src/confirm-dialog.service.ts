import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogOptions } from './confirm-dialog.interface';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private dialog = inject(MatDialog);

  public open(
    message: string,
    options?: ConfirmDialogOptions
  ): Observable<boolean> {
    const {
      title = 'igo.common.confirmDialog.title',
      modeYesNo = false,
      ...dialogConfig
    }: ConfirmDialogOptions = options ?? {};

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: false,
      maxWidth: 'min(80vw, 400px)',
      ...dialogConfig
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
