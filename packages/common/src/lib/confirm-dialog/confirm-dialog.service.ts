import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LanguageService } from '@igo2/core';

import { Observable } from 'rxjs';

import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable()
export class ConfirmDialogService {
  constructor(
    private dialog: MatDialog,
    private languageService: LanguageService
  ) {}

  public open(message: string): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage =
      this.languageService.translate.instant(message);

    return dialogRef.afterClosed();
  }
}
