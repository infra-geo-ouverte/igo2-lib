import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { SelectValueCheckRadioDialogComponent } from './select-value-check-radio-dialog.component';
import {
  Choice,
  SelectValueData,
  SelectValueDialogOptions
} from './select-value-dialog.interface';

@Injectable()
export class SelectValueDialogService {
  constructor(private dialog: MatDialog) {}

  public open(
    choices: Choice[],
    options?: SelectValueDialogOptions
  ): Observable<any> {
    const data: SelectValueData = {
      choices,
      ...options
    };

    const dialogRef = this.dialog.open(SelectValueCheckRadioDialogComponent, {
      disableClose: false,
      data
    });
    return dialogRef.afterClosed();
  }
}
