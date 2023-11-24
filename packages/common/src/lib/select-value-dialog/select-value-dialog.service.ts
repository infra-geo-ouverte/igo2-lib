import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { SelectValueCheckRadioDialogComponent } from './select-value-check-radio-dialog.component';
import { SelectValueDialogType } from './select-value-dialog.enums';
import { Choice } from './select-value-dialog.interface';

@Injectable()
export class SelectValueDialogService {
  constructor(private dialog: MatDialog) {}

  public open(
    choices: Choice[],
    type?: SelectValueDialogType,
    selectMultiple: boolean = true,
    title?: string,
    processButtonText?: string,
    cancelButtonText?: string
  ): Observable<any> {
    let dialogComponent;
    let multiple = selectMultiple;
    switch (type) {
      case SelectValueDialogType.Checkbox:
        dialogComponent = SelectValueCheckRadioDialogComponent;
        break;
      case SelectValueDialogType.Radio:
        dialogComponent = SelectValueCheckRadioDialogComponent;
        multiple = false;
        break;
      default:
        dialogComponent = SelectValueCheckRadioDialogComponent;
        break;
    }

    const dialogRef = this.dialog.open(dialogComponent, {
      disableClose: false,
      data: { choices, title, processButtonText, cancelButtonText, multiple }
    });
    return dialogRef.afterClosed();
  }
}
