import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { SelectValueDialogComponent } from './select-value-dialog.component';
import { Choice } from './select-value-dialog.interface';

@Injectable()
export class SelectValueDialogService {
  constructor(private dialog: MatDialog) {}

  public open(
    choices: Choice[],
    title?: string,
    processButtonText?: string,
    cancelButtonText?: string,
    multiple: boolean = true
  ): Observable<any> {
    const dialogRef = this.dialog.open(SelectValueDialogComponent, {
      disableClose: false,
      data: { choices, title, processButtonText, cancelButtonText, multiple }
    });
    return dialogRef.afterClosed();
  }
}
